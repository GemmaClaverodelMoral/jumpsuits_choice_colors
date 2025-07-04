import os
from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pymongo import MongoClient
from pydantic import BaseModel
from typing import List, Dict, Optional
import uuid
from datetime import datetime
import json
from reportlab.lib.pagesizes import letter, A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import base64
from io import BytesIO

# Initialize FastAPI app
app = FastAPI(title="Skydiving Suit Customizer API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URL)
db = client.skydiving_suits

# Collections
colors_collection = db.colors
orders_collection = db.orders
fabric_types_collection = db.fabric_types

# Pydantic models
class Color(BaseModel):
    id: str
    name: str
    hex_value: str
    fabric_type: str  # "tela1", "tela2", "tela3", "tela4"

class FabricType(BaseModel):
    id: str
    name: str
    pattern_type: str  # "diagonal", "cross", "horizontal"

class CustomerInfo(BaseModel):
    name: str
    phone: str
    email: str
    date: str

class SuitSelection(BaseModel):
    area_id: str
    fabric_type: str
    color_id: str
    color_hex: str

class Order(BaseModel):
    id: str
    customer_info: CustomerInfo
    selections: List[SuitSelection]
    created_at: datetime
    pdf_path: Optional[str] = None

class AdminColorRequest(BaseModel):
    password: str
    action: str  # "add", "remove", "update"
    color: Optional[Color] = None
    color_id: Optional[str] = None

# Initialize default data
@app.on_event("startup")
async def startup_event():
    # Initialize fabric types
    fabric_types = [
        {"id": "tela1", "name": "Tela #1", "pattern_type": "diagonal"},
        {"id": "tela2", "name": "Tela #2", "pattern_type": "cross"},
        {"id": "tela3", "name": "Tela #3", "pattern_type": "cross"},
        {"id": "tela4", "name": "Tela #4", "pattern_type": "horizontal"}
    ]
    
    for fabric_type in fabric_types:
        if not fabric_types_collection.find_one({"id": fabric_type["id"]}):
            fabric_types_collection.insert_one(fabric_type)
    
    # Initialize default colors
    default_colors = [
        # Tela #1 colors
        {"id": "t1_gray", "name": "Gray", "hex_value": "#808080", "fabric_type": "tela1"},
        {"id": "t1_blue", "name": "Blue", "hex_value": "#0066CC", "fabric_type": "tela1"},
        {"id": "t1_red", "name": "Red", "hex_value": "#FF0000", "fabric_type": "tela1"},
        {"id": "t1_black", "name": "Black", "hex_value": "#000000", "fabric_type": "tela1"},
        
        # Tela #2 colors
        {"id": "t2_black", "name": "Black", "hex_value": "#000000", "fabric_type": "tela2"},
        {"id": "t2_gray", "name": "Gray", "hex_value": "#808080", "fabric_type": "tela2"},
        {"id": "t2_blue", "name": "Blue", "hex_value": "#0066CC", "fabric_type": "tela2"},
        {"id": "t2_navy", "name": "Navy", "hex_value": "#000080", "fabric_type": "tela2"},
        {"id": "t2_red", "name": "Red", "hex_value": "#FF0000", "fabric_type": "tela2"},
        
        # Tela #3 colors
        {"id": "t3_navy", "name": "Navy", "hex_value": "#000080", "fabric_type": "tela3"},
        {"id": "t3_black", "name": "Black", "hex_value": "#000000", "fabric_type": "tela3"},
        {"id": "t3_gray", "name": "Gray", "hex_value": "#808080", "fabric_type": "tela3"},
        {"id": "t3_blue", "name": "Blue", "hex_value": "#0066CC", "fabric_type": "tela3"},
        {"id": "t3_red", "name": "Red", "hex_value": "#FF0000", "fabric_type": "tela3"},
        
        # Tela #4 colors
        {"id": "t4_red", "name": "Red", "hex_value": "#FF0000", "fabric_type": "tela4"},
        {"id": "t4_black", "name": "Black", "hex_value": "#000000", "fabric_type": "tela4"},
        {"id": "t4_blue", "name": "Blue", "hex_value": "#0066CC", "fabric_type": "tela4"},
        {"id": "t4_gray", "name": "Gray", "hex_value": "#808080", "fabric_type": "tela4"},
        {"id": "t4_yellow", "name": "Yellow", "hex_value": "#FFFF00", "fabric_type": "tela4"},
    ]
    
    for color in default_colors:
        if not colors_collection.find_one({"id": color["id"]}):
            colors_collection.insert_one(color)

# API Endpoints
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "skydiving-suit-customizer"}

@app.get("/api/fabric-types")
async def get_fabric_types():
    fabric_types = list(fabric_types_collection.find({}, {"_id": 0}))
    return {"fabric_types": fabric_types}

@app.get("/api/colors")
async def get_colors():
    colors = list(colors_collection.find({}, {"_id": 0}))
    return {"colors": colors}

