import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Layers, RotateCcw } from 'lucide-react';
import { CardTemplate } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TemplateUploaderProps {
  onTemplateCreate: (template: CardTemplate) => void;
}

export default function TemplateUploader({ onTemplateCreate }: TemplateUploaderProps) {
  const [frontImage, setFrontImage] = useState<string>('');
  const [backImage, setBackImage] = useState<string>('');
  const [templateName, setTemplateName] = useState('');
  const [isDoubleSided, setIsDoubleSided] = useState(false);
  // Portrait default: 340w x 540h (for better aspect for ID cards)
  const [dimensions, setDimensions] = useState({ width: 340, height: 540 });

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File, type: 'front' | 'back') => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (type === 'front') {
          setFrontImage(imageUrl);
        } else {
          setBackImage(imageUrl);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload an image file.');
    }
  };

  const handleCreateTemplate = () => {
    if (!templateName || !frontImage) {
      alert('Please provide a template name and front image.');
      return;
    }

    const template: CardTemplate = {
      id: uuidv4(),
      name: templateName,
      frontImage,
      backImage: isDoubleSided ? backImage : undefined,
      width: dimensions.width,
      height: dimensions.height,
      isDoubleSided,
      fields: [],
    };

    onTemplateCreate(template);

    // Reset form
    setTemplateName('');
    setFrontImage('');
    setBackImage('');
    setIsDoubleSided(false);
    setDimensions({ width: 340, height: 540 }); // Reset to portrait defaults
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-50">
      <h2 className="text-xl font-bold mb-4 text-blue-800">Upload ID Card Template</h2>
      {/* Template Name */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-blue-700 mb-2">
          Template Name
        </label>
        <input
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="e.g., Employee ID Card"
          className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {/* Dimensions */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-blue-700 mb-2">
            Width (px)
          </label>
          <input
            type="number"
            value={dimensions.width}
            min={100}
            max={1000}
            onChange={(e) =>
              setDimensions((prev) => ({ ...prev, width: parseInt(e.target.value || '0', 10) }))
            }
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-blue-700 mb-2">
            Height (px)
          </label>
          <input
            type="number"
            value={dimensions.height}
            min={100}
            max={1500}
            onChange={(e) =>
              setDimensions((prev) => ({ ...prev, height: parseInt(e.target.value || '0', 10) }))
            }
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      {/* Double-sided toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isDoubleSided}
            onChange={(e) => setIsDoubleSided(e.target.checked)}
            className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-semibold text-blue-700">Double-sided ID Card</span>
        </label>
      </div>
      {/* Front Image Upload */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-blue-700 mb-2">
          Front Side Template
        </label>
        <div className="border-2 border-dashed border-blue-200 rounded-xl p-4 bg-blue-50">
          {frontImage ? (
            <div className="relative">
              <img
                src={frontImage}
                alt="Front template"
                className="max-w-full h-auto rounded shadow border border-blue-100"
                style={{ maxHeight: '200px' }}
              />
              <button
                type="button"
                onClick={() => setFrontImage('')}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon className="mx-auto h-8 w-8 text-blue-400 mb-2" />
              <button
                type="button"
                onClick={() => frontInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Click to upload front side
              </button>
            </div>
          )}
        </div>
        <input
          ref={frontInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file, 'front');
          }}
          className="hidden"
        />
      </div>
      {/* Back Image Upload (if double-sided) */}
      {isDoubleSided && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-blue-700 mb-2">
            Back Side Template
          </label>
          <div className="border-2 border-dashed border-blue-200 rounded-xl p-4 bg-blue-50">
            {backImage ? (
              <div className="relative">
                <img
                  src={backImage}
                  alt="Back template"
                  className="max-w-full h-auto rounded shadow border border-blue-100"
                  style={{ maxHeight: '200px' }}
                />
                <button
                  type="button"
                  onClick={() => setBackImage('')}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Layers className="mx-auto h-8 w-8 text-blue-400 mb-2" />
                <button
                  type="button"
                  onClick={() => backInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Click to upload back side
                </button>
              </div>
            )}
          </div>
          <input
            ref={backInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file, 'back');
            }}
            className="hidden"
          />
        </div>
      )}
      {/* Create Template Button */}
      <button
        type="button"
        onClick={handleCreateTemplate}
        disabled={!templateName || !frontImage}
        className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Create Template
      </button>
    </div>
  );
}