import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SuitVisualizer from './components/SuitVisualizer';
import ColorPalette from './components/ColorPalette';
import CustomerForm from './components/CustomerForm';
import AdminPanel from './components/AdminPanel';
import HelpModal from './components/HelpModal';
import './App.css';

function App() {
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedFabricType, setSelectedFabricType] = useState(null);
  const [availableColors, setAvailableColors] = useState([]);
  const [allColors, setAllColors] = useState([]);
  const [fabricTypes, setFabricTypes] = useState([]);
  const [suitSelections, setSuitSelections] = useState({});
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [colorsResponse, fabricTypesResponse] = await Promise.all([
        axios.get(`${backendUrl}/api/colors`),
        axios.get(`${backendUrl}/api/fabric-types`)
      ]);
      
      setAllColors(colorsResponse.data.colors);
      setFabricTypes(fabricTypesResponse.data.fabric_types);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      alert('Error al cargar los datos iniciales. Por favor, recargue la página.');
    }
  };

  const handleAreaClick = (areaId, fabricType, isDoubleClick = false) => {
    if (isDoubleClick) {
      // Select all areas with the same fabric type
      const areasWithSameFabric = getSuitAreas().filter(area => area.fabricType === fabricType);
      const areaIds = areasWithSameFabric.map(area => area.id);
      setSelectedAreas(areaIds);
      setSelectedFabricType(fabricType);
      setAvailableColors(allColors.filter(color => color.fabric_type === fabricType));
    } else {
      // Single click logic
      const currentAreaSelection = selectedAreas.includes(areaId);
      const isColored = suitSelections[areaId];
      
      if (currentAreaSelection && !isColored) {
        // Deselect the area
        setSelectedAreas(prev => prev.filter(id => id !== areaId));
        if (selectedAreas.length === 1) {
          setSelectedFabricType(null);
          setAvailableColors([]);
        }
      } else if (isColored) {
        // Remove color from colored area
        setSuitSelections(prev => {
          const newSelections = { ...prev };
          delete newSelections[areaId];
          return newSelections;
        });
      } else {
        // Add new area selection
        if (selectedAreas.length === 0) {
          // First selection
          setSelectedAreas([areaId]);
          setSelectedFabricType(fabricType);
          setAvailableColors(allColors.filter(color => color.fabric_type === fabricType));
        } else if (selectedFabricType === fabricType) {
          // Same fabric type, add to selection
          setSelectedAreas(prev => [...prev, areaId]);
        } else {
          // Different fabric type, show alert
          alert('No puedes seleccionar áreas con diferentes tipos de tela. Por favor, selecciona áreas con la misma trama.');
        }
      }
    }
  };

  const handleColorSelect = (color) => {
    if (selectedAreas.length === 0) return;
    
    const newSelections = { ...suitSelections };
    selectedAreas.forEach(areaId => {
      newSelections[areaId] = {
        colorId: color.id,
        colorHex: color.hex_value,
        fabricType: selectedFabricType
      };
    });
    
    setSuitSelections(newSelections);
    setSelectedAreas([]);
    setSelectedFabricType(null);
    setAvailableColors([]);
  };

  const handleAccept = async () => {
    // Validate customer info
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.email) {
      alert('Por favor, complete toda la información del cliente.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      alert('Por favor, ingrese un email válido.');
      return;
    }

    // Check if there are any selections
    if (Object.keys(suitSelections).length === 0) {
      alert('Por favor, seleccione al menos un color para el overol.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare order data
      const orderData = {
        customer_info: customerInfo,
        selections: Object.entries(suitSelections).map(([areaId, selection]) => ({
          area_id: areaId,
          fabric_type: selection.fabricType,
          color_id: selection.colorId,
          color_hex: selection.colorHex
        }))
      };

      // Create order
      const response = await axios.post(`${backendUrl}/api/orders`, orderData);
      
      if (response.data.pdf_ready) {
        // Download PDF
        const pdfResponse = await axios.get(
          `${backendUrl}/api/orders/${response.data.order_id}/pdf`,
          { responseType: 'blob' }
        );
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `overol_orden_${response.data.order_id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        alert('¡Orden creada exitosamente! El PDF se ha descargado automáticamente.');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error al crear la orden. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedAreas([]);
    setSelectedFabricType(null);
    setAvailableColors([]);
    setSuitSelections({});
    setCustomerInfo({
      name: '',
      phone: '',
      email: '',
      date: new Date().toISOString().split('T')[0]
    });
    alert('Todas las selecciones han sido canceladas.');
  };

  const getSuitAreas = () => {
    // Define all suit areas with their fabric types
    return [
      // Front view areas
      { id: 'front-chest-left', fabricType: 'tela2' },
      { id: 'front-chest-right', fabricType: 'tela2' },
      { id: 'front-shoulder-left', fabricType: 'tela1' },
      { id: 'front-shoulder-right', fabricType: 'tela1' },
      { id: 'front-arm-left', fabricType: 'tela1' },
      { id: 'front-arm-right', fabricType: 'tela1' },
      { id: 'front-torso', fabricType: 'tela2' },
      { id: 'front-leg-left-upper', fabricType: 'tela2' },
      { id: 'front-leg-right-upper', fabricType: 'tela2' },
      { id: 'front-leg-left-lower', fabricType: 'tela1' },
      { id: 'front-leg-right-lower', fabricType: 'tela1' },
      { id: 'front-knee-left', fabricType: 'tela4' },
      { id: 'front-knee-right', fabricType: 'tela4' },
      
      // Back view areas
      { id: 'back-upper', fabricType: 'tela1' },
      { id: 'back-middle', fabricType: 'tela2' },
      { id: 'back-lower', fabricType: 'tela4' },
      { id: 'back-shoulder-left', fabricType: 'tela1' },
      { id: 'back-shoulder-right', fabricType: 'tela1' },
      { id: 'back-arm-left', fabricType: 'tela1' },
      { id: 'back-arm-right', fabricType: 'tela1' },
      { id: 'back-leg-left-upper', fabricType: 'tela2' },
      { id: 'back-leg-right-upper', fabricType: 'tela2' },
      { id: 'back-leg-left-lower', fabricType: 'tela1' },
      { id: 'back-leg-right-lower', fabricType: 'tela1' },
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">OVEROL FREEFLY</h1>
            <button
              onClick={() => setShowHelpModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Ayuda
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Customer Form */}
          <div className="lg:col-span-1">
            <CustomerForm
              customerInfo={customerInfo}
              setCustomerInfo={setCustomerInfo}
            />
          </div>

          {/* Center Column - Suit Visualizer */}
          <div className="lg:col-span-1">
            <SuitVisualizer
              selectedAreas={selectedAreas}
              suitSelections={suitSelections}
              onAreaClick={handleAreaClick}
              fabricTypes={fabricTypes}
            />
          </div>

          {/* Right Column - Color Palette */}
          <div className="lg:col-span-1">
            <ColorPalette
              availableColors={availableColors}
              selectedFabricType={selectedFabricType}
              onColorSelect={handleColorSelect}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={handleAccept}
            disabled={isLoading}
            className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Procesando...' : 'ACEPTAR'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CANCELAR
          </button>
          <button
            onClick={() => setShowAdminPanel(true)}
            className="btn-secondary"
          >
            COLORES
          </button>
        </div>
      </div>

      {/* Modals */}
      {showAdminPanel && (
        <AdminPanel
          onClose={() => setShowAdminPanel(false)}
          onColorsUpdated={fetchInitialData}
          backendUrl={backendUrl}
        />
      )}

      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  );
}

export default App;