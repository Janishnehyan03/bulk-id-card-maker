import { Image as ImageIcon, Layers, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { CardTemplate } from "../types";

/**
 * Redesigned TemplateUploader:
 * - Accessible, modern, consistent with SaaS design system.
 * - Smooth CSS transitions, dark/light mode, micro-interactions.
 * - Clean layout, clear states, and a11y improvements.
 */
interface TemplateUploaderProps {
  onTemplateCreate: (template: CardTemplate) => void;
}

export default function TemplateUploader({ onTemplateCreate }: TemplateUploaderProps) {
  const [frontImage, setFrontImage] = useState<string>("");
  const [backImage, setBackImage] = useState<string>("");
  const [templateName, setTemplateName] = useState("");
  const [isDoubleSided, setIsDoubleSided] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 340, height: 540 });

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File, type: "front" | "back") => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (type === "front") {
          setFrontImage(imageUrl);
        } else {
          setBackImage(imageUrl);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload an image file.");
    }
  };

  const handleCreateTemplate = () => {
    if (!templateName || !frontImage) {
      alert("Please provide a template name and front image.");
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
    setTemplateName("");
    setFrontImage("");
    setBackImage("");
    setIsDoubleSided(false);
    setDimensions({ width: 340, height: 540 });
  };

  return (
    <section
      className="bg-card rounded-2xl shadow-lg p-8 border border-border space-y-7 transition-colors"
      aria-labelledby="upload-id-card-template"
    >
      {/* Header */}
      <h2
        id="upload-id-card-template"
        className="text-xl font-bold flex items-center gap-2 text-primary"
      >
        <span className="bg-blue-100 dark:bg-blue-950 p-2 rounded-lg">
          <Layers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </span>
        Upload ID Card Template
      </h2>

      {/* Template Name */}
      <div>
        <label
          htmlFor="template-name"
          className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2"
        >
          Template Name
        </label>
        <input
          id="template-name"
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="e.g., Employee ID Card"
          className="w-full px-4 py-2 border border-blue-200 dark:border-blue-800 bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition text-foreground"
          autoComplete="off"
        />
      </div>

      {/* Double-sided toggle */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isDoubleSided}
            onChange={(e) => setIsDoubleSided(e.target.checked)}
            className="rounded border-blue-300 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            Double-sided ID Card
          </span>
        </label>
      </div>

      {/* Uploads */}
      <div className="space-y-6">
        {/* Front */}
        <div>
          <label
            htmlFor="front-upload"
            className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2"
          >
            Front Side Template
          </label>
          <div
            className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl p-6 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors text-center relative group"
            tabIndex={0}
            aria-label="Front side template upload"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !frontImage) {
                frontInputRef.current?.click();
              }
            }}
          >
            {frontImage ? (
              <div className="relative inline-block">
                <img
                  src={frontImage}
                  alt="Front template preview"
                  className="max-h-48 rounded-lg shadow border border-blue-100 dark:border-blue-900"
                />
                <button
                  type="button"
                  aria-label="Remove front image"
                  onClick={() => setFrontImage("")}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow hover:bg-red-600 transition"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <ImageIcon className="mx-auto h-10 w-10 text-blue-400 mb-2" />
                <button
                  id="front-upload"
                  type="button"
                  onClick={() => frontInputRef.current?.click()}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold focus:underline"
                >
                  Click to upload front side
                </button>
              </>
            )}
          </div>
          <input
            ref={frontInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file, "front");
            }}
            className="hidden"
            tabIndex={-1}
          />
        </div>

        {/* Back (conditional) */}
        {isDoubleSided && (
          <div>
            <label
              htmlFor="back-upload"
              className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2"
            >
              Back Side Template
            </label>
            <div
              className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl p-6 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors text-center relative group"
              tabIndex={0}
              aria-label="Back side template upload"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !backImage) {
                  backInputRef.current?.click();
                }
              }}
            >
              {backImage ? (
                <div className="relative inline-block">
                  <img
                    src={backImage}
                    alt="Back template preview"
                    className="max-h-48 rounded-lg shadow border border-blue-100 dark:border-blue-900"
                  />
                  <button
                    type="button"
                    aria-label="Remove back image"
                    onClick={() => setBackImage("")}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow hover:bg-red-600 transition"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Layers className="mx-auto h-10 w-10 text-blue-400 mb-2" />
                  <button
                    id="back-upload"
                    type="button"
                    onClick={() => backInputRef.current?.click()}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold focus:underline"
                  >
                    Click to upload back side
                  </button>
                </>
              )}
            </div>
            <input
              ref={backInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, "back");
              }}
              className="hidden"
              tabIndex={-1}
            />
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={handleCreateTemplate}
        disabled={!templateName || !frontImage}
        className="w-full px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow hover:shadow-md transition-all focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
      >
        Create Template
      </button>
    </section>
  );
}