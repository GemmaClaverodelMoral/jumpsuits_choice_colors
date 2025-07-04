import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = ({ onClose, onColorsUpdated, backendUrl }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [colors, setColors] = useState([]);
  const [newColor, setNewColor] = useState({
    id: '',
    name: '',
    hex_value: '#000000',
    fabric_type: 'tela1'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchColors();
    }
  }, [isAuthenticated]);

  const handleAuth = () => {
    if (password === '80418914') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Contraseña incorrecta');
    }
  };

  const fetchColors = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/colors`);
      setColors(response.data.colors);
    } catch (error) {
      console.error('Error fetching colors:', error);
      setError('Error al cargar los colores');
    }
  };

  const handleAddColor = async () => {
    if (!newColor.id || !newColor.name) {
      setError('Por favor, complete todos los campos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await axios.post(`${backendUrl}/api/admin/colors`, {
        password: password,
        action: 'add',
        color: newColor
      });

      setNewColor({
        id: '',
        name: '',
        hex_value: '#000000',
        fabric_type: 'tela1'
      });

      fetchColors();
      onColorsUpdated();
      alert('Color agregado exitosamente');
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al agregar el color');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveColor = async (colorId) => {
    if (!confirm('¿Está seguro de que desea eliminar este color?')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await axios.post(`${backendUrl}/api/admin/colors`, {
        password: password,
        action: 'remove',
        color_id: colorId
      });

      fetchColors();
      onColorsUpdated();
      alert('Color eliminado exitosamente');
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al eliminar el color');
    } finally {
      setIsLoading(false);
    }
  };

  const getFabricTypeName = (fabricType) => {
    switch (fabricType) {
      case 'tela1':
        return 'Tela #1';
      case 'tela2':
        return 'Tela #2';
      case 'tela3':
        return 'Tela #3';
      case 'tela4':
        return 'Tela #4';
      default:
        return 'Tela';
    }
  };

  const groupedColors = colors.reduce((acc, color) => {
    if (!acc[color.fabric_type]) {
      acc[color.fabric_type] = [];
    }
    acc[color.fabric_type].push(color);
    return acc;
  }, {});

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Acceso Administrativo</h2>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Contraseña:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Ingrese la contraseña"
                onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={handleAuth}
                className="btn-primary flex-1"
              >
                Ingresar
              </button>
              <button
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Administración de Colores</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* Add New Color Form */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Agregar Nuevo Color</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="form-label">ID del Color:</label>
              <input
                type="text"
                value={newColor.id}
                onChange={(e) => setNewColor(prev => ({ ...prev, id: e.target.value }))}
                className="form-input"
                placeholder="ej: t1_nuevo"
              />
            </div>
            
            <div>
              <label className="form-label">Nombre:</label>
              <input
                type="text"
                value={newColor.name}
                onChange={(e) => setNewColor(prev => ({ ...prev, name: e.target.value }))}
                className="form-input"
                placeholder="ej: Nuevo Color"
              />
            </div>
            
            <div>
              <label className="form-label">Color (Hex):</label>
              <div className="flex">
                <input
                  type="color"
                  value={newColor.hex_value}
                  onChange={(e) => setNewColor(prev => ({ ...prev, hex_value: e.target.value }))}
                  className="w-12 h-10 rounded-l-md border border-gray-300"
                />
                <input
                  type="text"
                  value={newColor.hex_value}
                  onChange={(e) => setNewColor(prev => ({ ...prev, hex_value: e.target.value }))}
                  className="form-input rounded-l-none"
                  placeholder="#000000"
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Tipo de Tela:</label>
              <select
                value={newColor.fabric_type}
                onChange={(e) => setNewColor(prev => ({ ...prev, fabric_type: e.target.value }))}
                className="form-input"
              >
                <option value="tela1">Tela #1</option>
                <option value="tela2">Tela #2</option>
                <option value="tela3">Tela #3</option>
                <option value="tela4">Tela #4</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              onClick={handleAddColor}
              disabled={isLoading}
              className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Agregando...' : 'Agregar Color'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        
        {/* Existing Colors */}
        <div className="space-y-6">
          {Object.entries(groupedColors).map(([fabricType, fabricColors]) => (
            <div key={fabricType} className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                {getFabricTypeName(fabricType)} ({fabricColors.length} colores)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fabricColors.map((color) => (
                  <div key={color.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded-lg border border-gray-300"
                          style={{ backgroundColor: color.hex_value }}
                        ></div>
                        <div>
                          <p className="font-medium text-sm">{color.name}</p>
                          <p className="text-xs text-gray-500">{color.hex_value}</p>
                          <p className="text-xs text-gray-400">ID: {color.id}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveColor(color.id)}
                        disabled={isLoading}
                        className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;