import React from 'react';
import { CardField } from '../types';

interface CanvasFieldProps {
  field: CardField;
  pxPerMm: number;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
}

export const CanvasField = ({ field, pxPerMm, isSelected, onMouseDown, onDoubleClick }: CanvasFieldProps) => {
  const style: React.CSSProperties = {
    left: field.x * pxPerMm,
    top: field.y * pxPerMm,
    width: field.width * pxPerMm,
    height: field.height * pxPerMm,
    fontSize: (field.fontSize * pxPerMm) / 7, // Heuristic scaling
    fontFamily: field.fontFamily,
    color: field.color,
    textAlign: field.textAlign as React.CSSProperties['textAlign'],
    fontWeight: field.fontWeight as React.CSSProperties['fontWeight'],
    transform: `rotate(${field.rotation || 0}deg)`,
    zIndex: field.layer,
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: field.textAlign || 'left',
    boxSizing: 'border-box', // Important for accurate dimensions
  };

  return (
    <div
      style={style}
      className={`absolute cursor-move transition-colors select-none ${
        isSelected
          ? 'border-2 border-blue-500 bg-blue-100 bg-opacity-50'
          : 'border border-transparent hover:border-dashed hover:border-gray-400'
      }`}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      {field.key === 'photo' ? (
        <img
          src={field.value}
          alt="User"
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <span className="w-full truncate">{field.value}</span>
      )}
    </div>
  );
};