@app.get("/api/colors/{fabric_type}")
async def get_colors_by_fabric_type(fabric_type: str):
    colors = list(colors_collection.find({"fabric_type": fabric_type}, {"_id": 0}))
    return {"colors": colors}

@app.post("/api/admin/colors")
async def manage_colors(request: AdminColorRequest):
    # Verify admin password
    if request.password != "80418914":
        raise HTTPException(status_code=403, detail="Invalid admin password")
    
    if request.action == "add":
        if not request.color:
            raise HTTPException(status_code=400, detail="Color data required for add action")
        
        # Check if color already exists
        if colors_collection.find_one({"id": request.color.id}):
            raise HTTPException(status_code=400, detail="Color with this ID already exists")
        
        colors_collection.insert_one(request.color.dict())
        return {"message": "Color added successfully"}
    
    elif request.action == "remove":
        if not request.color_id:
            raise HTTPException(status_code=400, detail="Color ID required for remove action")
        
        result = colors_collection.delete_one({"id": request.color_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Color not found")
        
        return {"message": "Color removed successfully"}
    
    elif request.action == "update":
        if not request.color:
            raise HTTPException(status_code=400, detail="Color data required for update action")
        
        result = colors_collection.replace_one({"id": request.color.id}, request.color.dict())
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Color not found")
        
        return {"message": "Color updated successfully"}
    
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

def generate_pdf(order_data: dict) -> str:
    """Generate PDF with order details"""
    filename = f"order_{order_data['id']}.pdf"
    filepath = f"/tmp/{filename}"
    
    # Create PDF
    doc = SimpleDocTemplate(filepath, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Title'],
        fontSize=24,
        textColor=colors.darkblue,
        alignment=1  # Center alignment
    )
    story.append(Paragraph("OVEROL FREEFLY - ORDEN DE PERSONALIZACIÓN", title_style))
    story.append(Spacer(1, 20))
    
    # Customer information
    customer_info = order_data['customer_info']
    info_style = styles['Normal']
    
    story.append(Paragraph(f"<b>INFORMACIÓN DEL CLIENTE</b>", styles['Heading2']))
    story.append(Paragraph(f"<b>Nombre:</b> {customer_info['name']}", info_style))
    story.append(Paragraph(f"<b>Teléfono:</b> {customer_info['phone']}", info_style))
    story.append(Paragraph(f"<b>Email:</b> {customer_info['email']}", info_style))
    story.append(Paragraph(f"<b>Fecha:</b> {customer_info['date']}", info_style))
    story.append(Spacer(1, 20))
    
    # Color selections
    story.append(Paragraph("<b>SELECCIÓN DE COLORES</b>", styles['Heading2']))
    
    # Group selections by fabric type
    fabric_groups = {}
    for selection in order_data['selections']:
        fabric_type = selection['fabric_type']
        if fabric_type not in fabric_groups:
            fabric_groups[fabric_type] = []
        fabric_groups[fabric_type].append(selection)
    
    for fabric_type, selections in fabric_groups.items():
        fabric_name = fabric_type.replace('tela', 'Tela #')
        story.append(Paragraph(f"<b>{fabric_name}:</b>", styles['Heading3']))
        
        # Get unique colors for this fabric type
        unique_colors = {}
        for selection in selections:
            color_key = f"{selection['color_id']}-{selection['color_hex']}"
            if color_key not in unique_colors:
                unique_colors[color_key] = {
                    'color_hex': selection['color_hex'],
                    'areas': []
                }
            unique_colors[color_key]['areas'].append(selection['area_id'])
        
        for color_key, color_data in unique_colors.items():
            areas_text = ', '.join(color_data['areas'])
            story.append(Paragraph(f"Color: {color_data['color_hex']} - Áreas: {areas_text}", info_style))
        
        story.append(Spacer(1, 10))
    
    # Order details
    story.append(Spacer(1, 20))
    story.append(Paragraph(f"<b>ID de Orden:</b> {order_data['id']}", info_style))
    story.append(Paragraph(f"<b>Fecha de Creación:</b> {order_data['created_at']}", info_style))
    
    # Build PDF
    doc.build(story)
    
    return filepath

@app.post("/api/orders")
async def create_order(order_data: dict = Body(...)):
    # Generate unique order ID
    order_id = str(uuid.uuid4())
    
    # Create order document
    order = {
        "id": order_id,
        "customer_info": order_data["customer_info"],
        "selections": order_data["selections"],
        "created_at": datetime.now().isoformat(),
        "pdf_path": None
    }
    
    # Generate PDF
    try:
        pdf_path = generate_pdf(order)
        order["pdf_path"] = pdf_path
        
        # Save order to database
        orders_collection.insert_one(order)
        
        return {"order_id": order_id, "pdf_ready": True}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")

@app.get("/api/orders/{order_id}/pdf")
async def download_pdf(order_id: str):
    order = orders_collection.find_one({"id": order_id})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if not order.get("pdf_path"):
        raise HTTPException(status_code=404, detail="PDF not found")
    
    return FileResponse(
        order["pdf_path"],
        media_type="application/pdf",
        filename=f"overol_orden_{order_id}.pdf"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)