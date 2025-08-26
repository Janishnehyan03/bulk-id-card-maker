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
  // Use consistent font size calculation matching print logic
  const fontSizePx = (field.fontSize / 72) * (pxPerMm * 25.4); // Convert pt to px using same logic as print
  
  const style: React.CSSProperties = {
    left: field.x * pxPerMm,
    top: field.y * pxPerMm,
    width: field.width * pxPerMm,
    height: field.height * pxPerMm,
    fontSize: fontSizePx,
    fontFamily: field.fontFamily,
    color: field.color,
    textAlign: field.textAlign as React.CSSProperties['textAlign'],
    fontWeight: field.fontWeight as React.CSSProperties['fontWeight'],
    lineHeight: field.lineHeight ? `${field.lineHeight * pxPerMm}px` : `${fontSizePx * 1.2}px`,
    transform: `rotate(${field.rotation || 0}deg)`,
    transformOrigin: 'center center', // Match canvas rotation origin
    zIndex: field.layer,
    padding: '0', // Remove padding to match canvas exactly
    display: 'flex',
    alignItems: 'flex-start', // Match canvas textBaseline: 'top'
    justifyContent: getJustifyContent(field.textAlign || 'left'),
    boxSizing: 'border-box',
    borderRadius: field.borderRadius ? `${field.borderRadius * pxPerMm}px` : '0',
    overflow: 'hidden',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap', // Allow line breaks like canvas
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
          src={field.value || 'https://via.placeholder.com/150x150?text=No+Photo'}
          alt="User"
          className="w-full h-full object-cover"
          style={{
            borderRadius: field.borderRadius ? `${field.borderRadius * pxPerMm}px` : '0',
          }}
          draggable={false}
        />
      ) : (
        <div className="w-full h-full flex items-start" style={{ 
          justifyContent: getJustifyContent(field.textAlign || 'left'),
          paddingTop: '0', // Match canvas text positioning
          lineHeight: field.lineHeight ? `${field.lineHeight * pxPerMm}px` : `${fontSizePx * 1.2}px`,
        }}>
          <span className="block" style={{
            fontSize: fontSizePx,
            fontFamily: field.fontFamily,
            fontWeight: field.fontWeight,
            color: field.color,
            textAlign: field.textAlign as React.CSSProperties['textAlign'],
            width: '100%',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            lineHeight: field.lineHeight ? `${field.lineHeight * pxPerMm}px` : `${fontSizePx * 1.2}px`,
          }}>
            {field.value}
          </span>
        </div>
      )}
    </div>
  );
};

function getJustifyContent(textAlign: string): React.CSSProperties['justifyContent'] {
  switch (textAlign) {
    case 'center': return 'center';
    case 'right': return 'flex-end';
    default: return 'flex-start';
  }
}