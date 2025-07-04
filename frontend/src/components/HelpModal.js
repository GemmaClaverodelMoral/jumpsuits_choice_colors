import React from 'react';

const HelpModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-600">Ayuda - Cómo Usar el Personalizador</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              1. Información del Cliente
            </h3>
            <p className="text-blue-700">
              Complete todos los campos obligatorios (marcados con *) en el formulario del cliente:
              nombre, teléfono, email y fecha.
            </p>
          </div>
          
          {/* Step 2 */}
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              2. Selección de Áreas
            </h3>
            <div className="text-green-700 space-y-2">
              <p><strong>Clic simple:</strong> Selecciona un área específica del overol.</p>
              <p><strong>Doble clic:</strong> Selecciona automáticamente todas las áreas del mismo tipo de tela.</p>
              <p><strong>Importante:</strong> Solo puedes seleccionar áreas que tengan la misma trama (mismo tipo de tela).</p>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">
              3. Tipos de Tela
            </h3>
            <div className="text-yellow-700 space-y-2">
              <p><strong>Tela #1:</strong> Patrón diagonal (líneas inclinadas)</p>
              <p><strong>Tela #2 y #3:</strong> Patrón de cruces (+)</p>
              <p><strong>Tela #4:</strong> Patrón horizontal (líneas horizontales)</p>
            </div>
          </div>
          
          {/* Step 4 */}
          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">
              4. Selección de Colores
            </h3>
            <div className="text-purple-700 space-y-2">
              <p>Una vez seleccionadas las áreas, aparecerán los colores disponibles para ese tipo de tela.</p>
              <p>Haz clic en cualquier color para aplicarlo a todas las áreas seleccionadas.</p>
              <p>Puedes cambiar el color de una zona tantas veces como desees.</p>
            </div>
          </div>
          
          {/* Step 5 */}
          <div className="bg-red-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-3">
              5. Deshacer Selecciones
            </h3>
            <div className="text-red-700 space-y-2">
              <p><strong>Área seleccionada (sin color):</strong> Haz clic para deseleccionar.</p>
              <p><strong>Área con color:</strong> Haz clic para quitar el color y volver al patrón original.</p>
              <p><strong>Botón CANCELAR:</strong> Elimina todas las selecciones y colores.</p>
            </div>
          </div>
          
          {/* Step 6 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              6. Finalizar Orden
            </h3>
            <div className="text-gray-700 space-y-2">
              <p><strong>Botón ACEPTAR:</strong> Genera y descarga automáticamente un PDF con tu orden.</p>
              <p><strong>Botón CANCELAR:</strong> Reinicia todo el proceso.</p>
              <p><strong>Botón COLORES:</strong> Acceso administrativo para gestionar colores (requiere contraseña).</p>
            </div>
          </div>
          
          {/* Tips */}
          <div className="bg-indigo-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-800 mb-3">
              💡 Consejos Útiles
            </h3>
            <div className="text-indigo-700 space-y-2">
              <p>• Usa doble clic para seleccionar rápidamente todas las áreas del mismo tipo de tela.</p>
              <p>• Planifica tu diseño antes de comenzar para un resultado más coherente.</p>
              <p>• Recuerda que cada tipo de tela tiene colores específicos disponibles.</p>
              <p>• El PDF generado incluirá toda la información del cliente y las selecciones de color.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;