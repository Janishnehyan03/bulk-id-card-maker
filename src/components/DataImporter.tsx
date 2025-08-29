import React, { useState, useRef } from "react";
import {
  Upload,
  Users,
  GraduationCap,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { DataSource } from "../types";
import { demoEmployees, demoStudents } from "../data/demoData";
import * as XLSX from "xlsx";

/**
 * Modern, accessible, and premium DataImporter:
 * - Clean, focused layout with micro-interactions and dark mode support.
 * - Drag-and-drop uploader with keyboard accessibility.
 * - Consistent design system tokens and a11y.
 */
interface DataImporterProps {
  onDataImport: (data: DataSource, type: "employee" | "student") => void;
}

export default function DataImporter({ onDataImport }: DataImporterProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);

    const fileName = file.name.toLowerCase();
    const isJson = file.type === "application/json" || fileName.endsWith(".json");
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");
    const isCsv = fileName.endsWith(".csv");

    if (isJson) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (Array.isArray(data)) {
            const isEmployee = data.some((item) => {
              const obj = item as Record<string, any>;
              return (
                ("employeeId" in obj && typeof obj.employeeId === "string") ||
                ("position" in obj && typeof obj.position === "string")
              );
            });
            onDataImport(data, isEmployee ? "employee" : "student");
          } else {
            alert("JSON file must contain an array of objects.");
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
          alert("Invalid JSON file. Please check the format.");
        }
      };
      reader.readAsText(file);
    } else if (isExcel || isCsv) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          if (Array.isArray(jsonData)) {
            // Try to detect type
            const isEmployee = jsonData.some((item) => {
              const obj = item as Record<string, any>;
              return (
                ("employeeId" in obj && typeof obj.employeeId === "string") ||
                ("position" in obj && typeof obj.position === "string")
              );
            });
            onDataImport(jsonData as DataSource, isEmployee ? "employee" : "student");
          } else {
            alert("Excel/CSV must contain a table of objects.");
          }
        } catch (error) {
          console.error("Error parsing Excel/CSV:", error);
          alert("Invalid Excel/CSV file. Please check the format.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a JSON, Excel (.xlsx/.xls), or CSV file.");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section className="max-w-xl mx-auto space-y-7" aria-labelledby="import-data-heading">
      {/* Upload Card */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer shadow-sm bg-card border-border
        ${dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "hover:border-primary/70"}`}
        tabIndex={0}
        aria-label="Upload data file"
        aria-describedby="import-data-desc"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
        }}
      >
        <Upload
          className={`mx-auto h-14 w-14 mb-4 transition-colors ${
            dragActive ? "text-blue-500" : "text-muted-foreground"
          }`}
        />
        <p className="text-lg font-semibold text-foreground">
          Drag & drop your{" "}
          <span className="text-primary">JSON, Excel (.xlsx/.xls), or CSV</span> file here
        </p>
        <p id="import-data-desc" className="text-sm text-muted-foreground mb-4">
          or click to select from your computer
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.xlsx,.xls,.csv"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* File preview */}
        {selectedFile && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted rounded-md py-2 px-3">
            <FileText className="h-4 w-4" />
            <span>{selectedFile.name}</span>
            <span className="text-muted-foreground/70">
              ({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-900 rounded-xl shadow-sm">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="h-6 w-6 text-primary shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-semibold">Excel/CSV/JSON Upload Supported</p>
            <p>
              You can import data from Excel (.xlsx/.xls), CSV, or JSON files. Make sure your file contains a table of employees or students with appropriate columns.
            </p>
          </div>
        </div>
      </div>

      {/* Demo Data */}
      <div className="pt-6 border-t border-border">
        <p className="text-base font-semibold text-foreground mb-4">
          Or try with demo data
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => onDataImport(demoEmployees, "employee")}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-600 text-white font-medium shadow hover:bg-emerald-700 hover:shadow-md transition"
          >
            <Users className="h-4 w-4" />
            Employees
          </button>
          <button
            type="button"
            onClick={() => onDataImport(demoStudents, "student")}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-purple-600 text-white font-medium shadow hover:bg-purple-700 hover:shadow-md transition"
          >
            <GraduationCap className="h-4 w-4" />
            Students
          </button>
        </div>
      </div>
    </section>
  );
}