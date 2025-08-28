import jsPDF from "jspdf";
import { Download, FileText, X } from "lucide-react";
import { useState } from "react";
import { CardTemplate, DataSource } from "../types";

interface PrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  template: CardTemplate;
  data: DataSource;
  dataType: "employee" | "student";
}

// --- Paper & card constants (mm) ---
const PAPER_WIDTH_A3 = 297;
const PAPER_HEIGHT_A3 = 420;
const CARD_WIDTH_MM = 57; // Portrait orientation
const CARD_HEIGHT_MM = 90; // Portrait orientation
const ITEMS_PER_ROW = 5; // 5 items per row
const ITEMS_PER_COLUMN = 4; // 4 rows -> 20 placements per page
const ITEMS_PER_PAGE = ITEMS_PER_ROW * ITEMS_PER_COLUMN; // 20 placements/page

// For double-sided-on-same-page: 2 rows (10 placements) for fronts + 2 rows (10 placements) for backs
const UNIQUE_CARDS_PER_DS_PAGE = ITEMS_PER_ROW * 2; // 10 unique cards per page

// --- Spacing (as requested) ---
const GUTTER_MM_X = 0.48; // horizontal gap between cards
const GUTTER_MM_Y = 15; // vertical gap between cards
const OFFSET_LEFT_MM = 5.045; // offset from left edge of A3 to first card
const OFFSET_TOP_MM = 5.045; // offset from top edge of A3 to first card

// --- DPI and scaling helpers ---
const DPI = 300;
const MM_PER_INCH = 25.4;

const pxPerMm = (dpi = DPI) => dpi / MM_PER_INCH;
const getCanvasScale = (dpi = DPI) => {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  return { pxmm: pxPerMm(dpi), dpr };
};

// --- Grid placement helpers (fixed offset, no centering) ---
function gridPlacement(indexOnPage: number) {
  const row = Math.floor(indexOnPage / ITEMS_PER_ROW);
  const col = indexOnPage % ITEMS_PER_ROW;

  const x = OFFSET_LEFT_MM + col * (CARD_WIDTH_MM + GUTTER_MM_X);
  const y = OFFSET_TOP_MM + row * (CARD_HEIGHT_MM + GUTTER_MM_Y);

  return { x, y, row, col };
}

// Mirror ROW (top <-> bottom), keep the same column.
// This supports the requested back placement when using same-page duplex layout
// (front rows 0..1 map to back rows 3..2).
function mirrorRow(row: number) {
  return ITEMS_PER_COLUMN - 1 - row;
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function withClip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fn: () => void
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  fn();
  ctx.restore();
}

function drawTextBox(
  ctx: CanvasRenderingContext2D,
  text: string,
  opts: {
    x: number;
    y: number;
    w: number;
    h: number;
    fontFamily: string;
    fontWeight: string | number;
    fontSizePx: number;
    color: string;
    align: CanvasTextAlign;
    lineHeight?: number; // px
    rotationDeg?: number;
  }
) {
  const {
    x,
    y,
    w,
    h,
    fontFamily,
    fontWeight,
    fontSizePx,
    color,
    align,
    lineHeight = fontSizePx * 1.2,
    rotationDeg = 0,
  } = opts;

  ctx.save();

  // Rotate around center of field - matching CanvasField behavior
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.translate(cx, cy);
  if (rotationDeg) ctx.rotate((rotationDeg * Math.PI) / 180);
  ctx.translate(-cx, -cy);

  withClip(ctx, x, y, w, h, () => {
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "top"; // Consistent with CanvasField
    ctx.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;

    // Improved text wrapping to match HTML behavior
    const words = String(text ?? "").split(/\s+/);
    const lines: string[] = [];
    let current = "";

    const measure = (t: string) => ctx.measureText(t).width;

    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (measure(next) <= w || !current) {
        current = next;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);

    // Position text at top like HTML (textBaseline: 'top')
    let startY = y;

    for (const line of lines) {
      let tx = x;
      if (align === "center") tx = x + w / 2;
      else if (align === "right") tx = x + w;
      ctx.fillText(line, tx, startY);
      startY += lineHeight;

      // Stop if we exceed the height
      if (startY + lineHeight > y + h) break;
    }
  });

  ctx.restore();
}

async function drawImageBox(
  ctx: CanvasRenderingContext2D,
  src: string,
  opts: {
    x: number;
    y: number;
    w: number;
    h: number;
    rotationDeg?: number;
    radius?: number;
  }
) {
  if (!src) return;
  const { x, y, w, h, rotationDeg = 0, radius = 0 } = opts;

  try {
    const img = await loadImage(src);

    ctx.save();

    // Rotate around center - matching CanvasField behavior
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.translate(cx, cy);
    if (rotationDeg) ctx.rotate((rotationDeg * Math.PI) / 180);
    ctx.translate(-cx, -cy);

    if (radius > 0) {
      roundedRectPath(ctx, x, y, w, h, radius);
      ctx.clip();
    }

    // Use object-cover behavior like CSS
    const imgRatio = img.width / img.height;
    const boxRatio = w / h;

    let drawWidth, drawHeight, drawX, drawY;

    if (imgRatio > boxRatio) {
      // Image is wider, fit to height
      drawHeight = h;
      drawWidth = h * imgRatio;
      drawX = x + (w - drawWidth) / 2;
      drawY = y;
    } else {
      // Image is taller, fit to width
      drawWidth = w;
      drawHeight = w / imgRatio;
      drawX = x;
      drawY = y + (h - drawHeight) / 2;
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    ctx.restore();
  } catch (error) {
    console.warn("Failed to load image:", src, error);
    // Draw placeholder
    ctx.save();
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Image not found", x + w / 2, y + h / 2);
    ctx.restore();
  }
}

type Side = "front" | "back";

export default function PrintDialog({
  isOpen,
  onClose,
  template,
  data,
}: PrintDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const renderCardToImage = async (
    record: any,
    side: Side
  ): Promise<string> => {
    const { pxmm } = getCanvasScale(DPI);

    const Wpx = Math.round(CARD_WIDTH_MM * pxmm);
    const Hpx = Math.round(CARD_HEIGHT_MM * pxmm);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    canvas.width = Wpx;
    canvas.height = Hpx;

    // background
    ctx.clearRect(0, 0, Wpx, Hpx);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, Wpx, Hpx);

    // background image
    const backgroundImage =
      side === "front" ? template.frontImage : template.backImage;
    if (backgroundImage) {
      try {
        const img = await loadImage(backgroundImage);
        ctx.drawImage(img, 0, 0, Wpx, Hpx);
      } catch {
        // ignore bg failures
      }
    }

    // fields - sort by layer to maintain consistent rendering order
    const sideFields = template.fields
      .filter((f) => f.side === side)
      .sort((a, b) => (a.layer || 0) - (b.layer || 0));

    for (const field of sideFields) {
      const { pxmm } = getCanvasScale(DPI);
      const x = field.x * pxmm;
      const y = field.y * pxmm;
      const w = field.width * pxmm;
      const h = field.height * pxmm;

      if (field.key === "photo") {
        const src = (record as any)[field.key];
        if (src) {
          await drawImageBox(ctx, src, {
            x,
            y,
            w,
            h,
            rotationDeg: field.rotation || 0,
            radius: (field.borderRadius || 0) * pxmm,
          });
        }
        continue;
      }

      const value = String((record as any)[field.key] ?? "");
      // Use consistent font size calculation matching CanvasField
      const fontSizePx = (field.fontSize / 72) * DPI;

      drawTextBox(ctx, value, {
        x,
        y,
        w,
        h,
        fontFamily: field.fontFamily,
        fontWeight: field.fontWeight || "normal",
        fontSizePx,
        color: field.color || "#111827",
        align: (field.textAlign as CanvasTextAlign) || "left",
        lineHeight: field.lineHeight
          ? field.lineHeight * pxmm
          : fontSizePx * 1.2,
        rotationDeg: field.rotation || 0,
      });

      // Optional: draw border if present
      if ((field as any).borderWidth && (field as any).borderColor) {
        ctx.save();
        ctx.strokeStyle = (field as any).borderColor;
        ctx.lineWidth = (field as any).borderWidth * pxmm;
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
      }
    }

    return canvas.toDataURL("image/png", 1.0);
  };

  // Single-sided: up to 20 fronts per A3 page (rows 0..3) with requested gaps/offsets
  const generateSingleSidedPDF = async (pdf: jsPDF) => {
    for (let i = 0; i < data.length; i++) {
      const pageIndex = Math.floor(i / ITEMS_PER_PAGE);
      const indexOnPage = i % ITEMS_PER_PAGE;

      if (indexOnPage === 0 && pageIndex > 0) {
        pdf.addPage();
      }

      setProgress(Math.round(((i + 1) / data.length) * 100));

      const cardImage = await renderCardToImage(data[i], "front");
      const { x, y } = gridPlacement(indexOnPage);
      pdf.addImage(cardImage, "PNG", x, y, CARD_WIDTH_MM, CARD_HEIGHT_MM);
    }
  };

  // Double-sided ON THE SAME PAGE (10 unique cards/page):
  // - Fronts placed in rows 0..1 (top half).
  // - Backs placed in rows 3..2 (bottom half), same column, row-mirrored.
  const generateDoubleSidedPDF = async (pdf: jsPDF) => {
    const totalSheets = Math.ceil(data.length / UNIQUE_CARDS_PER_DS_PAGE);

    for (let p = 0; p < totalSheets; p++) {
      if (p > 0) pdf.addPage();

      const pageStart = p * UNIQUE_CARDS_PER_DS_PAGE;
      const count = Math.min(UNIQUE_CARDS_PER_DS_PAGE, data.length - pageStart);

      // Place fronts (rows 0..1)
      for (let i = 0; i < count; i++) {
        const dataIndex = pageStart + i;
        setProgress(Math.round(((dataIndex + 1) / data.length) * 100));

        const imgFront = await renderCardToImage(data[dataIndex], "front");
        // Front index spans only the top 2 rows (0..9)
        const frontIndex = i; // rows 0..1, cols 0..4
        const { x: fx, y: fy } = gridPlacement(frontIndex);
        pdf.addImage(imgFront, "PNG", fx, fy, CARD_WIDTH_MM, CARD_HEIGHT_MM);
      }

      // Place backs (rows 3..2), row-mirrored, same column
      for (let i = 0; i < count; i++) {
        const dataIndex = pageStart + i;

        const rowFront = Math.floor(i / ITEMS_PER_ROW); // 0 or 1
        const col = i % ITEMS_PER_ROW;
        const backRow = mirrorRow(rowFront); // 3 when 0, 2 when 1

        const backIndex = backRow * ITEMS_PER_ROW + col;
        const { x: bx, y: by } = gridPlacement(backIndex);

        const imgBack = await renderCardToImage(data[dataIndex], "back");
        pdf.addImage(imgBack, "PNG", bx, by, CARD_WIDTH_MM, CARD_HEIGHT_MM);
      }
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [PAPER_WIDTH_A3, PAPER_HEIGHT_A3],
        compress: true,
      });

      if (template.isDoubleSided) {
        await generateDoubleSidedPDF(pdf);
      } else {
        await generateSingleSidedPDF(pdf);
      }

      pdf.save(`${template.name}_cards_A3.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert(
        "An error occurred while generating the PDF. Please check the console for details."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const singleSheets = Math.ceil(data.length / ITEMS_PER_PAGE);
  const doubleSheets = Math.ceil(data.length / UNIQUE_CARDS_PER_DS_PAGE);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Print Preview (A3)
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Print Specifications
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>
                <strong>Paper Size:</strong> A3 (297 × 420 mm)
              </div>
              <div>
                <strong>Card Size:</strong> {CARD_WIDTH_MM} × {CARD_HEIGHT_MM}{" "}
                mm
              </div>
              <div>
                <strong>Placements per page:</strong> {ITEMS_PER_ROW} per row ×{" "}
                {ITEMS_PER_COLUMN} rows = {ITEMS_PER_PAGE}
              </div>
              <div>
                <strong>Top/Left Offset:</strong> {OFFSET_TOP_MM} mm
              </div>
              <div>
                <strong>Gutter X/Y:</strong> {GUTTER_MM_X} mm / {GUTTER_MM_Y} mm
              </div>
              {template.isDoubleSided ? (
                <div>
                  <strong>Double-sided layout:</strong> 10 fronts (rows 1–2) +
                  10 backs (rows 3–4) on the same page; next 10 cards move to
                  the next page.
                </div>
              ) : null}
              <div>
                <strong>DPI:</strong> {DPI}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              Print Summary
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Total Records: {data.length}</div>
              <div>
                <strong>Single-sided:</strong> {singleSheets} sheet
                {singleSheets !== 1 ? "s" : ""} required (up to 20 fronts per
                page).
              </div>
              <div>
                <strong>Double-sided (same page):</strong> {doubleSheets} sheet
                {doubleSheets !== 1 ? "s" : ""} required (10 cards per page:
                fronts on top, backs on bottom).
              </div>
            </div>
          </div>
        </div>

        {isGenerating && (
          <div className="px-6 pb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%`, transition: "width 0.2s" }}
              />
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              Generating PDF... {progress}%
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 mt-auto">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
