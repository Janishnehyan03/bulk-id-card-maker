import { CreditCard, Download, Eye, Users } from "lucide-react";
import { useState } from "react";
import DataImporter from "./components/DataImporter";
import DesignCanvas from "./components/DesignCanvas";
import PrintDialog from "./components/PrintDialog";
import TemplateUploader from "./components/TemplateUploader";
import { CardTemplate, DataSource } from "./types";

function App() {
  const [data, setData] = useState<DataSource>([]);
  const [dataType, setDataType] = useState<"employee" | "student">("employee");
  const [template, setTemplate] = useState<CardTemplate | null>(null);
  const [selectedRecord, setSelectedRecord] = useState(0);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

  const handleDataImport = (
    importedData: DataSource,
    type: "employee" | "student"
  ) => {
    setData(importedData);
    setDataType(type);
    setSelectedRecord(0);
    // Optional: reset template when new data is imported
    // setTemplate(null);
  };

  const handleTemplateCreate = (newTemplate: CardTemplate) => {
    setTemplate(newTemplate);
  };

  const handleTemplateUpdate = (updatedTemplate: CardTemplate) => {
    setTemplate(updatedTemplate);
  };

  const handleRecordNavigation = (direction: "prev" | "next") => {
    if (direction === "prev" && selectedRecord > 0) {
      setSelectedRecord(selectedRecord - 1);
    } else if (direction === "next" && selectedRecord < data.length - 1) {
      setSelectedRecord(selectedRecord + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                ID Card Designer
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {data.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  {data.length} {dataType === "employee" ? "Employees" : "Students"}
                </div>
              )}
              {template && data.length > 0 && (
                <button
                  onClick={() => setIsPrintDialogOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Print Cards
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Step Indicators */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                data.length > 0
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  data.length > 0 ? "bg-green-600 text-white" : "bg-blue-600 text-white"
                }`}
              >
                1
              </span>
              Import Data
            </div>
            <div className={`w-8 h-1 ${data.length > 0 ? "bg-gray-300" : "bg-gray-200"}`}></div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                template
                  ? "bg-green-100 text-green-800"
                  : data.length > 0
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  template
                    ? "bg-green-600 text-white"
                    : data.length > 0
                    ? "bg-blue-600 text-white"
                    : "bg-gray-400 text-white"
                }`}
              >
                2
              </span>
              Create Template
            </div>
            <div className={`w-8 h-1 ${template ? "bg-gray-300" : "bg-gray-200"}`}></div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                template && data.length > 0
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  template && data.length > 0 ? "bg-blue-600 text-white" : "bg-gray-400 text-white"
                }`}
              >
                3
              </span>
              Design & Print
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="space-y-6">
            <DataImporter onDataImport={handleDataImport} />
            {data.length > 0 && (
              <TemplateUploader onTemplateCreate={handleTemplateCreate} />
            )}
          </div>

          {/* Center Panel - Design Canvas */}
          <div className="lg:col-span-2">
            {template && data.length > 0 ? (
              <div className="space-y-4">
                {/* Record Navigation */}
                <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4">
                  <button
                    onClick={() => handleRecordNavigation("prev")}
                    disabled={selectedRecord === 0}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="text-center">
                    <div className="font-medium text-gray-800">
                      {(data[selectedRecord] as any).name || `Record ${selectedRecord + 1}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedRecord + 1} of {data.length}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRecordNavigation("next")}
                    disabled={selectedRecord === data.length - 1}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>

                <DesignCanvas
                  template={template}
                  data={data}
                  dataType={dataType}
                  selectedRecord={selectedRecord}
                  onTemplateUpdate={handleTemplateUpdate}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Eye className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Design</h3>
                  <p className="text-gray-500">
                    {!data.length
                      ? "Import your data first to get started"
                      : "Upload a template to begin designing your ID cards"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Dialog */}
      {template && data.length > 0 && (
        <PrintDialog
          isOpen={isPrintDialogOpen}
          onClose={() => setIsPrintDialogOpen(false)}
          template={template}
          data={data}
          dataType={dataType}
        />
      )}
    </div>
  );
}

export default App;
