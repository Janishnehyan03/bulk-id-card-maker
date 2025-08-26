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
    // setTemplate(null); // optional reset
  };

  const handleTemplateCreate = (newTemplate: CardTemplate) => {
    setTemplate(newTemplate);
  };

  const handleTemplateUpdate = (updatedTemplate: CardTemplate) => {
    setTemplate(updatedTemplate);
  };

  const handleRecordNavigation = (direction: "prev" | "next") => {
    if (direction === "prev" && selectedRecord > 0) {
      setSelectedRecord((v) => v - 1);
    } else if (direction === "next" && selectedRecord < data.length - 1) {
      setSelectedRecord((v) => v + 1);
    }
  };

  const canDesign = template && data.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 grid place-items-center rounded-md bg-blue-50 text-blue-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight">ID Card Designer</h1>
            </div>

            <div className="flex items-center gap-3">
              {data.length > 0 && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200 text-sm text-gray-700">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="tabular-nums">{data.length}</span>
                  <span className="capitalize">{dataType === "employee" ? "employees" : "students"}</span>
                </div>
              )}

              {canDesign && (
                <button
                  onClick={() => setIsPrintDialogOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
                >
                  <Download className="h-4 w-4" />
                  <span>Print Cards</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stepper */}
        <div className="mb-6">
          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Step 1 */}
            <li className="flex items-center gap-3">
              <span
                className={`h-7 w-7 shrink-0 grid place-items-center rounded-full text-xs font-semibold
                ${data.length > 0 ? "bg-green-600 text-white" : "bg-blue-600 text-white"}`}
              >
                1
              </span>
              <span
                className={`text-sm font-medium 
                ${data.length > 0 ? "text-green-800" : "text-blue-800"}`}
              >
                Import Data
              </span>
              <div className="ml-auto hidden sm:block h-px w-10 bg-gray-200" />
            </li>

            {/* Step 2 */}
            <li className="flex items-center gap-3">
              <span
                className={`h-7 w-7 shrink-0 grid place-items-center rounded-full text-xs font-semibold
                ${template ? "bg-green-600 text-white" : data.length > 0 ? "bg-blue-600 text-white" : "bg-gray-300 text-white"}`}
              >
                2
              </span>
              <span
                className={`text-sm font-medium
                ${template ? "text-green-800" : data.length > 0 ? "text-blue-800" : "text-gray-500"}`}
              >
                Create Template
              </span>
              <div className="ml-auto hidden sm:block h-px w-10 bg-gray-200" />
            </li>

            {/* Step 3 */}
            <li className="flex items-center gap-3">
              <span
                className={`h-7 w-7 shrink-0 grid place-items-center rounded-full text-xs font-semibold
                ${canDesign ? "bg-blue-600 text-white" : "bg-gray-300 text-white"}`}
              >
                3
              </span>
              <span
                className={`text-sm font-medium
                ${canDesign ? "text-blue-800" : "text-gray-500"}`}
              >
                Design & Print
              </span>
            </li>
          </ol>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
          {/* Left Panel */}
          <aside className="lg:sticky lg:top-[calc(56px+24px)] lg:self-start space-y-4">
            <section className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold">Data & Template</h2>
              </div>
              <div className="p-4 space-y-4">
                <DataImporter onDataImport={handleDataImport} />
                {data.length > 0 && (
                  <TemplateUploader onTemplateCreate={handleTemplateCreate} />
                )}
              </div>
            </section>

            {/* Context summary */}
            <section className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium capitalize">{dataType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Records</span>
                  <span className="font-medium tabular-nums">{data.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Template</span>
                  <span className="font-medium">{template ? "Loaded" : "—"}</span>
                </div>
              </div>
            </section>
          </aside>

          {/* Canvas Panel */}
          <section className="min-h-[24rem]">
            {canDesign ? (
              <div className="space-y-4">
                {/* Record Navigation */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-3 flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleRecordNavigation("prev")}
                      disabled={selectedRecord === 0}
                      className="inline-flex items-center justify-center px-3 py-2 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Previous
                    </button>

                    <div className="text-center flex-1">
                      <div className="font-medium text-gray-900 truncate">
                        {(data[selectedRecord] as any)?.name || `Record ${selectedRecord + 1}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="tabular-nums">{selectedRecord + 1}</span> of{" "}
                        <span className="tabular-nums">{data.length}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRecordNavigation("next")}
                      disabled={selectedRecord === data.length - 1}
                      className="inline-flex items-center justify-center px-3 py-2 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200">
                  <DesignCanvas
                    template={template}
                    data={data}
                    dataType={dataType}
                    selectedRecord={selectedRecord}
                    onTemplateUpdate={handleTemplateUpdate}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 h-[32rem] grid place-items-center">
                <div className="text-center max-w-sm mx-auto px-6">
                  <Eye className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-base font-semibold mb-1">Ready to design</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {!data.length
                      ? "Import your data to get started."
                      : "Upload or create a template to begin designing your ID cards."}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    {!data.length ? (
                      <span className="text-xs text-gray-500">Use the panel on the left.</span>
                    ) : (
                      <span className="text-xs text-gray-500">Then return here to preview.</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Print Dialog */}
      {canDesign && (
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
