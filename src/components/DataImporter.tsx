// DataImporter.tsx
import React, { useState, useRef } from "react";
import { Upload, Users, GraduationCap, CheckCircle } from "lucide-react";
import * as XLSX from 'xlsx';
import { DataSource } from "../types";
import { demoEmployees, demoStudents } from "../data/demoData";

interface DataImporterProps {
  onDataImport: (data: DataSource, type: "employee" | "student") => void;
}

export default function DataImporter({ onDataImport }: DataImporterProps) {
  const [dragActive, setDragActive] = useState(false);
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
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'json') {
      handleJSONFile(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      handleExcelFile(file);
    } else {
      alert("Please upload a JSON or Excel file (.json, .xlsx, .xls)");
    }
  };

  const handleJSONFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data)) {
          // Auto-detect type based on common fields
          const isEmployee = data.some(
            (item) =>
              ("employeeId" in item && typeof item.employeeId === "string") ||
              ("position" in item && typeof item.position === "string")
          );
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
  };

  const handleExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          // Auto-detect type based on common fields
          const isEmployee = jsonData.some(
            (item: any) =>
              ("employeeId" in item || "employee_id" in item || "EmployeeID" in item) ||
              ("position" in item || "Position" in item)
          );
          
          // Normalize field names for consistency
          const normalizedData = jsonData.map((item: any) => {
            const normalizedItem: any = {};
            
            // Create a mapping of common field variations
            const fieldMappings = {
              id: ['id', 'ID', 'Id'],
              name: ['name', 'Name', 'full_name', 'fullName', 'Full Name'],
              employeeId: ['employeeId', 'employee_id', 'EmployeeID', 'Employee ID'],
              studentId: ['studentId', 'student_id', 'StudentID', 'Student ID'],
              position: ['position', 'Position', 'job_title', 'jobTitle'],
              department: ['department', 'Department', 'dept'],
              class: ['class', 'Class', 'grade', 'Grade'],
              section: ['section', 'Section'],
              rollNumber: ['rollNumber', 'roll_number', 'RollNumber', 'Roll Number'],
              email: ['email', 'Email', 'email_address'],
              phone: ['phone', 'Phone', 'mobile', 'Mobile', 'contact'],
              address: ['address', 'Address'],
              photo: ['photo', 'Photo', 'image', 'Image', 'picture'],
              fatherName: ['fatherName', 'father_name', 'Father Name'],
              motherName: ['motherName', 'mother_name', 'Mother Name'],
              joinDate: ['joinDate', 'join_date', 'joining_date', 'Join Date'],
              admissionDate: ['admissionDate', 'admission_date', 'Admission Date'],
              bloodGroup: ['bloodGroup', 'blood_group', 'Blood Group'],
              emergencyContact: ['emergencyContact', 'emergency_contact', 'Emergency Contact']
            };
            
            // Map fields using the mappings
            Object.entries(fieldMappings).forEach(([normalizedKey, variations]) => {
              for (const variation of variations) {
                if (variation in item && item[variation] !== undefined && item[variation] !== '') {
                  normalizedItem[normalizedKey] = item[variation];
                  break;
                }
              }
            });
            
            // Generate ID if not present
            if (!normalizedItem.id) {
              normalizedItem.id = Math.random().toString(36).substr(2, 9);
            }
            
            // Copy any other fields that weren't mapped
            Object.keys(item).forEach(key => {
              const found = Object.values(fieldMappings).some(variations => variations.includes(key));
              if (!found && !normalizedItem[key]) {
                normalizedItem[key] = item[key];
              }
            });
            
            return normalizedItem;
          });
          
          onDataImport(normalizedData, isEmployee ? "employee" : "student");
        } else {
          alert("Excel file appears to be empty or invalid.");
        }
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        alert("Invalid Excel file. Please check the format and try again.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset file input to allow re-uploading the same file if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drop your file here, or click to select
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Upload employee or student data (JSON, Excel, or CSV format)
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Select File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.xlsx,.xls"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Excel Upload Info */}
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-medium">Excel & CSV Support Available</p>
            <p className="text-green-600">
              Now supports JSON, Excel (.xlsx, .xls) formats. Upload your spreadsheet directly!
            </p>
          </div>
        </div>
      </div>

      {/* Demo Data Buttons */}
      <div className="pt-6 border-t border-gray-200">
        <p className="text-base font-medium text-gray-800 mb-3">
          Or use demo data:
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onDataImport(demoEmployees, "employee")}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium"
          >
            <Users className="h-4 w-4" />
            Employee Data
          </button>
          <button
            onClick={() => onDataImport(demoStudents, "student")}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <GraduationCap className="h-4 w-4" />
            Student Data
          </button>
        </div>
      </div>
    </div>
  );
}
