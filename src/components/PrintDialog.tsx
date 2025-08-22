import React, { useState } from 'react';
import { X, Download, Settings, FileText } from 'lucide-react';
import { CardTemplate, DataSource, PrintSettings } from '../types';
import jsPDF from 'jspdf';

interface PrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  template: CardTemplate;
  data: DataSource;
  dataType: 'employee' | 'student';
}

export default function PrintDialog({ isOpen, onClose, template, data, dataType }: PrintDialogProps) {
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    paperSize: 'A4',
    itemsPerRow: 2,
    itemsPerColumn: 4,
    margin: 20,
    bleed: 5
  });

  const paperSizes = {
    A4: { width: 210, height: 297 },
    A3: { width: 297, height: 420 },
    Letter: { width: 216, height: 279 },
    Custom: { width: 210, height: 297 }
  };

  const generatePDF = async () => {
    const { width: paperWidth, height: paperHeight } = paperSizes[printSettings.paperSize];
    const pdf = new jsPDF({
      orientation: paperWidth > paperHeight ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [paperWidth, paperHeight]
    });

    const cardWidthMM = (template.width * 0.264583); // Convert px to mm (96 DPI)
    const cardHeightMM = (template.height * 0.264583);
    
    const availableWidth = paperWidth - (printSettings.margin * 2);
    const availableHeight = paperHeight - (printSettings.margin * 2);
    
    const actualItemsPerRow = printSettings.itemsPerRow;
    const actualItemsPerColumn = printSettings.itemsPerColumn;
    const itemsPerPage = actualItemsPerRow * actualItemsPerColumn;

    // Calculate spacing
    const cardSpacingX = (availableWidth - (actualItemsPerRow * cardWidthMM)) / Math.max(1, actualItemsPerRow - 1);
    const cardSpacingY = (availableHeight - (actualItemsPerColumn * cardHeightMM)) / Math.max(1, actualItemsPerColumn - 1);

    if (template.isDoubleSided) {
      // Double-sided layout: Front sides first, then back sides
      await generateDoubleSidedPDF(pdf, cardWidthMM, cardHeightMM, actualItemsPerRow, actualItemsPerColumn, cardSpacingX, cardSpacingY);
    } else {
      // Single-sided layout
      await generateSingleSidedPDF(pdf, cardWidthMM, cardHeightMM, actualItemsPerRow, actualItemsPerColumn, cardSpacingX, cardSpacingY);
    }

    // Save PDF
    pdf.save(`${template.name}_${dataType}_cards.pdf`);
  };

  const generateSingleSidedPDF = async (pdf: jsPDF, cardWidthMM: number, cardHeightMM: number, itemsPerRow: number, itemsPerColumn: number, spacingX: number, spacingY: number) => {
    const itemsPerPage = itemsPerRow * itemsPerColumn;
    let currentPage = 0;

    for (let i = 0; i < data.length; i++) {
      if (i > 0 && i % itemsPerPage === 0) {
        pdf.addPage();
        currentPage++;
      }

      const positionInPage = i % itemsPerPage;
      const row = Math.floor(positionInPage / itemsPerRow);
      const col = positionInPage % itemsPerRow;
      
      const x = printSettings.margin + (col * (cardWidthMM + spacingX));
      const y = printSettings.margin + (row * (cardHeightMM + spacingY));

      await renderCardToPDF(pdf, data[i], 'front', x, y, cardWidthMM, cardHeightMM);
    }
  };

  const generateDoubleSidedPDF = async (pdf: jsPDF, cardWidthMM: number, cardHeightMM: number, itemsPerRow: number, itemsPerColumn: number, spacingX: number, spacingY: number) => {
    const itemsPerPage = itemsPerRow * itemsPerColumn;
    
    // Generate front sides
    for (let i = 0; i < data.length; i++) {
      if (i > 0 && i % itemsPerPage === 0) {
        pdf.addPage();
      }

      const positionInPage = i % itemsPerPage;
      const row = Math.floor(positionInPage / itemsPerRow);
      const col = positionInPage % itemsPerRow;
      
      const x = printSettings.margin + (col * (cardWidthMM + spacingX));
      const y = printSettings.margin + (row * (cardHeightMM + spacingY));

      await renderCardToPDF(pdf, data[i], 'front', x, y, cardWidthMM, cardHeightMM);
    }

    // Add new page for back sides
    pdf.addPage();
    
    // Generate back sides (in reverse order for proper alignment when printing)
    for (let i = 0; i < data.length; i++) {
      if (i > 0 && i % itemsPerPage === 0) {
        pdf.addPage();
      }

      const positionInPage = i % itemsPerPage;
      const row = Math.floor(positionInPage / itemsPerRow);
      // Reverse column order for back side alignment
      const col = (itemsPerRow - 1) - (positionInPage % itemsPerRow);
      
      const x = printSettings.margin + (col * (cardWidthMM + spacingX));
      const y = printSettings.margin + (row * (cardHeightMM + spacingY));

      await renderCardToPDF(pdf, data[i], 'back', x, y, cardWidthMM, cardHeightMM);
    }
  };

  const renderCardToPDF = async (pdf: jsPDF, record: any, side: 'front' | 'back', x: number, y: number, width: number, height: number) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = template.width;
    canvas.height = template.height;

    if (ctx) {
      // Draw background image
      const backgroundImage = side === 'front' ? template.frontImage : template.backImage;
      if (backgroundImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, 0, 0, template.width, template.height);
            resolve(void 0);
          };
          img.src = backgroundImage;
        });
      }

      // Draw fields for the current side
      const sideFields = template.fields.filter(field => field.side === side);
      for (const field of sideFields) {
        const fieldValue = (record as any)[field.key] || '';
        
        if (field.key === 'photo' && fieldValue) {
          // Draw photo
          const photoImg = new Image();
          photoImg.crossOrigin = 'anonymous';
          await new Promise((resolve) => {
            photoImg.onload = () => {
              ctx.drawImage(photoImg, field.x, field.y, field.width, field.height);
              resolve(void 0);
            };
            photoImg.onerror = () => resolve(void 0);
            photoImg.src = fieldValue;
          });
        } else {
          // Draw text
          ctx.fillStyle = field.color;
          ctx.font = `${field.fontWeight} ${field.fontSize}px ${field.fontFamily}`;
          ctx.textAlign = field.textAlign;
          
          const textX = field.textAlign === 'center' 
            ? field.x + field.width / 2 
            : field.textAlign === 'right'
            ? field.x + field.width
            : field.x;
            
          ctx.fillText(fieldValue, textX, field.y + field.fontSize);
        }
      }

      // Add canvas to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', x, y, width, height);
    }
  };

  if (!isOpen) return null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-90vh overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Print Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Paper Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paper Size
            </label>
            <select
              value={printSettings.paperSize}
              onChange={(e) => setPrintSettings(prev => ({ 
                ...prev, 
                paperSize: e.target.value as PrintSettings['paperSize']
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="A4">A4 (210 × 297 mm)</option>
              <option value="A3">A3 (297 × 420 mm)</option>
              <option value="Letter">Letter (216 × 279 mm)</option>
              <option value="Custom">Custom Size</option>
            </select>
          </div>

          {/* Custom Size Inputs */}
          {printSettings.paperSize === 'Custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width (mm)
                </label>
                <input
                  type="number"
                  value={printSettings.customWidth || 210}
                  onChange={(e) => setPrintSettings(prev => ({ 
                    ...prev, 
                    customWidth: parseInt(e.target.value) 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (mm)
                </label>
                <input
                  type="number"
                  value={printSettings.customHeight || 297}
                  onChange={(e) => setPrintSettings(prev => ({ 
                    ...prev, 
                    customHeight: parseInt(e.target.value) 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Layout Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items per Row
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={printSettings.itemsPerRow}
                onChange={(e) => setPrintSettings(prev => ({ 
                  ...prev, 
                  itemsPerRow: parseInt(e.target.value) 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items per Column
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={printSettings.itemsPerColumn}
                onChange={(e) => setPrintSettings(prev => ({ 
                  ...prev, 
                  itemsPerColumn: parseInt(e.target.value) 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Spacing Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Margin (mm)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={printSettings.margin}
                onChange={(e) => setPrintSettings(prev => ({ 
                  ...prev, 
                  margin: parseInt(e.target.value) 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spacing (mm)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={printSettings.bleed}
                onChange={(e) => setPrintSettings(prev => ({ 
                  ...prev, 
                  bleed: parseInt(e.target.value) 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Double-sided Warning */}
          {template.isDoubleSided && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-amber-800">Double-sided Printing</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    This template has a back side. The PDF will generate front sides first, then back sides on separate pages.
                    Back sides are arranged in reverse order for proper alignment when printing double-sided.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Print Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Print Summary</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Total Records: {data.length}</div>
              <div>Cards per Page: {printSettings.itemsPerRow * printSettings.itemsPerColumn}</div>
              <div>Estimated Pages: {Math.ceil(data.length / (printSettings.itemsPerRow * printSettings.itemsPerColumn))}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              generatePDF();
              onClose();
            }}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
          >
            <Download className="h-4 w-4" />
            Generate PDF
          </button>
        </div>
      </div>
    </div>
  );
}