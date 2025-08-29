import React from "react";
import { CardField } from "../types";

/**
 * CanvasField
 * - Modern, accessible, pixel-perfect field renderer for card design canvas.
 * - Premium UX: smooth transitions, clear focus/selection states, dark mode, pointer events, and a11y.
 */
interface CanvasFieldProps {
  field: CardField;
  pxPerMm: number;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
}

export const CanvasField = ({
  field,
  pxPerMm,
  isSelected,
  onMouseDown,
  onDoubleClick,
}: CanvasFieldProps) => {
  // Consistent font size calculation matching print logic
  const fontSizePx = (field.fontSize / 72) * (pxPerMm * 25.4);

  const style: React.CSSProperties = {
    left: field.x * pxPerMm,
    top: field.y * pxPerMm,
    width: field.width * pxPerMm,
    height: field.height * pxPerMm,
    fontSize: fontSizePx,
    fontFamily: field.fontFamily,
    color: field.color,
    textAlign: field.textAlign as React.CSSProperties["textAlign"],
    fontWeight: field.fontWeight as React.CSSProperties["fontWeight"],
    lineHeight: field.lineHeight
      ? `${field.lineHeight * pxPerMm}px`
      : `${fontSizePx * 1.2}px`,
    transform: `rotate(${field.rotation || 0}deg)`,
    transformOrigin: "center center",
    zIndex: field.layer,
    padding: 0,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: getJustifyContent(field.textAlign || "left"),
    boxSizing: "border-box",
    borderRadius: field.borderRadius
      ? `${field.borderRadius * pxPerMm}px`
      : "0",
    overflow: "hidden",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
    transition:
      "box-shadow 0.18s cubic-bezier(.4,1,.7,1), border-color 0.16s, background 0.18s, color 0.18s",
    outline: isSelected ? "2px solid #2563eb" : "none",
  };

  // Accessibility: Use role and aria-selected for fields, tabIndex for keyboard highlight
  return (
    <div
      style={style}
      className={[
        "absolute cursor-move select-none peer transition-all duration-150",
        isSelected
          ? "border-2 border-blue-500 border-dashed shadow-lg shadow-blue-200 ring-2 ring-blue-500 ring-offset-2 bg-blue-50/10 dark:bg-blue-900/10"
          : "border border-transparent hover:border-gray-400 hover:border-dashed dark:hover:border-blue-400 focus:border-blue-400 focus:ring-2",
      ].join(" ")}
      tabIndex={0}
      role="listitem"
      aria-selected={isSelected}
      aria-label={field.key === "photo" ? "Photo field" : field.label || field.key}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      {field.key === "photo" ? (
        <img
          src={field.value || "https://via.placeholder.com/150x150?text=No+Photo"}
          alt={field.label || "User photo"}
          className="w-full h-full object-cover rounded"
          style={{
            borderRadius: field.borderRadius
              ? `${field.borderRadius * pxPerMm}px`
              : "0",
            pointerEvents: "none",
            userSelect: "none",
          }}
          draggable={false}
        />
      ) : (
        <div
          className="w-full h-full flex items-start"
          style={{
            justifyContent: getJustifyContent(field.textAlign || "left"),
            lineHeight: field.lineHeight
              ? `${field.lineHeight * pxPerMm}px`
              : `${fontSizePx * 1.2}px`,
          }}
        >
          <span
            className="block whitespace-pre-wrap break-words pointer-events-none"
            style={{
              fontSize: fontSizePx,
              fontFamily: field.fontFamily,
              fontWeight: field.fontWeight,
              color: field.color,
              textAlign: field.textAlign as React.CSSProperties["textAlign"],
              lineHeight: field.lineHeight
                ? `${field.lineHeight * pxPerMm}px`
                : `${fontSizePx * 1.2}px`,
              width: "100%",
            }}
          >
            {field.value}
          </span>
        </div>
      )}
      {/* Optional: Visual resize handles or drag indicators for a more premium feel */}
      {/* {isSelected && (
        <div className="absolute inset-0 pointer-events-none border-2 border-blue-400 rounded-lg animate-pulse" />
      )} */}
    </div>
  );
};

function getJustifyContent(
  textAlign: string
): React.CSSProperties["justifyContent"] {
  switch (textAlign) {
    case "center":
      return "center";
    case "right":
      return "flex-end";
    default:
      return "flex-start";
  }
}