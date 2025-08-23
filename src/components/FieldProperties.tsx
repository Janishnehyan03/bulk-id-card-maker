import React from 'react';
import { Trash2, X } from 'lucide-react';
import { CardField } from '../types';

interface FieldPropertiesPanelProps {
  field: CardField | null;
  onUpdate: (fieldId: string, updates: Partial<CardField>) => void;
  onDelete: (fieldId: string) => void;
  onClose: () => void;
}

export const FieldPropertiesPanel = ({ field, onUpdate, onDelete, onClose }: FieldPropertiesPanelProps) => {
  if (!field) return null;

  const handleUpdate = (updates: Partial<CardField>) => {
    onUpdate(field.id, updates);
  };
  
  return (
    <div className="w-80 border-l border-gray-200 bg-white shadow-lg flex flex-col transition-transform transform">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Properties: <span className="font-normal">{field.label}</span></h3>
        <button onClick={onClose} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Position (mm)</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-gray-500">X</span>
              <input type="number" step="0.1" value={field.x.toFixed(1)} onChange={(e) => handleUpdate({ x: parseFloat(e.target.value) || 0 })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm"/>
            </div>
            <div>
              <span className="text-xs text-gray-500">Y</span>
              <input type="number" step="0.1" value={field.y.toFixed(1)} onChange={(e) => handleUpdate({ y: parseFloat(e.target.value) || 0 })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm"/>
            </div>
          </div>
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Size (mm)</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-gray-500">Width</span>
              <input type="number" step="0.1" value={field.width.toFixed(1)} onChange={(e) => handleUpdate({ width: parseFloat(e.target.value) || 0 })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm"/>
            </div>
            <div>
              <span className="text-xs text-gray-500">Height</span>
              <input type="number" step="0.1" value={field.height.toFixed(1)} onChange={(e) => handleUpdate({ height: parseFloat(e.target.value) || 0 })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm"/>
            </div>
          </div>
        </div>

        {/* Font Properties */}
        {field.key !== 'photo' && (
          <>
            <hr/>
            <div>
              <label className="block text-sm font-medium text-gray-700">Font Size</label>
              <input type="number" value={field.fontSize} onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) || 12 })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <input type="color" value={field.color} onChange={(e) => handleUpdate({ color: e.target.value })} className="w-full h-8 p-0 border-none rounded cursor-pointer mt-1"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Alignment</label>
              <select value={field.textAlign} onChange={(e) => handleUpdate({ textAlign: e.target.value as any })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Weight</label>
              <select value={field.fontWeight} onChange={(e) => handleUpdate({ fontWeight: e.target.value as any })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1">
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </>
        )}
        <hr/>
        {/* Layer & Rotation */}
        <div className="grid grid-cols-2 gap-2">
            <div>
                <label className="block text-sm font-medium text-gray-700">Layer</label>
                <input type="number" value={field.layer} onChange={(e) => handleUpdate({ layer: parseInt(e.target.value) || 0 })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Rotation (°)</label>
                <input type="number" value={field.rotation} onChange={(e) => handleUpdate({ rotation: parseInt(e.target.value) || 0 })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"/>
            </div>
        </div>

      </div>

      <div className="p-4 border-t border-gray-200">
        <button onClick={() => onDelete(field.id)} className="w-full flex items-center justify-center gap-2 p-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors">
          <Trash2 className="h-4 w-4" />
          Delete Field
        </button>
      </div>
    </div>
  );
};