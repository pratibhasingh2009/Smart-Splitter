import React, { useRef, useState } from 'react';
import {
  X,
  FileText,
  Download,
  Printer,
  ExternalLink,
  Edit3,
  CheckCircle2,
  FileDown,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { REPORT_HTML_CONTENT } from '../../data/reportHtmlContent';

export const ProjectReportModal: React.FC = () => {
  const { isReportModalOpen, closeReportModal } = useApp();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  if (!isReportModalOpen) return null;

  // 1. Direct PDF Download Trigger
  const handleDownloadPDF = () => {
    setDownloadingFormat('pdf');
    try {
      if (iframeRef.current?.contentWindow) {
        // Try calling the direct function inside the iframe
        const win = iframeRef.current.contentWindow as any;
        if (typeof win.handleDirectPDFDownload === 'function') {
          win.handleDirectPDFDownload();
          setTimeout(() => setDownloadingFormat(null), 1500);
          return;
        }
      }
    } catch {
      // Cross-origin fallback
    }
    // Fallback: open print dialog
    handlePrint();
    setDownloadingFormat(null);
  };

  // 2. Direct Word (.doc) Download Trigger
  const handleDownloadWord = async () => {
    setDownloadingFormat('doc');
    try {
      if (iframeRef.current?.contentWindow) {
        const win = iframeRef.current.contentWindow as any;
        if (typeof win.downloadAsWordDoc === 'function') {
          win.downloadAsWordDoc();
          setTimeout(() => setDownloadingFormat(null), 1200);
          return;
        }
      }

      // In-memory Word generator from preloaded HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(REPORT_HTML_CONTENT, 'text/html');
      const content = doc.getElementById('report-content') || doc.body;

      const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' ` +
        `xmlns:w='urn:schemas-microsoft-com:office:word' ` +
        `xmlns='http://www.w3.org/TR/REC-html40'>` +
        `<head><meta charset='utf-8'><title>SmartSplit Mini Project Report 2026-2027</title>` +
        `<style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #111; }
          h1, h2, h3, h4 { color: #0f172a; font-family: Arial, sans-serif; }
          .page-break { page-break-before: always; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 1rem; }
          th, td { border: 1px solid #999; padding: 6px; text-align: left; }
          th { background-color: #f1f5f9; }
        </style></head><body>`;
      const footer = "</body></html>";
      const sourceHTML = header + content.innerHTML + footer;

      const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'SmartSplit_Mini_Project_Report_Group7_2026-2027.doc';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Word export error:', err);
    } finally {
      setTimeout(() => setDownloadingFormat(null), 1200);
    }
  };

  // 3. Print / Save as PDF via Browser
  const handlePrint = () => {
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
        return;
      }
    } catch {
      // Fallback
    }
  };

  // 4. Open in a standalone new browser tab using blob URL (zero 404 network errors)
  const handleOpenNewTab = () => {
    const blob = new Blob([REPORT_HTML_CONTENT], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl h-[94vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          
          {/* Title & Metadata */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-950/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  Academic Project Report
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Academic Year 2026–2027
                </span>
                <span className="hidden md:inline-flex px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-[10px] font-bold">
                  Group 7 (GLBITM)
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Guide: <strong className="text-white">Mr. Abhijeet Gupta</strong> • Pratibha Singh, Pratiksha Singh, Priyansh Kalra, Priyam Tripathi
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            

            {/* Download Native PowerPoint (.pptx) */}
            <a
              href="/SmartSplit_Mini_Project_Presentation_Group7.pptx"
              download="SmartSplit_Mini_Project_Presentation_Group7.pptx"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              title="Download native PowerPoint presentation matching GL Bajaj format"
            >
              <Download className="w-4 h-4" />
              <span>PPTX Presentation</span>
            </a>

            {/* View Presentation Slides */}
            <a
              href="/presentation.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              title="Open full 15-slide GL Bajaj presentation viewer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Slides</span>
            </a>

            {/* 1-Click PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingFormat === 'pdf'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              title="Download clean academic PDF"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingFormat === 'pdf' ? 'Generating PDF...' : '1-Click PDF'}</span>
            </button>

            {/* Word (.doc) */}
            <button
              onClick={handleDownloadWord}
              disabled={downloadingFormat === 'doc'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              title="Download editable Microsoft Word document (.doc)"
            >
              <FileDown className="w-4 h-4" />
              <span>{downloadingFormat === 'doc' ? 'Generating Doc...' : 'Word (.doc)'}</span>
            </button>

            {/* Print / Save PDF */}
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
              title="Open browser print dialog (Ctrl+P)"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Print (Ctrl+P)</span>
            </button>

            {/* Open in Full Tab */}
            <button
              onClick={handleOpenNewTab}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all cursor-pointer"
              title="Open full page view in a new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Full Tab</span>
            </button>

            {/* Close Button */}
            <button
              onClick={closeReportModal}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Info Sub-header */}
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-200/80 flex items-center justify-between text-xs text-amber-900 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold">💡 How to use:</span>
            <span>You can click anywhere on the report text below to modify names, roll numbers, or chapters. Edits auto-save immediately!</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Updated with 2026–2027 & Live Screenshots</span>
          </div>
        </div>

        {/* Report Content Iframe Container */}
        <div className="flex-1 w-full bg-slate-100 relative overflow-hidden">
          {!isIframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#145DA0] flex items-center justify-center text-white animate-spin">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">Loading Academic Project Report (2026-2027)...</p>
            </div>
          )}

          <iframe
            ref={iframeRef}
            srcDoc={REPORT_HTML_CONTENT}
            onLoad={() => setIsIframeLoaded(true)}
            title="Project Report Preview"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};
