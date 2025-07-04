import React from 'react';

const CustomerForm = ({ customerInfo, setCustomerInfo }) => {
  const handleInputChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-center mb-2">VOLA® ORDER FORM</h2>
        <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded"></div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="form-label">
            CUSTOMER: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={customerInfo.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="form-input"
            placeholder="Ingrese el nombre del cliente"
            required
          />
        </div>
        
        <div>
          <label className="form-label">
            DATE: <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={customerInfo.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="form-input"
            required
          />
        </div>
        
        <div>
          <label className="form-label">
            E-MAIL: <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={customerInfo.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="form-input"
            placeholder="ejemplo@correo.com"
            required
          />
        </div>
        
        <div>
          <label className="form-label">
            PHONE NUMBER: <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="form-input"
            placeholder="Número de teléfono"
            required
          />
        </div>
        
        {/* Read-only fields as shown in the image */}
        <div className="border-t pt-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label text-gray-500">ORDER NUMBER:</label>
              <input
                type="text"
                value="------"
                className="form-input bg-gray-100 text-gray-500"
                readOnly
              />
            </div>
            <div>
              <label className="form-label text-gray-500">ORDER FORM:</label>
              <input
                type="text"
                value="------"
                className="form-input bg-gray-100 text-gray-500"
                readOnly
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="form-label text-gray-500">DELIVERY DAY:</label>
              <input
                type="text"
                value="-/-/-"
                className="form-input bg-gray-100 text-gray-500"
                readOnly
              />
            </div>
            <div>
              <label className="form-label text-gray-500">$:</label>
              <input
                type="text"
                value="------"
                className="form-input bg-gray-100 text-gray-500"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Nota:</strong> Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
        </p>
      </div>
    </div>
  );
};

export default CustomerForm;