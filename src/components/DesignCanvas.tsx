import React, { useRef, useEffect, useState } from 'react';
import { CardTemplate, CardField, DataSource } from '../types';
import { Move, Type, Palette, Layers, RotateCcw, Trash2 } from 'lucide-react';

interface DesignCanvasProps {
  template: CardTemplate;
  data: DataSource;
  dataType: 'employee' | 'student';
  selectedRecord: number;
  onTemplateUpdate: (template: CardTemplate) => void;
}

export default function DesignCanvas({ 
  template, 
  data, 
  dataType, 
  selectedRecord, 
  onTemplateUpdate 
}: DesignCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const currentRecord = data[selectedRecord];
  const availableFields = getAvailableFields(currentRecord, dataType);

  function getAvailableFields(record: any, type: 'employee' | 'student') {
    const fields = Object.keys(record).filter(key => key !== 'id');
    return fields.map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      value: record[key]
    }));
  }

  const addField = (fieldInfo: { key: string; label: string; value: string }) => {
    const newField: CardField = {
      id: Date.now().toString(),
      key: fieldInfo.key,
      label: fieldInfo.label,
      value: fieldInfo.value,
      side: currentSide,
      x: 50,
      y: 50,
      width: fieldInfo.key === 'photo' ? 100 : 200,
      height: fieldInfo.key === 'photo' ? 120 : 30,
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#000000',
      textAlign: 'left',
      fontWeight: 'normal',
      layer: template.fields.length + 1
    };

    const updatedTemplate = {
      ...template,
      fields: [...template.fields, newField]
    };
    onTemplateUpdate(updatedTemplate);
  };

  const updateField = (fieldId: string, updates: Partial<CardField>) => {
    const updatedFields = template.fields.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    );
    onTemplateUpdate({ ...template, fields: updatedFields });
  };

  const deleteField = (fieldId: string) => {
    const updatedFields = template.fields.filter(field => field.id !== fieldId);
    onTemplateUpdate({ ...template, fields: updatedFields });
    setSelectedField(null);
  };

  const handleMouseDown = (e: React.MouseEvent, fieldId: string) => {
    e.preventDefault();
    setSelectedField(fieldId);
    setIsDragging(true);
    
    const field = template.fields.find(f => f.id === fieldId);
    if (field) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left - field.x,
          y: e.clientY - rect.top - field.y
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedField) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left - dragOffset.x;
        const y = e.clientY - rect.top - dragOffset.y;
        
        updateField(selectedField, { x: Math.max(0, x), y: Math.max(0, y) });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  const selectedFieldData = selectedField ? template.fields.find(f => f.id === selectedField) : null;

  return (
    <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Design Canvas</h2>
          {template.isDoubleSided && (
            <div className="flex bg-gray-100 rounded-md">
              <button
                onClick={() => setCurrentSide('front')}
                className={`px-3 py-1 rounded-l-md text-sm font-medium transition-colors ${
                  currentSide === 'front'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Front
              </button>
              <button
                onClick={() => setCurrentSide('back')}
                className={`px-3 py-1 rounded-r-md text-sm font-medium transition-colors ${
                  currentSide === 'back'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Back
              </button>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-600">
          Record: {selectedRecord + 1} of {data.length}
        </div>
      </div>

      <div className="flex h-96">
        {/* Available Fields Panel */}
        <div className="w-64 border-r border-gray-200 p-4">
          <h3 className="font-medium text-gray-800 mb-3">Available Fields</h3>
          <div className="space-y-2">
            {availableFields.map((field) => (
              <button
                key={field.key}
                onClick={() => addField(field)}
                className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
              >
                <div className="font-medium text-gray-800">{field.label}</div>
                <div className="text-xs text-gray-500 truncate">{field.value}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-4 bg-gray-50">
          <div className="relative mx-auto bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">
            <div
              ref={canvasRef}
              className="relative bg-white cursor-crosshair"
              style={{
                width: template.width,
                height: template.height,
                backgroundImage: currentSide === 'front' 
                  ? `url(${template.frontImage})` 
                  : `url(${template.backImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {template.fields
                .filter(field => field.side === currentSide)
                .map((field) => (
                <div
                  key={field.id}
                  className={`absolute cursor-move border-2 transition-colors ${
                    selectedField === field.id
                      ? 'border-blue-500 bg-blue-50 bg-opacity-50'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  style={{
                    left: field.x,
                    top: field.y,
                    width: field.width,
                    height: field.height,
                    fontSize: field.fontSize,
                    fontFamily: field.fontFamily,
                    color: field.color,
                    textAlign: field.textAlign,
                    fontWeight: field.fontWeight,
                    transform: field.rotation ? `rotate(${field.rotation}deg)` : 'none',
                    zIndex: field.layer,
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, field.id)}
                >
                  {field.key === 'photo' ? (
                    <img
                      src={field.value}
                      alt="Photo"
                      className="w-full h-full object-cover rounded"
                      draggable={false}
                    />
                  ) : (
                    field.value
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        {selectedFieldData && (
          <div className="w-80 border-l border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-800">Field Properties</h3>
              <button
                onClick={() => deleteField(selectedFieldData.id)}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500">X</label>
                    <input
                      type="number"
                      value={selectedFieldData.x}
                      onChange={(e) => updateField(selectedFieldData.id, { x: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Y</label>
                    <input
                      type="number"
                      value={selectedFieldData.y}
                      onChange={(e) => updateField(selectedFieldData.id, { y: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500">Width</label>
                    <input
                      type="number"
                      value={selectedFieldData.width}
                      onChange={(e) => updateField(selectedFieldData.id, { width: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Height</label>
                    <input
                      type="number"
                      value={selectedFieldData.height}
                      onChange={(e) => updateField(selectedFieldData.id, { height: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Font Properties (for text fields) */}
              {selectedFieldData.key !== 'photo' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                    <input
                      type="number"
                      value={selectedFieldData.fontSize}
                      onChange={(e) => updateField(selectedFieldData.id, { fontSize: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <input
                      type="color"
                      value={selectedFieldData.color}
                      onChange={(e) => updateField(selectedFieldData.id, { color: e.target.value })}
                      className="w-full h-8 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Text Align</label>
                    <select
                      value={selectedFieldData.textAlign}
                      onChange={(e) => updateField(selectedFieldData.id, { textAlign: e.target.value as 'left' | 'center' | 'right' })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
                    <select
                      value={selectedFieldData.fontWeight}
                      onChange={(e) => updateField(selectedFieldData.id, { fontWeight: e.target.value as 'normal' | 'bold' })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>
                </>
              )}

              {/* Layer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Layer</label>
                <input
                  type="number"
                  value={selectedFieldData.layer}
                  onChange={(e) => updateField(selectedFieldData.id, { layer: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}