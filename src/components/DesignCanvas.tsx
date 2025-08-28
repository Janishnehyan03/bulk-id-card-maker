import React, { useEffect, useRef, useState } from "react";
import { CardField, CardTemplate, DataSource } from "../types";
import { CanvasField } from "./CanvasField.tsx"; // <-- New Component
import { FieldPropertiesPanel } from "./FieldProperties";

// --- Helpers moved outside the component for better organization ---
// Portrait dimensions: width < height
const MM_WIDTH = 57,
  MM_HEIGHT = 90; // mm (standard portrait card)

function getAvailableFields(record: any, _type: "employee" | "student") {
  if (!record) return [];
  const fields = Object.keys(record).filter((key) => key !== "id");
  return fields.map((key) => ({
    key,
    label:
      key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
    value: record[key],
  }));
}

function getImageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 570, height: 900 }); // fallback portrait
    img.src = url;
  });
}

// --- Main Component ---
interface DesignCanvasProps {
  template: CardTemplate;
  data: DataSource;
  dataType: "employee" | "student";
  selectedRecord: number;
  onTemplateUpdate: (template: CardTemplate) => void;
}

export default function DesignCanvas({
  template,
  data,
  dataType,
  selectedRecord,
  onTemplateUpdate,
}: DesignCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null); // For properties panel
  const [currentSide, setCurrentSide] = useState<"front" | "back">("front");
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 570, height: 900 });

  const currentRecord = data[selectedRecord];
  const availableFields = getAvailableFields(currentRecord, dataType);

  // Always portrait: pxPerMm based on portrait width
  const pxPerMm = canvasSize.width / MM_WIDTH;

  useEffect(() => {
    // Enforce portrait on template (width < height)
    let enforcedWidth = template.width;
    let enforcedHeight = template.height;
    if (enforcedWidth > enforcedHeight) {
      // Swap to portrait if someone tries to load a landscape template
      [enforcedWidth, enforcedHeight] = [enforcedHeight, enforcedWidth];
    }
    const imgUrl =
      currentSide === "front" ? template.frontImage : template.backImage;
    if (imgUrl) {
      getImageSize(imgUrl).then(() => {
        // Use the template's specified dimensions or scale to fit within reasonable bounds
        const maxW = 800,
          maxH = 1200; // Portrait max size
        // Always portrait aspect
        let newWidth, newHeight;
        if (enforcedWidth <= maxW && enforcedHeight <= maxH) {
          newWidth = enforcedWidth;
          newHeight = enforcedHeight;
        } else {
          // Scale down template dimensions to fit portrait bounds
          const scale = Math.min(maxW / enforcedWidth, maxH / enforcedHeight);
          newWidth = Math.round(enforcedWidth * scale);
          newHeight = Math.round(enforcedHeight * scale);
        }
        setCanvasSize({
          width: newWidth,
          height: newHeight,
        });
      });
    } else {
      // Use template dimensions or default, always portrait
      const maxW = 800,
        maxH = 1200;
      if (enforcedWidth <= maxW && enforcedHeight <= maxH) {
        setCanvasSize({ width: enforcedWidth, height: enforcedHeight });
      } else {
        const scale = Math.min(maxW / enforcedWidth, maxH / enforcedHeight);
        setCanvasSize({
          width: Math.round(enforcedWidth * scale),
          height: Math.round(enforcedHeight * scale),
        });
      }
    }
    // If needed, forcibly update the template to portrait
    if (
      template.width !== enforcedWidth ||
      template.height !== enforcedHeight
    ) {
      onTemplateUpdate({
        ...template,
        width: enforcedWidth,
        height: enforcedHeight,
      });
    }
    // eslint-disable-next-line
  }, [
    template.frontImage,
    template.backImage,
    template.width,
    template.height,
    currentSide,
  ]);

  const addField = (fieldInfo: {
    key: string;
    label: string;
    value: string;
  }) => {
    const newField: CardField = {
      id: Date.now().toString(),
      key: fieldInfo.key,
      label: fieldInfo.label,
      value: (currentRecord as any)[fieldInfo.key] || fieldInfo.value, // Use current record data
      side: currentSide,
      x: 10,
      y: 10, // Start at a corner
      width: fieldInfo.key === "photo" ? 20 : 40,
      height: fieldInfo.key === "photo" ? 24 : 6,
      fontSize: 14,
      fontFamily: "Arial",
      color: "#000000",
      textAlign: "left",
      fontWeight: "normal",
      layer: (template.fields.length || 0) + 1,
      rotation: 0,
    };
    onTemplateUpdate({ ...template, fields: [...template.fields, newField] });
    setSelectedFieldId(newField.id); // Auto-select the new field
  };

  const updateField = (fieldId: string, updates: Partial<CardField>) => {
    const updatedFields = template.fields.map((field) =>
      field.id === fieldId
        ? {
            ...field,
            ...updates,
            value:
              updates.value !== undefined
                ? updates.value
                : (currentRecord as any)[field.key] || field.value,
          }
        : field
    );
    onTemplateUpdate({ ...template, fields: updatedFields });
  };

  const deleteField = (fieldId: string) => {
    const updatedFields = template.fields.filter(
      (field) => field.id !== fieldId
    );
    onTemplateUpdate({ ...template, fields: updatedFields });
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
    if (editingFieldId === fieldId) setEditingFieldId(null);
  };

  const handleMouseDown = (e: React.MouseEvent, field: CardField) => {
    e.stopPropagation(); // Prevent canvas click from deselecting
    setSelectedFieldId(field.id);
    setIsDragging(true);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - field.x * pxPerMm,
        y: e.clientY - rect.top - field.y * pxPerMm,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedFieldId) return;

    const field = template.fields.find((f) => f.id === selectedFieldId);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && field) {
      // Calculate new position in pixels
      let newX_px = e.clientX - rect.left - dragOffset.x;
      let newY_px = e.clientY - rect.top - dragOffset.y;

      // Constrain within canvas boundaries
      const fieldWidth_px = field.width * pxPerMm;
      const fieldHeight_px = field.height * pxPerMm;

      newX_px = Math.max(
        0,
        Math.min(newX_px, canvasSize.width - fieldWidth_px)
      );
      newY_px = Math.max(
        0,
        Math.min(newY_px, canvasSize.height - fieldHeight_px)
      );

      updateField(selectedFieldId, {
        x: newX_px / pxPerMm,
        y: newY_px / pxPerMm,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Deselect when clicking on canvas background
  const handleCanvasMouseDown = () => {
    setSelectedFieldId(null);
    setEditingFieldId(null);
  };

  // Keyboard support for deleting fields
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedFieldId) {
        deleteField(selectedFieldId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFieldId]);

  useEffect(() => {
    if (template.fields.length > 0) {
      const updatedFields = template.fields.map((field) => ({
        ...field,
        value: (currentRecord as any)[field.key] || field.value,
      }));
      onTemplateUpdate({ ...template, fields: updatedFields });
    }
    // eslint-disable-next-line
  }, [selectedRecord, currentRecord]);

  const editingFieldData = editingFieldId
    ? template.fields.find((f) => f.id === editingFieldId)
    : null;

  return (
    <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Design Canvas</h2>
          {/* No orientation toggle: portrait only */}
          {template.isDoubleSided && (
            <div className="flex bg-gray-100 rounded-md">
              <button
                onClick={() => setCurrentSide("front")}
                className={`px-3 py-1 rounded-l-md text-sm font-medium transition-colors ${
                  currentSide === "front"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Front
              </button>
              <button
                onClick={() => setCurrentSide("back")}
                className={`px-3 py-1 rounded-r-md text-sm font-medium transition-colors ${
                  currentSide === "back"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
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

      <div className="flex flex-1 overflow-hidden">
        {/* Available Fields Panel */}
        <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
          <h3 className="font-medium text-gray-800 mb-3">Available Fields</h3>
          <div className="space-y-2">
            {availableFields.map((field) => (
              <button
                key={field.key}
                onClick={() => addField(field)}
                className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
              >
                <div className="font-medium text-gray-800">{field.label}</div>
                <div className="text-xs text-gray-500 truncate">
                  {field.value}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div
          className="flex-1 p-6 bg-gray-50 flex items-center justify-center overflow-auto"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            ref={canvasRef}
            className="relative bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg flex-shrink-0"
            style={{
              width: `${canvasSize.width}px`,
              height: `${canvasSize.height}px`,
              backgroundImage:
                currentSide === "front"
                  ? `url(${template.frontImage})`
                  : `url(${template.backImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
            onMouseDown={handleCanvasMouseDown}
          >
            {template.fields
              .filter((field) => field.side === currentSide)
              .sort((a, b) => (a.layer || 0) - (b.layer || 0)) // Ensure correct layering
              .map((field) => (
                <CanvasField
                  key={field.id}
                  field={field}
                  pxPerMm={pxPerMm}
                  isSelected={selectedFieldId === field.id}
                  onMouseDown={(e) => handleMouseDown(e, field)}
                  onDoubleClick={() => setEditingFieldId(field.id)}
                />
              ))}
            <div className="absolute left-2 bottom-2 text-xs text-gray-400 bg-white/70 px-2 py-1 rounded">
              {MM_WIDTH}mm × {MM_HEIGHT}mm
            </div>
          </div>
        </div>

        {/* Properties Sidebar */}
        <FieldPropertiesPanel
          field={editingFieldData ?? null}
          onUpdate={updateField}
          onDelete={deleteField}
          onClose={() => setEditingFieldId(null)}
        />
      </div>
    </div>
  );
}
