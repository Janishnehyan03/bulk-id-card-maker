import { CreditCard, Download, Eye, Users, ChevronDown, LogIn } from "lucide-react";
import { useState } from "react";
import DataImporter from "./components/DataImporter";
import DesignCanvas from "./components/DesignCanvas";
import PrintDialog from "./components/PrintDialog";
import TemplateUploader from "./components/TemplateUploader";
import { TemplateManager } from "./components/TemplateManager";
import { AuthModal } from "./components/AuthModal";
import { UserMenu } from "./components/UserMenu";
import { CardTemplate, DataSource } from "./types";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const [data, setData] = useState<DataSource>([]);
  const [dataType, setDataType] = useState<"employee" | "student">("employee");
  const [template, setTemplate] = useState<CardTemplate | null>(null);
  const [selectedRecord, setSelectedRecord] = useState(0);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  // UI: Control Data Import panel (collapsible)
  const [importOpen, setImportOpen] = useState(true);

  const { currentUser } = useAuth();

  const handleDataImport = (
    importedData: DataSource,
    type: "employee" | "student"
  ) => {
    setData(importedData);
    setDataType(type);
    setSelectedRecord(0);
    setImportOpen(false); // Auto-close import after importing!
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f0f4ff] to-[#e9f5ff] text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 grid place-items-center rounded-xl bg-blue-100 shadow-md text-blue-700 border border-blue-200">
                <CreditCard className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 bg-clip-text text-transparent">
                ID Card Studio
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {data.length > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-white to-blue-50 border border-blue-100 shadow-inner text-base font-semibold text-blue-700">
                  <Users className="h-5 w-5 opacity-70" />
                  <span className="tabular-nums">{data.length}</span>
                  <span className="capitalize text-blue-900">
                    {dataType === "employee" ? "employees" : "students"}
                  </span>
                </div>
              )}
              {canDesign && (
                <button
                  onClick={() => setIsPrintDialogOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base font-bold shadow-md hover:scale-105 transition-transform hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
                >
                  <Download className="h-5 w-5" />
                  <span>Print Cards</span>
                </button>
              )}
              
              {/* Authentication UI */}
              {currentUser ? (
                <UserMenu />
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content (Full Height Flex) */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Stepper */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
          <ol className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center">
            {/* Step 1: Import */}
            <li className="flex items-center gap-3">
              <span
                className={`h-9 w-9 shrink-0 grid place-items-center rounded-full text-base font-bold border-2 border-white shadow ${
                  data.length > 0
                    ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white"
                    : "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
                }`}
              >
                1
              </span>
              <span
                className={`text-base font-semibold tracking-tight ${
                  data.length > 0 ? "text-gray-900" : "text-blue-800"
                }`}
              >
                Import Data
              </span>
              <div className="ml-auto hidden sm:block h-px w-12 bg-gradient-to-r from-blue-400/20 to-blue-400/70" />
            </li>
            {/* Step 2: Template */}
            <li className="flex items-center gap-3">
              <span
                className={`h-9 w-9 shrink-0 grid place-items-center rounded-full text-base font-bold border-2 border-white shadow ${
                  template
                    ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white"
                    : data.length > 0
                    ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                2
              </span>
              <span
                className={`text-base font-semibold tracking-tight ${
                  template
                    ? "text-gray-900"
                    : data.length > 0
                    ? "text-blue-800"
                    : "text-gray-400"
                }`}
              >
                Create Template
              </span>
              <div className="ml-auto hidden sm:block h-px w-12 bg-gradient-to-r from-blue-400/20 to-blue-400/70" />
            </li>
            {/* Step 3: Design */}
            <li className="flex items-center gap-3">
              <span
                className={`h-9 w-9 shrink-0 grid place-items-center rounded-full text-base font-bold border-2 border-white shadow ${
                  canDesign
                    ? "bg-gradient-to-br from-indigo-500 to-blue-700 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                3
              </span>
              <span
                className={`text-base font-semibold tracking-tight ${
                  canDesign ? "text-indigo-800" : "text-gray-400"
                }`}
              >
                Design & Print
              </span>
            </li>
          </ol>
        </div>

        {/* Main layout: Sidebar (collapsed import panel after import), Canvas takes max width */}
        <div className="flex-1 flex flex-row gap-6 max-w-full overflow-hidden mt-6">
          {/* Sidebar: fixed width, collapses DataImport after import */}
          <aside className="w-full max-w-[360px] min-w-[280px] px-2 py-2 flex flex-col gap-5">
            {/* Data Importer (collapsible) */}
            <section className="bg-white/95 rounded-2xl border border-blue-100 shadow-lg mb-0 overflow-hidden transition-all">
              <div
                className={`flex items-center justify-between px-5 py-3 border-b border-blue-100 cursor-pointer select-none`}
                onClick={() => setImportOpen((v) => !v)}
              >
                <div className="text-base font-bold text-blue-800 flex items-center gap-2">
                  1. Import Data
                  <span className="sr-only">{importOpen ? "Collapse" : "Expand"}</span>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-blue-500 transition-transform ${
                    importOpen ? "rotate-0" : "rotate-180"
                  }`}
                />
              </div>
              <div
                className={`transition-all duration-300 ease-in-out ${
                  importOpen
                    ? "max-h-[800px] opacity-100 visible"
                    : "max-h-0 opacity-0 invisible"
                }`}
              >
                <div className="p-5">
                  <DataImporter onDataImport={handleDataImport} />
                </div>
              </div>
              {!importOpen && (
                <div className="px-5 py-2 text-xs text-blue-700 italic bg-blue-50 border-t border-blue-100">
                  Data imported. Expand to re-import.
                </div>
              )}
            </section>

            {/* Template Uploader */}
            <section className="bg-white/95 rounded-2xl border border-indigo-100 shadow-lg mb-0">
              <div className="px-5 py-3 border-b border-indigo-100">
                <h2 className="text-base font-bold text-indigo-800">
                  2. Upload Template
                </h2>
              </div>
              <div className="p-5">
                <TemplateUploader onTemplateCreate={handleTemplateCreate} />
              </div>
            </section>

            {/* Template Manager - Save/Load Templates */}
            {currentUser && (
              <section className="bg-white/95 rounded-2xl border border-green-100 shadow-lg mb-0">
                <div className="px-5 py-3 border-b border-green-100">
                  <h2 className="text-base font-bold text-green-800">
                    My Templates
                  </h2>
                </div>
                <div className="p-5">
                  <TemplateManager
                    currentTemplate={template}
                    onTemplateLoad={handleTemplateCreate}
                  />
                </div>
              </section>
            )}

            {/* Context summary */}
            <section className="bg-white/95 rounded-2xl border border-gray-100 shadow-lg">
              <div className="px-5 py-3 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-700">
                  Current Status
                </h2>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Data Type</span>
                  <span className="font-semibold capitalize text-gray-800">
                    {dataType}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Records</span>
                  <span className="font-semibold tabular-nums text-blue-700">
                    {data.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Template</span>
                  <span className="font-semibold text-indigo-700 truncate max-w-[120px]">
                    {template ? `Loaded: ${template.name}` : "Not Loaded"}
                  </span>
                </div>
              </div>
            </section>
          </aside>

          {/* Canvas Section: Fullscreen, visually striking */}
          <section className="flex-1 flex min-w-0 items-center justify-center transition-all">
            {canDesign ? (
              <div className="w-full h-full flex flex-col items-stretch justify-stretch">
                {/* Record Navigation */}
                <div className="mx-auto max-w-3xl w-full mb-4 shadow-lg rounded-xl bg-gradient-to-tr from-blue-50 via-white to-indigo-50 border border-blue-100 flex items-center justify-between px-6 py-4">
                  <button
                    onClick={() => handleRecordNavigation("prev")}
                    disabled={selectedRecord === 0}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-blue-100 bg-white text-base font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:pointer-events-none transition"
                  >
                    Previous
                  </button>

                  <div className="text-center flex-1">
                    <div className="font-bold text-xl text-blue-900 truncate">
                      {(data[selectedRecord] as any)?.name ||
                        `Record ${selectedRecord + 1}`}
                    </div>
                    <div className="text-xs text-blue-700 font-semibold">
                      <span className="tabular-nums">
                        {selectedRecord + 1}
                      </span>{" "}
                      of <span className="tabular-nums">{data.length}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRecordNavigation("next")}
                    disabled={selectedRecord === data.length - 1}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-blue-100 bg-white text-base font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:pointer-events-none transition"
                  >
                    Next
                  </button>
                </div>

                {/* Fullscreen Canvas */}
                <div className="flex-1 flex w-full h-0 min-h-0">
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
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl shadow-2xl border border-blue-100 min-h-[28rem]">
                <div className="text-center max-w-sm mx-auto px-6 py-10">
                  <Eye className="mx-auto h-14 w-14 text-blue-200 mb-5" />
                  <h3 className="text-2xl font-extrabold text-blue-900 mb-2 drop-shadow">
                    Ready to design?
                  </h3>
                  <p className="text-lg text-blue-700 mb-6">
                    {!data.length && !template
                      ? "Start by importing your data and uploading a template."
                      : !data.length
                      ? "Import your data to begin designing your ID cards."
                      : "Upload or create a template to begin designing your ID cards."}
                  </p>
                  <div className="text-base text-blue-500">
                    Use the panels on the left to get started.
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

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default App;