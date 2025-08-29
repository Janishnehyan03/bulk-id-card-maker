import { Trash2, X } from "lucide-react";
import { CardField } from "../types";

/**
 * Redesigned FieldPropertiesPanel:
 * - Modern, accessible, and visually polished (shadcn/ui + Tailwind).
 * - Clean layout, clear grouping, and consistent design system tokens.
 * - Micro-interactions, focus states, and dark mode ready.
 */
interface FieldPropertiesPanelProps {
  field: CardField | null;
  onUpdate: (fieldId: string, updates: Partial<CardField>) => void;
  onDelete: (fieldId: string) => void;
  onClose: () => void;
}

export const FieldPropertiesPanel = ({
  field,
  onUpdate,
  onDelete,
  onClose,
}: FieldPropertiesPanelProps) => {
  if (!field) return null;

  const handleUpdate = (updates: Partial<CardField>) => {
    onUpdate(field.id, updates);
  };

  return (
    <aside className="w-80 border-l border-border bg-card shadow-2xl flex flex-col transition-colors" aria-label="Field properties panel">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/60">
        <h3 className="text-sm font-semibold text-foreground">
          Properties{" "}
          <span className="font-normal text-muted-foreground">({field.label})</span>
        </h3>
        <button
          onClick={onClose}
          aria-label="Close properties"
          className="p-1 text-muted-foreground hover:bg-muted rounded transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-4 overflow-y-auto space-y-7">
        {/* Position */}
        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wide">Position</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">X (mm)</label>
              <input
                type="number"
                step="0.1"
                value={field.x.toFixed(1)}
                onChange={(e) => handleUpdate({ x: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 border border-border bg-background rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Y (mm)</label>
              <input
                type="number"
                step="0.1"
                value={field.y.toFixed(1)}
                onChange={(e) => handleUpdate({ y: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 border border-border bg-background rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>
        </section>

        {/* Size */}
        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wide">Size</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Width (mm)</label>
              <input
                type="number"
                step="0.1"
                value={field.width.toFixed(1)}
                onChange={(e) => handleUpdate({ width: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 border border-border bg-background rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Height (mm)</label>
              <input
                type="number"
                step="0.1"
                value={field.height.toFixed(1)}
                onChange={(e) => handleUpdate({ height: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 border border-border bg-background rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>
        </section>

        {/* Font Properties (Text only) */}
        {field.key !== "photo" && (
          <section>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wide">Typography</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Font Size (pt)</label>
                <input
                  type="number"
                  min={6}
                  max={96}
                  value={field.fontSize}
                  onChange={(e) =>
                    handleUpdate({ fontSize: parseInt(e.target.value) || 12 })
                  }
                  className="w-full px-2 py-1 border border-border bg-background rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={field.color}
                    onChange={(e) => handleUpdate({ color: e.target.value })}
                    className="w-10 h-8 p-0 border-none rounded cursor-pointer"
                    aria-label="Choose color"
                  />
                  <span className="text-xs text-muted-foreground">{field.color}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Alignment</label>
                <div className="flex gap-1 mt-1" role="group" aria-label="Text alignment">
                  {["left", "center", "right"].map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => handleUpdate({ textAlign: align as any })}
                      className={`flex-1 py-1 rounded border text-xs transition-colors
                        ${
                          field.textAlign === align
                            ? "bg-primary text-white border-primary shadow"
                            : "border-border text-foreground hover:bg-muted"
                        }`}
                      aria-pressed={field.textAlign === align}
                    >
                      {align.charAt(0).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Weight</label>
                <select
                  value={field.fontWeight}
                  onChange={(e) =>
                    handleUpdate({ fontWeight: e.target.value as any })
                  }
                  className="w-full px-2 py-1 border border-border bg-background rounded text-sm mt-1 focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {/* Layer & Rotation */}
        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wide">Arrange</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Layer</label>
              <input
                type="number"
                value={field.layer}
                onChange={(e) =>
                  handleUpdate({ layer: parseInt(e.target.value) || 0 })
                }
                className="w-full px-2 py-1 border border-border bg-background rounded text-sm mt-1 focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Rotation (°)
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                value={field.rotation}
                onChange={(e) =>
                  handleUpdate({ rotation: parseInt(e.target.value) || 0 })
                }
                className="w-full mt-2 accent-blue-500"
                aria-valuenow={field.rotation}
                aria-valuemin={-180}
                aria-valuemax={180}
                aria-label="Rotation"
              />
              <div className="text-xs text-muted-foreground text-right mt-1">
                {field.rotation}°
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border">
        <button
          type="button"
          onClick={() => onDelete(field.id)}
          className="w-full flex items-center justify-center gap-2 p-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-200 dark:bg-red-700 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <Trash2 className="h-4 w-4" />
          Delete Field
        </button>
      </div>
    </aside>
  );
};