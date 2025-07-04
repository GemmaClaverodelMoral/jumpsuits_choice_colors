import React from 'react';

const ColorPalette = ({ availableColors, selectedFabricType, onColorSelect }) => {
  const handleColorClick = (color) => {
    if (availableColors.length === 0) return;
    onColorSelect(color);
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Paleta de Colores</h2>
      
      {!selectedFabricType ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            Selecciona una o más áreas del overol para ver los colores disponibles.
          </p>
          <div className="mt-4 text-sm text-gray-400">
            <p>• Haz clic en un área para seleccionarla</p>
            <p>• Doble clic selecciona todas las áreas del mismo tipo de tela</p>
            <p>• Solo puedes seleccionar áreas del mismo tipo de tela</p>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-medium mb-3">
            Colores para {getFabricTypeName(selectedFabricType)}
          </h3>
          
          <div className="grid grid-cols-4 gap-3">
            {availableColors.map((color) => (
              <div
                key={color.id}
                className="color-option w-12 h-12 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg"
                style={{ backgroundColor: color.hex_value }}
                onClick={() => handleColorClick(color)}
                title={`${color.name} - ${color.hex_value}`}
              >
                <div className="w-full h-full rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow-md">
                    {color.name.slice(0, 2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Instrucciones:</strong> Haz clic en un color para aplicarlo a las áreas seleccionadas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPalette;