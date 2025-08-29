import { CreditCard, Download, Eye, Users, ChevronDown } from "lucide-react";
import { useState } from "react";
import DataImporter from "../components/DataImporter";
import DesignCanvas from "../components/DesignCanvas";
import PrintDialog from "../components/PrintDialog";
import TemplateUploader from "../components/TemplateUploader";
import { CardTemplate, DataSource } from "../types";

/**
 * Redesigned TemplateHomePage:
 * - Consistent with modern SaaS dashboards (shadcn/ui + Tailwind)
 * - Accessible: semantic HTML, focus management, aria attributes, screen reader text
 * - Premium design: gradients, elegant cards, fluid layout, micro-interactions (CSS transitions)
 * - Responsive layout, dark mode ready (Tailwind dark:), design system spacing/colors
 */

function TemplateHomePage() {
  const [data, setData] = useState<DataSource>([]);
  const [dataType, setDataType] = useState<"employee" | "student">("employee");
  const [template, setTemplate] = useState<CardTemplate | null>(null);
  const [selectedRecord, setSelectedRecord] = useState(0);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(true);

  const handleDataImport = (
    importedData: DataSource,
    type: "employee" | "student"
  ) => {
    setData(importedData);
    setDataType(type);
    setSelectedRecord(0);
    setImportOpen(false);
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
    <div className="min-h-screen flex flex-col bg-muted/50 dark:bg-background text-foreground transition-colors">
      {/* Header */}
      <header
        className="sticky top-0 z-40 bg-background/70 dark:bg-background/90 border-b border-border shadow-sm transition-colors"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div></div>
            </div>
            <div className="flex items-center gap-4">
              {data.length > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 text-base font-semibold text-blue-700 dark:text-blue-300 transition-colors">
                  <Users className="h-5 w-5 opacity-80" />
                  <span className="tabular-nums">{data.length}</span>
                  <span className="capitalize">
                    {dataType === "employee" ? "employees" : "students"}
                  </span>
                </div>
              )}
              {canDesign && (
                <button
                  onClick={() => setIsPrintDialogOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-base font-bold shadow-md hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
                >
                  <Download className="h-5 w-5" />
                  <span>Print Cards</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Stepper */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
          <ol
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center"
            aria-label="Progress steps"
          >
            {/* Step 1: Import */}
            <li className="flex items-center gap-3">
              <span
                className={`h-9 w-9 shrink-0 grid place-items-center rounded-full text-base font-bold border-2 border-white shadow-sm transition-colors ${
                  data.length > 0
                    ? "bg-green-500 text-white"
                    : "bg-blue-600 text-white"
                }`}
                aria-current={data.length > 0 ? "step" : undefined}
                aria-label={
                  data.length > 0 ? "Import completed" : "Import step active"
                }
              >
                1
              </span>
              <span
                className={`text-base font-semibold tracking-tight transition-colors ${
                  data.length > 0
                    ? "text-foreground"
                    : "text-blue-800 dark:text-blue-300"
                }`}
              >
                Import Data
              </span>
              <div
                className="ml-auto hidden sm:block h-px w-12 bg-border"
                aria-hidden="true"
              />
            </li>
            {/* Step 2: Template */}
            <li className="flex items-center gap-3">
              <span
                className={`h-9 w-9 shrink-0 grid place-items-center rounded-full text-base font-bold border-2 border-white shadow-sm transition-colors ${
                  template
                    ? "bg-green-500 text-white"
                    : data.length > 0
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
                aria-current={template ? "step" : undefined}
                aria-label={
                  template
                    ? "Template uploaded"
                    : data.length > 0
                    ? "Template step active"
                    : "Template step inactive"
                }
              >
                2
              </span>
              <span
                className={`text-base font-semibold tracking-tight transition-colors ${
                  template
                    ? "text-foreground"
                    : data.length > 0
                    ? "text-blue-800 dark:text-blue-300"
                    : "text-muted-foreground"
                }`}
              >
                Create Template
              </span>
              <div
                className="ml-auto hidden sm:block h-px w-12 bg-border"
                aria-hidden="true"
              />
            </li>
            {/* Step 3: Design */}
            <li className="flex items-center gap-3">
              <span
                className={`h-9 w-9 shrink-0 grid place-items-center rounded-full text-base font-bold border-2 border-white shadow-sm transition-colors ${
                  canDesign
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
                aria-current={canDesign ? "step" : undefined}
                aria-label={
                  canDesign ? "Design step active" : "Design step inactive"
                }
              >
                3
              </span>
              <span
                className={`text-base font-semibold tracking-tight transition-colors ${
                  canDesign
                    ? "text-indigo-700 dark:text-indigo-300"
                    : "text-muted-foreground"
                }`}
              >
                Design & Print
              </span>
            </li>
          </ol>
        </section>

        {/* Layout: Sidebar, Canvas */}
        <div className="flex-1 flex flex-row gap-6 max-w-full overflow-hidden mt-6 px-4 sm:px-8 pb-8">
          {/* Sidebar */}
          <aside
            className="w-full max-w-[370px] min-w-[260px] flex flex-col gap-5"
            aria-label="Sidebar"
          >
            {/* Importer (Collapsible) */}
            <section className="bg-card rounded-2xl border border-border shadow-md overflow-hidden transition-all">
              <button
                className="w-full flex items-center justify-between px-5 py-3 border-b border-border cursor-pointer select-none group hover:bg-muted/30 transition"
                onClick={() => setImportOpen((v) => !v)}
                aria-expanded={importOpen}
                aria-controls="import-panel"
                aria-label="Toggle data importer"
              >
                <span className="text-lg font-semibold text-foreground flex items-center gap-2">
                  1. Import Data
                  <span className="sr-only">
                    {importOpen ? "Collapse" : "Expand"}
                  </span>
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                    importOpen ? "rotate-0" : "rotate-180"
                  }`}
                  aria-hidden="true"
                />
              </button>
              <div
                id="import-panel"
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  importOpen
                    ? "max-h-[800px] opacity-100 visible"
                    : "max-h-0 opacity-0 invisible"
                }`}
                aria-live="polite"
              >
                <div className="p-5">
                  <DataImporter onDataImport={handleDataImport} />
                </div>
              </div>
              {!importOpen && (
                <div className="px-5 py-2 text-xs text-blue-700 dark:text-blue-300 italic bg-blue-50 dark:bg-blue-950 border-t border-blue-100 dark:border-blue-900">
                  Data imported. Expand to re-import.
                </div>
              )}
            </section>
            {/* Template Uploader */}
            <section className="bg-card rounded-2xl border border-border shadow-md">
              <div className="px-5 py-3 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  2. Upload Template
                </h2>
              </div>
              <div className="p-5">
                <TemplateUploader onTemplateCreate={handleTemplateCreate} />
              </div>
            </section>
          </aside>

          {/* Main Section */}
          <section className="flex-1 flex min-w-0 items-center justify-center">
            {canDesign ? (
              <div className="w-full h-full flex flex-col items-stretch justify-stretch">
                {/* Record Navigation */}
                <nav
                  className="mx-auto max-w-3xl w-full mb-4 shadow-md rounded-xl bg-card border border-border flex items-center justify-between px-6 py-4"
                  aria-label="Record navigation"
                >
                  <button
                    onClick={() => handleRecordNavigation("prev")}
                    disabled={selectedRecord === 0}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-border bg-background text-base font-semibold text-foreground hover:bg-muted transition disabled:opacity-40 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    Previous
                  </button>
                  <div className="text-center flex-1">
                    <div className="font-bold text-lg text-foreground truncate">
                      {(data[selectedRecord] as any)?.name ||
                        `Record ${selectedRecord + 1}`}
                    </div>
                    <div className="text-sm text-muted-foreground font-semibold">
                      <span className="tabular-nums">{selectedRecord + 1}</span>{" "}
                      of <span className="tabular-nums">{data.length}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRecordNavigation("next")}
                    disabled={selectedRecord === data.length - 1}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-border bg-background text-base font-semibold text-foreground hover:bg-muted transition disabled:opacity-40 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    Next
                  </button>
                </nav>
                {/* Canvas */}
                <div className="flex-1 flex w-full h-0 min-h-0 bg-card rounded-2xl shadow-lg border border-border p-6 transition-colors">
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
              <div className="w-full h-full flex items-center justify-center bg-card rounded-2xl shadow-lg border border-border min-h-[28rem]">
                <div className="text-center max-w-sm mx-auto px-6 py-10">
                  <Eye className="mx-auto h-14 w-14 text-muted-foreground mb-5" />
                  <h3 className="text-2xl font-extrabold text-foreground mb-2">
                    Ready to design?
                  </h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    {!data.length && !template
                      ? "Start by importing your data and uploading a template."
                      : !data.length
                      ? "Import your data to begin designing your ID cards."
                      : "Upload or create a template to begin designing your ID cards."}
                  </p>
                  <div className="text-base text-muted-foreground">
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
    </div>
  );
}

export default TemplateHomePage;
