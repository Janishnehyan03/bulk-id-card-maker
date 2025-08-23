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
  const [dimensions, setDimensions] = useState({ width: 340, height: 215 });

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
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload ID Card Template</h2>

      {/* Template Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Template Name
        </label>
        <input
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="e.g., Employee ID Card"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Dimensions */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Width (px)
          </label>
          <input
            type="number"
            value={dimensions.width}
            onChange={(e) =>
              setDimensions((prev) => ({ ...prev, width: parseInt(e.target.value || '0', 10) }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Height (px)
          </label>
          <input
            type="number"
            value={dimensions.height}
            onChange={(e) =>
              setDimensions((prev) => ({ ...prev, height: parseInt(e.target.value || '0', 10) }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Double-sided ID Card</span>
        </label>
      </div>

      {/* Front Image Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Front Side Template
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          {frontImage ? (
            <div className="relative">
              <img
                src={frontImage}
                alt="Front template"
                className="max-w-full h-auto rounded"
                style={{ maxHeight: '200px' }}
              />
              <button
                onClick={() => setFrontImage('')}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <button
                onClick={() => frontInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 font-medium"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Back Side Template
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            {backImage ? (
              <div className="relative">
                <img
                  src={backImage}
                  alt="Back template"
                  className="max-w-full h-auto rounded"
                  style={{ maxHeight: '200px' }}
                />
                <button
                  onClick={() => setBackImage('')}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Layers className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <button
                  onClick={() => backInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
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
        onClick={handleCreateTemplate}
        disabled={!templateName || !frontImage}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Create Template
      </button>
    </div>
  );
}
