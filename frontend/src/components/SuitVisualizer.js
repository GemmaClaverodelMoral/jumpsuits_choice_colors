import React from 'react';

const SuitVisualizer = ({ selectedAreas, suitSelections, onAreaClick, fabricTypes }) => {
  const handleAreaClick = (areaId, fabricType, event) => {
    const isDoubleClick = event.detail === 2;
    onAreaClick(areaId, fabricType, isDoubleClick);
  };

  const getAreaFill = (areaId, fabricType) => {
    const selection = suitSelections[areaId];
    if (selection) {
      return selection.colorHex;
    }
    
    // Return pattern based on fabric type
    switch (fabricType) {
      case 'tela1':
        return 'url(#diagonal-pattern)';
      case 'tela2':
      case 'tela3':
        return 'url(#cross-pattern)';
      case 'tela4':
        return 'url(#horizontal-pattern)';
      default:
        return '#f0f0f0';
    }
  };

  const getAreaClass = (areaId) => {
    const isSelected = selectedAreas.includes(areaId);
    const isColored = suitSelections[areaId];
    
    let classes = 'suit-area';
    if (isSelected) classes += ' selected';
    if (isColored) classes += ' colored';
    
    return classes;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-center">Visualizador de Overol</h2>
      
      <div className="flex justify-center">
        <svg width="600" height="400" viewBox="0 0 600 400" className="border border-gray-300 rounded-lg">
          {/* Pattern Definitions */}
          <defs>
            {/* Diagonal pattern for Tela #1 */}
            <pattern id="diagonal-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill="#f0f0f0"/>
              <path d="M0,8 L8,0 M-2,2 L2,-2 M6,10 L10,6" stroke="#ccc" strokeWidth="1"/>
            </pattern>
            
            {/* Cross pattern for Tela #2 & #3 */}
            <pattern id="cross-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill="#f0f0f0"/>
              <path d="M0,4 L8,4 M4,0 L4,8" stroke="#ccc" strokeWidth="1"/>
            </pattern>
            
            {/* Horizontal pattern for Tela #4 */}
            <pattern id="horizontal-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill="#f0f0f0"/>
              <path d="M0,2 L8,2 M0,6 L8,6" stroke="#ccc" strokeWidth="1"/>
            </pattern>
          </defs>
          
          {/* Front View */}
          <g transform="translate(50, 20)">
            <text x="100" y="15" textAnchor="middle" className="text-sm font-medium">Vista Frontal</text>
            
            {/* Head */}
            <circle cx="100" cy="40" r="15" fill="#ffeaa7" stroke="#ddd" strokeWidth="1"/>
            
            {/* Torso */}
            <rect 
              x="70" y="55" width="60" height="80" 
              fill={getAreaFill('front-torso', 'tela2')}
              className={getAreaClass('front-torso')}
              onClick={(e) => handleAreaClick('front-torso', 'tela2', e)}
            />
            
            {/* Chest areas */}
            <rect 
              x="70" y="55" width="25" height="35" 
              fill={getAreaFill('front-chest-left', 'tela2')}
              className={getAreaClass('front-chest-left')}
              onClick={(e) => handleAreaClick('front-chest-left', 'tela2', e)}
            />
            <rect 
              x="105" y="55" width="25" height="35" 
              fill={getAreaFill('front-chest-right', 'tela2')}
              className={getAreaClass('front-chest-right')}
              onClick={(e) => handleAreaClick('front-chest-right', 'tela2', e)}
            />
            
            {/* Shoulders */}
            <rect 
              x="45" y="55" width="25" height="20" 
              fill={getAreaFill('front-shoulder-left', 'tela1')}
              className={getAreaClass('front-shoulder-left')}
              onClick={(e) => handleAreaClick('front-shoulder-left', 'tela1', e)}
            />
            <rect 
              x="130" y="55" width="25" height="20" 
              fill={getAreaFill('front-shoulder-right', 'tela1')}
              className={getAreaClass('front-shoulder-right')}
              onClick={(e) => handleAreaClick('front-shoulder-right', 'tela1', e)}
            />
            
            {/* Arms */}
            <rect 
              x="35" y="75" width="15" height="50" 
              fill={getAreaFill('front-arm-left', 'tela1')}
              className={getAreaClass('front-arm-left')}
              onClick={(e) => handleAreaClick('front-arm-left', 'tela1', e)}
            />
            <rect 
              x="150" y="75" width="15" height="50" 
              fill={getAreaFill('front-arm-right', 'tela1')}
              className={getAreaClass('front-arm-right')}
              onClick={(e) => handleAreaClick('front-arm-right', 'tela1', e)}
            />
            
            {/* Upper legs */}
            <rect 
              x="75" y="135" width="20" height="60" 
              fill={getAreaFill('front-leg-left-upper', 'tela2')}
              className={getAreaClass('front-leg-left-upper')}
              onClick={(e) => handleAreaClick('front-leg-left-upper', 'tela2', e)}
            />
            <rect 
              x="105" y="135" width="20" height="60" 
              fill={getAreaFill('front-leg-right-upper', 'tela2')}
              className={getAreaClass('front-leg-right-upper')}
              onClick={(e) => handleAreaClick('front-leg-right-upper', 'tela2', e)}
            />
            
            {/* Knees */}
            <rect 
              x="75" y="195" width="20" height="15" 
              fill={getAreaFill('front-knee-left', 'tela4')}
              className={getAreaClass('front-knee-left')}
              onClick={(e) => handleAreaClick('front-knee-left', 'tela4', e)}
            />
            <rect 
              x="105" y="195" width="20" height="15" 
              fill={getAreaFill('front-knee-right', 'tela4')}
              className={getAreaClass('front-knee-right')}
              onClick={(e) => handleAreaClick('front-knee-right', 'tela4', e)}
            />
            
            {/* Lower legs */}
            <rect 
              x="75" y="210" width="20" height="70" 
              fill={getAreaFill('front-leg-left-lower', 'tela1')}
              className={getAreaClass('front-leg-left-lower')}
              onClick={(e) => handleAreaClick('front-leg-left-lower', 'tela1', e)}
            />
            <rect 
              x="105" y="210" width="20" height="70" 
              fill={getAreaFill('front-leg-right-lower', 'tela1')}
              className={getAreaClass('front-leg-right-lower')}
              onClick={(e) => handleAreaClick('front-leg-right-lower', 'tela1', e)}
            />
          </g>
          
          {/* Back View */}
          <g transform="translate(350, 20)">
            <text x="100" y="15" textAnchor="middle" className="text-sm font-medium">Vista Trasera</text>
            
            {/* Head */}
            <circle cx="100" cy="40" r="15" fill="#ffeaa7" stroke="#ddd" strokeWidth="1"/>
            
            {/* Upper back */}
            <rect 
              x="70" y="55" width="60" height="30" 
              fill={getAreaFill('back-upper', 'tela1')}
              className={getAreaClass('back-upper')}
              onClick={(e) => handleAreaClick('back-upper', 'tela1', e)}
            />
            
            {/* Middle back */}
            <rect 
              x="70" y="85" width="60" height="40" 
              fill={getAreaFill('back-middle', 'tela2')}
              className={getAreaClass('back-middle')}
              onClick={(e) => handleAreaClick('back-middle', 'tela2', e)}
            />
            
            {/* Lower back */}
            <rect 
              x="70" y="125" width="60" height="20" 
              fill={getAreaFill('back-lower', 'tela4')}
              className={getAreaClass('back-lower')}
              onClick={(e) => handleAreaClick('back-lower', 'tela4', e)}
            />
            
            {/* Shoulders */}
            <rect 
              x="45" y="55" width="25" height="20" 
              fill={getAreaFill('back-shoulder-left', 'tela1')}
              className={getAreaClass('back-shoulder-left')}
              onClick={(e) => handleAreaClick('back-shoulder-left', 'tela1', e)}
            />
            <rect 
              x="130" y="55" width="25" height="20" 
              fill={getAreaFill('back-shoulder-right', 'tela1')}
              className={getAreaClass('back-shoulder-right')}
              onClick={(e) => handleAreaClick('back-shoulder-right', 'tela1', e)}
            />
            
            {/* Arms */}
            <rect 
              x="35" y="75" width="15" height="50" 
              fill={getAreaFill('back-arm-left', 'tela1')}
              className={getAreaClass('back-arm-left')}
              onClick={(e) => handleAreaClick('back-arm-left', 'tela1', e)}
            />
            <rect 
              x="150" y="75" width="15" height="50" 
              fill={getAreaFill('back-arm-right', 'tela1')}
              className={getAreaClass('back-arm-right')}
              onClick={(e) => handleAreaClick('back-arm-right', 'tela1', e)}
            />
            
            {/* Upper legs */}
            <rect 
              x="75" y="145" width="20" height="50" 
              fill={getAreaFill('back-leg-left-upper', 'tela2')}
              className={getAreaClass('back-leg-left-upper')}
              onClick={(e) => handleAreaClick('back-leg-left-upper', 'tela2', e)}
            />
            <rect 
              x="105" y="145" width="20" height="50" 
              fill={getAreaFill('back-leg-right-upper', 'tela2')}
              className={getAreaClass('back-leg-right-upper')}
              onClick={(e) => handleAreaClick('back-leg-right-upper', 'tela2', e)}
            />
            
            {/* Lower legs */}
            <rect 
              x="75" y="195" width="20" height="85" 
              fill={getAreaFill('back-leg-left-lower', 'tela1')}
              className={getAreaClass('back-leg-left-lower')}
              onClick={(e) => handleAreaClick('back-leg-left-lower', 'tela1', e)}
            />
            <rect 
              x="105" y="195" width="20" height="85" 
              fill={getAreaFill('back-leg-right-lower', 'tela1')}
              className={getAreaClass('back-leg-right-lower')}
              onClick={(e) => handleAreaClick('back-leg-right-lower', 'tela1', e)}
            />
          </g>
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-4 text-sm text-gray-600">
        <div className="flex justify-center space-x-6">
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 border pattern-diagonal"></div>
            <span>Tela #1</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 border pattern-cross"></div>
            <span>Tela #2/#3</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 border pattern-horizontal"></div>
            <span>Tela #4</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuitVisualizer;