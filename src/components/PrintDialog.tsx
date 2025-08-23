import React, { useState } from "react";
import { X, Download, Settings, FileText } from "lucide-react";
import { CardTemplate, DataSource, PrintSettings } from "../types";
import jsPDF from "jspdf";

interface PrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  template: CardTemplate;
  data: DataSource;
  dataType: "employee" | "student";
}

// --- Constants (defined outside component for clarity) ---
const PAPER_WIDTH_A3 = 297;
const PAPER_HEIGHT_A3 = 420;
const CARD_WIDTH_MM = 57;
const CARD_HEIGHT_MM = 90;
const ITEMS_PER_ROW = 5;
const ITEMS_PER_COLUMN = 4;
const ITEMS_PER_PAGE = ITEMS_PER_ROW * ITEMS_PER_COLUMN; // 20

// --- Main Component ---
export default function PrintDialog({ isOpen, onClose, template, data }: PrintDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const printSettings: PrintSettings = {
    paperSize: "A3",
    itemsPerRow: ITEMS_PER_ROW,
    itemsPerColumn: ITEMS_PER_COLUMN,
    margin: 15, // Adjusted for better fit
    bleed: 3, // Not used in this logic but good to have
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [PAPER_WIDTH_A3, PAPER_HEIGHT_A3],
      });

      if (template.isDoubleSided) {
        await generateDoubleSidedPDF(pdf);
      } else {
        await generateSingleSidedPDF(pdf);
      }

      pdf.save(`${template.name}_cards_A3.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred while generating the PDF. Please check the console for details.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateSingleSidedPDF = async (pdf: jsPDF) => {
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

    for (let i = 0; i < data.length; i++) {
      const pageIndex = Math.floor(i / ITEMS_PER_PAGE);
      const indexOnPage = i % ITEMS_PER_PAGE;

      if (indexOnPage === 0 && pageIndex > 0) {
        pdf.addPage();
      }

      setProgress(Math.round(((i + 1) / data.length) * 100));

      const row = Math.floor(indexOnPage / ITEMS_PER_ROW);
      const col = indexOnPage % ITEMS_PER_ROW;
      
      const x = printSettings.margin + col * CARD_WIDTH_MM;
      const y = printSettings.margin + row * CARD_HEIGHT_MM;
      
      const cardImage = await renderCardToImage(data[i], "front");
      pdf.addImage(cardImage, "PNG", x, y, CARD_WIDTH_MM, CARD_HEIGHT_MM);
    }
  };

  const generateDoubleSidedPDF = async (pdf: jsPDF) => {
    const cardsPerPage = ITEMS_PER_PAGE / 2; // 10 cards (10 fronts, 10 backs)
    const totalPages = Math.ceil(data.length / cardsPerPage);

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      for (let i = 0; i < cardsPerPage; i++) {
        const dataIndex = page * cardsPerPage + i;
        if (dataIndex >= data.length) break;

        setProgress(Math.round(((dataIndex + 1) / data.length) * 100));

        const record = data[dataIndex];
        const row = Math.floor(i / ITEMS_PER_ROW);
        const col = i % ITEMS_PER_ROW;
        
        // --- Render and place FRONT side (top half of the page) ---
        const frontX = printSettings.margin + col * CARD_WIDTH_MM;
        const frontY = printSettings.margin + row * CARD_HEIGHT_MM;
        const frontImage = await renderCardToImage(record, "front");
        pdf.addImage(frontImage, "PNG", frontX, frontY, CARD_WIDTH_MM, CARD_HEIGHT_MM);
        
        // --- Render and place BACK side (bottom half, no rotation) ---
        const backPositionIndex = i + cardsPerPage; // Place in the second half
        const backRow = Math.floor(backPositionIndex / ITEMS_PER_ROW);
        const backCol = backPositionIndex % ITEMS_PER_ROW;
        const backX = printSettings.margin + backCol * CARD_WIDTH_MM;
        const backY = printSettings.margin + backRow * CARD_HEIGHT_MM;
        
        const backImage = await renderCardToImage(record, "back");
        
        // Add back image without rotation
        pdf.addImage(backImage, "PNG", backX, backY, CARD_WIDTH_MM, CARD_HEIGHT_MM);
      }
    }
  };

  const renderCardToImage = async (record: any, side: "front" | "back"): Promise<string> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Render at 300 DPI for high quality printing
    const dpi = 300;
    const scaleFactor = dpi / 25.4; // Pixels per mm
    canvas.width = Math.round(CARD_WIDTH_MM * scaleFactor);
    canvas.height = Math.round(CARD_HEIGHT_MM * scaleFactor);

    if (!ctx) throw new Error("Could not get canvas context");
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const backgroundImage = side === "front" ? template.frontImage : template.backImage;
    if (backgroundImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve();
        };
        img.onerror = () => resolve(); // Continue even if background fails
        img.src = backgroundImage;
      });
    }

    const sideFields = template.fields.filter((field) => field.side === side);
    for (const field of sideFields) {
      const fieldValue = record[field.key] || "";
      ctx.save();

      if (field.key === "photo" && fieldValue) {
        const photoImg = new Image();
        photoImg.crossOrigin = "anonymous";
        await new Promise<void>((resolve) => {
          photoImg.onload = () => {
            ctx.drawImage(
              photoImg,
              field.x * scaleFactor,
              field.y * scaleFactor,
              field.width * scaleFactor,
              field.height * scaleFactor
            );
            resolve();
          };
          photoImg.onerror = () => resolve();
          photoImg.src = fieldValue;
        });
      } else {
        // Correct font size conversion (Points to Pixels)
        // 1 point = 1/72 inch. DPI = pixels/inch. So, pt_px = pt/72 * DPI
        const fontSizePx = (field.fontSize / 72) * dpi;
        ctx.fillStyle = field.color;
        ctx.font = `${field.fontWeight} ${fontSizePx}px ${field.fontFamily}`;
        ctx.textAlign = field.textAlign as CanvasTextAlign;
        ctx.textBaseline = "middle"; // For better vertical alignment

        const textX = field.x * scaleFactor;
        const textY = (field.y + field.height / 2) * scaleFactor; // Center vertically

        let alignedX = textX;
        if (field.textAlign === "center") {
          alignedX += (field.width * scaleFactor) / 2;
        } else if (field.textAlign === "right") {
          alignedX += field.width * scaleFactor;
        }

        // Handle individual field rotation
        if (field.rotation) {
          const centerX = textX + (field.width * scaleFactor) / 2;
          const centerY = textY; // Already middle
          ctx.translate(centerX, centerY);
          ctx.rotate(field.rotation * (Math.PI / 180));
          ctx.translate(-centerX, -centerY);
        }
        
        ctx.fillText(fieldValue, alignedX, textY);
      }
      ctx.restore();
    }
    return canvas.toDataURL("image/png", 1.0);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Print Preview (A3)</h2>
          </div>
          <button onClick={onClose} disabled={isGenerating} className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* ... Dialog content remains the same ... */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Print Specifications</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>Paper Size:</strong> A3 (297 × 420 mm)</div>
              <div><strong>Card Size:</strong> 57mm × 90mm</div>
              <div><strong>Layout:</strong> 5 cards per row × 4 rows = 20 positions per sheet</div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Print Summary</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Total Records: {data.length}</div>
              <div><strong>Single-sided:</strong> {Math.ceil(data.length / ITEMS_PER_PAGE)} sheet(s) required.</div>
              <div><strong>Double-sided:</strong> {Math.ceil(data.length / (ITEMS_PER_PAGE / 2))} sheet(s) required.</div>
            </div>
          </div>
        </div>

        {isGenerating && (
          <div className="px-6 pb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.2s' }}></div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">Generating PDF... {progress}%</p>
          </div>
        )}

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 mt-auto">
          <button onClick={onClose} disabled={isGenerating} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
          <button onClick={generatePDF} disabled={isGenerating} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Download className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}