#!/usr/bin/env python3
import requests
import json
import time
import os
import uuid
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "http://localhost:8001"
API_BASE_URL = f"{BACKEND_URL}/api"

# Admin password for color management
ADMIN_PASSWORD = "80418914"

# Test results tracking
test_results = {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "tests": []
}

def run_test(test_name):
    """Decorator to run a test and track results"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            test_results["total"] += 1
            print(f"\n{'='*80}\nRunning test: {test_name}\n{'-'*80}")
            try:
                result = func(*args, **kwargs)
                test_results["passed"] += 1
                test_results["tests"].append({"name": test_name, "status": "PASSED"})
                print(f"✅ Test PASSED: {test_name}")
                return result
            except AssertionError as e:
                test_results["failed"] += 1
                test_results["tests"].append({"name": test_name, "status": "FAILED", "error": str(e)})
                print(f"❌ Test FAILED: {test_name}")
                print(f"Error: {str(e)}")
                return None
            except Exception as e:
                test_results["failed"] += 1
                test_results["tests"].append({"name": test_name, "status": "FAILED", "error": f"Unexpected error: {str(e)}"})
                print(f"❌ Test FAILED: {test_name}")
                print(f"Unexpected error: {str(e)}")
                return None
        return wrapper
    return decorator

@run_test("Health Check Endpoint")
def test_health_check():
    """Test the health check endpoint"""
    response = requests.get(f"{API_BASE_URL}/health")
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert "status" in data, "Response missing 'status' field"
    assert data["status"] == "healthy", f"Expected status 'healthy', got '{data['status']}'"
    assert "service" in data, "Response missing 'service' field"
    assert data["service"] == "skydiving-suit-customizer", f"Expected service 'skydiving-suit-customizer', got '{data['service']}'"
    
    return data

@run_test("Fabric Types Retrieval")
def test_get_fabric_types():
    """Test retrieving all fabric types"""
    response = requests.get(f"{API_BASE_URL}/fabric-types")
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert "fabric_types" in data, "Response missing 'fabric_types' field"
    assert isinstance(data["fabric_types"], list), "fabric_types should be a list"
    assert len(data["fabric_types"]) >= 4, f"Expected at least 4 fabric types, got {len(data['fabric_types'])}"
    
    # Check structure of fabric types
    for fabric_type in data["fabric_types"]:
        assert "id" in fabric_type, "Fabric type missing 'id' field"
        assert "name" in fabric_type, "Fabric type missing 'name' field"
        assert "pattern_type" in fabric_type, "Fabric type missing 'pattern_type' field"
    
    # Check specific fabric types
    fabric_ids = [ft["id"] for ft in data["fabric_types"]]
    expected_ids = ["tela1", "tela2", "tela3", "tela4"]
    for expected_id in expected_ids:
        assert expected_id in fabric_ids, f"Expected fabric type '{expected_id}' not found"
    
    return data["fabric_types"]

@run_test("All Colors Retrieval")
def test_get_all_colors():
    """Test retrieving all colors"""
    response = requests.get(f"{API_BASE_URL}/colors")
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert "colors" in data, "Response missing 'colors' field"
    assert isinstance(data["colors"], list), "colors should be a list"
    assert len(data["colors"]) > 0, "Expected at least one color"
    
    # Check structure of colors
    for color in data["colors"]:
        assert "id" in color, "Color missing 'id' field"
        assert "name" in color, "Color missing 'name' field"
        assert "hex_value" in color, "Color missing 'hex_value' field"
        assert "fabric_type" in color, "Color missing 'fabric_type' field"
    
    return data["colors"]

@run_test("Colors Retrieval by Fabric Type")
def test_get_colors_by_fabric_type():
    """Test retrieving colors by fabric type"""
    # Get all fabric types first
    fabric_types = test_get_fabric_types()
    
    for fabric_type in fabric_types:
        fabric_id = fabric_type["id"]
        response = requests.get(f"{API_BASE_URL}/colors/{fabric_id}")
        assert response.status_code == 200, f"Expected status code 200 for fabric type {fabric_id}, got {response.status_code}"
        
        data = response.json()
        assert "colors" in data, f"Response for fabric type {fabric_id} missing 'colors' field"
        assert isinstance(data["colors"], list), f"colors for fabric type {fabric_id} should be a list"
        
        # Check that all colors have the correct fabric_type
        for color in data["colors"]:
            assert color["fabric_type"] == fabric_id, f"Color {color['id']} has fabric_type {color['fabric_type']}, expected {fabric_id}"
    
    # Test with non-existent fabric type
    response = requests.get(f"{API_BASE_URL}/colors/nonexistent")
    assert response.status_code == 200, f"Expected status code 200 for non-existent fabric type, got {response.status_code}"
    data = response.json()
    assert "colors" in data, "Response missing 'colors' field"
    assert len(data["colors"]) == 0, f"Expected empty list for non-existent fabric type, got {len(data['colors'])} colors"
    
    return True

@run_test("Admin Color Management - Add Color (Valid Password)")
def test_admin_add_color_valid_password():
    """Test adding a color with valid admin password"""
    # Create a unique color ID to avoid conflicts
    color_id = f"test_color_{uuid.uuid4().hex[:8]}"
    
    payload = {
        "password": ADMIN_PASSWORD,
        "action": "add",
        "color": {
            "id": color_id,
            "name": "Test Purple",
            "hex_value": "#800080",
            "fabric_type": "tela1"
        }
    }
    
    response = requests.post(f"{API_BASE_URL}/admin/colors", json=payload)
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert "message" in data, "Response missing 'message' field"
    assert data["message"] == "Color added successfully", f"Expected message 'Color added successfully', got '{data['message']}'"
    
    # Verify the color was added
    response = requests.get(f"{API_BASE_URL}/colors/tela1")
    colors_data = response.json()
    added_color = next((c for c in colors_data["colors"] if c["id"] == color_id), None)
    assert added_color is not None, f"Added color {color_id} not found in colors list"
    assert added_color["name"] == "Test Purple", f"Expected name 'Test Purple', got '{added_color['name']}'"
    assert added_color["hex_value"] == "#800080", f"Expected hex_value '#800080', got '{added_color['hex_value']}'"
    
    return color_id

@run_test("Admin Color Management - Add Color (Invalid Password)")
def test_admin_add_color_invalid_password():
    """Test adding a color with invalid admin password"""
    payload = {
        "password": "wrong_password",
        "action": "add",
        "color": {
            "id": "test_invalid_color",
            "name": "Invalid Color",
            "hex_value": "#FFFFFF",
            "fabric_type": "tela1"
        }
    }
    
    response = requests.post(f"{API_BASE_URL}/admin/colors", json=payload)
    assert response.status_code == 403, f"Expected status code 403, got {response.status_code}"
    
    data = response.json()
    assert "detail" in data, "Response missing 'detail' field"
    assert data["detail"] == "Invalid admin password", f"Expected detail 'Invalid admin password', got '{data['detail']}'"
    
    return True

@run_test("Admin Color Management - Remove Color (Valid Password)")
def test_admin_remove_color_valid_password():
    """Test removing a color with valid admin password"""
    # First add a color to remove
    color_id = test_admin_add_color_valid_password()
    
    # Now remove it
    payload = {
        "password": ADMIN_PASSWORD,
        "action": "remove",
        "color_id": color_id
    }
    
    response = requests.post(f"{API_BASE_URL}/admin/colors", json=payload)
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert "message" in data, "Response missing 'message' field"
    assert data["message"] == "Color removed successfully", f"Expected message 'Color removed successfully', got '{data['message']}'"
    
    # Verify the color was removed
    response = requests.get(f"{API_BASE_URL}/colors/tela1")
    colors_data = response.json()
    removed_color = next((c for c in colors_data["colors"] if c["id"] == color_id), None)
    assert removed_color is None, f"Removed color {color_id} still found in colors list"
    
    return True

@run_test("Admin Color Management - Remove Color (Invalid Password)")
def test_admin_remove_color_invalid_password():
    """Test removing a color with invalid admin password"""
    # Add a color first
    color_id = test_admin_add_color_valid_password()
    
    # Try to remove with invalid password
    payload = {
        "password": "wrong_password",
        "action": "remove",
        "color_id": color_id
    }
    
    response = requests.post(f"{API_BASE_URL}/admin/colors", json=payload)
    assert response.status_code == 403, f"Expected status code 403, got {response.status_code}"
    
    data = response.json()
    assert "detail" in data, "Response missing 'detail' field"
    assert data["detail"] == "Invalid admin password", f"Expected detail 'Invalid admin password', got '{data['detail']}'"
    
    # Clean up - remove the color with valid password
    payload = {
        "password": ADMIN_PASSWORD,
        "action": "remove",
        "color_id": color_id
    }
    requests.post(f"{API_BASE_URL}/admin/colors", json=payload)
    
    return True

@run_test("Admin Color Management - Update Color (Valid Password)")
def test_admin_update_color_valid_password():
    """Test updating a color with valid admin password"""
    # First add a color to update
    color_id = test_admin_add_color_valid_password()
    
    # Now update it
    payload = {
        "password": ADMIN_PASSWORD,
        "action": "update",
        "color": {
            "id": color_id,
            "name": "Updated Purple",
            "hex_value": "#9932CC",
            "fabric_type": "tela1"
        }
    }
    
    response = requests.post(f"{API_BASE_URL}/admin/colors", json=payload)
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert "message" in data, "Response missing 'message' field"
    assert data["message"] == "Color updated successfully", f"Expected message 'Color updated successfully', got '{data['message']}'"
    
    # Verify the color was updated
    response = requests.get(f"{API_BASE_URL}/colors/tela1")
    colors_data = response.json()
    updated_color = next((c for c in colors_data["colors"] if c["id"] == color_id), None)
    assert updated_color is not None, f"Updated color {color_id} not found in colors list"
    assert updated_color["name"] == "Updated Purple", f"Expected name 'Updated Purple', got '{updated_color['name']}'"
    assert updated_color["hex_value"] == "#9932CC", f"Expected hex_value '#9932CC', got '{updated_color['hex_value']}'"
    
    # Clean up - remove the color
    payload = {
        "password": ADMIN_PASSWORD,
        "action": "remove",
        "color_id": color_id
    }
    requests.post(f"{API_BASE_URL}/admin/colors", json=payload)
    
    return True

@run_test("Order Creation with PDF Generation")
def test_create_order():
    """Test creating an order with PDF generation"""
    # Create a test order
    order_data = {
        "customer_info": {
            "name": "John Doe",
            "phone": "+1234567890",
            "email": "john.doe@example.com",
            "date": datetime.now().strftime("%Y-%m-%d")
        },
        "selections": [
            {
                "area_id": "area1",
                "fabric_type": "tela1",
                "color_id": "t1_blue",
                "color_hex": "#0066CC"
            },
            {
                "area_id": "area2",
                "fabric_type": "tela2",
                "color_id": "t2_red",
                "color_hex": "#FF0000"
            },
            {
                "area_id": "area3",
                "fabric_type": "tela3",
                "color_id": "t3_black",
                "color_hex": "#000000"
            }
        ]
    }
    
    response = requests.post(f"{API_BASE_URL}/orders", json=order_data)
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert "order_id" in data, "Response missing 'order_id' field"
    assert "pdf_ready" in data, "Response missing 'pdf_ready' field"
    assert data["pdf_ready"] is True, "PDF should be ready"
    
    order_id = data["order_id"]
    return order_id

@run_test("PDF Download Functionality")
def test_download_pdf():
    """Test downloading a PDF for an order"""
    # Create an order first
    order_id = test_create_order()
    
    # Now download the PDF
    response = requests.get(f"{API_BASE_URL}/orders/{order_id}/pdf")
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    assert response.headers["Content-Type"] == "application/pdf", f"Expected Content-Type 'application/pdf', got '{response.headers['Content-Type']}'"
    assert len(response.content) > 0, "PDF content should not be empty"
    
    # Test with non-existent order ID
    response = requests.get(f"{API_BASE_URL}/orders/nonexistent/pdf")
    assert response.status_code == 404, f"Expected status code 404 for non-existent order, got {response.status_code}"
    
    return True

def print_summary():
    """Print a summary of test results"""
    print("\n" + "="*80)
    print(f"TEST SUMMARY: {test_results['passed']}/{test_results['total']} tests passed")
    print("-"*80)
    
    for test in test_results["tests"]:
        status_symbol = "✅" if test["status"] == "PASSED" else "❌"
        print(f"{status_symbol} {test['name']}: {test['status']}")
        if test["status"] == "FAILED" and "error" in test:
            print(f"   Error: {test['error']}")
    
    print("="*80)
    print(f"RESULT: {'SUCCESS' if test_results['failed'] == 0 else 'FAILURE'}")
    print("="*80)

if __name__ == "__main__":
    print("Starting backend API tests...")
    
    # Run all tests
    test_health_check()
    test_get_fabric_types()
    test_get_all_colors()
    test_get_colors_by_fabric_type()
    test_admin_add_color_valid_password()
    test_admin_add_color_invalid_password()
    test_admin_remove_color_valid_password()
    test_admin_remove_color_invalid_password()
    test_admin_update_color_valid_password()
    test_create_order()
    test_download_pdf()
    
    # Print summary
    print_summary()