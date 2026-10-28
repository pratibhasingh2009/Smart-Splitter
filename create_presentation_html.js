import fs from "fs";

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmartSplit - Mini Project Presentation - Group 7 - GL Bajaj</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- html2pdf for direct PDF export -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Cinzel:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box !important;
    }

    @page {
      size: 297mm 167mm; /* 16:9 A4 landscape */
      margin: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
      background-color: #1a1a24;
      color: #1f2937;
      margin: 0;
      padding: 60px 0;
    }

    /* 16:9 Slide Dimensions (Standard Presentation Ratio) */
    .slide-canvas {
      width: 1120px;
      height: 630px;
      margin: 32px auto;
      background: #ffffff;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border-radius: 4px;
    }

    @media print {
      body {
        background: white !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      .slide-canvas {
        width: 100vw !important;
        height: 100vh !important;
        max-width: 100% !important;
        max-height: 100% !important;
        margin: 0 !important;
        box-shadow: none !important;
        page-break-after: always !important;
        break-after: page !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        border-radius: 0 !important;
      }
    }

    .theme-orange { color: #E87722; }
    .bg-theme-orange { background-color: #E87722; }
    .theme-brown { color: #6E3314; }
    .bg-theme-brown { background-color: #6E3314; }
    .bg-theme-card { background-color: #FBF0EB; }
    .border-theme-card { border-color: #F3D5C5; }

    /* Editable inline */
    [contenteditable="true"]:hover {
      outline: 1px dashed #E87722;
      background-color: rgba(232, 119, 34, 0.05);
    }
  </style>
</head>
<body class="antialiased">

  <!-- TOP ACTION TOOLBAR -->
  <div class="no-print fixed top-3 left-1/2 -translate-x-1/2 z-50 flex flex-wrap items-center justify-center gap-2 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700 max-w-[96vw]">
    <div class="flex items-center space-x-2 mr-2">
      <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
      <span class="font-bold text-xs tracking-wide">GL Bajaj CSE (Group 7)</span>
      <span class="text-slate-600">|</span>
      <span class="text-xs text-amber-300 font-semibold">15 Presentation Slides</span>
    </div>

    <!-- PPTX DOWNLOAD BUTTON -->
    <a href="./SmartSplit_Mini_Project_Presentation_Group7.pptx" download="SmartSplit_Mini_Project_Presentation_Group7.pptx" class="bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow transition flex items-center space-x-1.5 cursor-pointer">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
      <span>Download .PPTX (PowerPoint)</span>
    </a>

    <!-- PDF DOWNLOAD BUTTON -->
    <button onclick="downloadPresentationPDF()" class="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow transition flex items-center space-x-1.5 cursor-pointer">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
      <span>Download as PDF</span>
    </button>

    <!-- PRINT SLIDES (Ctrl+P) -->
    <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl shadow transition flex items-center space-x-1.5 cursor-pointer">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
      <span>Print (Landscape)</span>
    </button>

    <!-- FULLSCREEN SLIDESHOW -->
    <button onclick="toggleFullscreen()" class="bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-medium text-xs px-3 py-1.5 rounded-xl shadow transition flex items-center space-x-1.5 cursor-pointer">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
      <span>Fullscreen</span>
    </button>
  </div>

  <!-- FLOATING NOTIFICATION -->
  <div id="toast" class="hidden no-print fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold">
    Notification
  </div>

  <!-- ========================================================= -->
  <!-- SLIDES CONTAINER -->
  <!-- ========================================================= -->
  <div id="slides-container" class="w-full">

    <!-- ===================================================== -->
    <!-- SLIDE 1: TITLE SLIDE -->
    <!-- ===================================================== -->
    <div class="slide-canvas" id="slide-1">
      <div class="absolute left-0 top-0 bottom-0 w-3 bg-theme-orange"></div>
      
      <!-- Top GL Bajaj Branding -->
      <div class="pt-6 px-12 flex justify-between items-start">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full border-2 border-[#6E3314] flex items-center justify-center font-black text-[#6E3314] text-xs shadow-sm bg-orange-50">
            GLB
          </div>
          <div>
            <h1 class="text-2xl font-black tracking-tight text-[#6E3314] leading-tight">GL BAJAJ</h1>
            <p class="text-[10px] font-bold text-[#E87722] tracking-wider uppercase">Institute of Technology & Management</p>
            <p class="text-[9px] font-extrabold text-[#6E3314] tracking-widest">FIND YOUR SPARK</p>
          </div>
        </div>

        <div class="text-right">
          <div class="w-12 h-12 rounded-full border-2 border-[#E87722] flex items-center justify-center font-bold text-[#E87722] text-xs shadow-sm bg-amber-50 ml-auto">
            AKTU
          </div>
          <p class="text-[11px] font-bold text-slate-600 mt-1">Session 2026–2027</p>
        </div>
      </div>

      <!-- Department Subtitle -->
      <div class="text-center mt-3">
        <p class="text-lg italic font-serif text-[#6E3314] font-medium tracking-wide">
          Department of Computer Science & Engineering
        </p>
      </div>

      <!-- Main Title Bar -->
      <div class="mt-4 mx-8 bg-[#6E3314] py-4 px-6 text-center shadow-lg rounded-sm">
        <h2 class="text-3xl font-extrabold uppercase tracking-wider text-white font-serif">
          Personal Budget & Expense Splitter
        </h2>
        <p class="text-lg font-bold text-amber-300 mt-1 tracking-wide">
          (SmartSplit)
        </p>
      </div>

      <div class="text-center mt-3">
        <p class="text-sm font-bold tracking-widest text-slate-800 uppercase">
          Mini Project Presentation | 2nd Year B.Tech CSE (2026–2027)
        </p>
      </div>

      <!-- Bottom Columns: Presenters & Supervisor -->
      <div class="mt-4 mx-8 grid grid-cols-2 gap-6 flex-1 mb-6">
        <!-- Presented By -->
        <div class="bg-[#FBF0EB] p-4 rounded-xl border border-[#F3D5C5] shadow-xs flex flex-col justify-between">
          <div>
            <span class="text-xs font-extrabold text-[#E87722] uppercase tracking-wider block mb-1.5">
              Presented By : (Group No. 7)
            </span>
            <div class="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-slate-800">
              <div><strong class="text-slate-900">Pratibha Singh</strong></div>
              <div class="text-right text-slate-600">Roll: 2501920100419</div>

              <div><strong class="text-slate-900">Pratiksha Singh</strong></div>
              <div class="text-right text-slate-600">Roll: 2501920100422</div>

              <div><strong class="text-slate-900">Priyansh Kalra</strong></div>
              <div class="text-right text-slate-600">Roll: 2501920100438</div>

              <div><strong class="text-slate-900">Priyam Tripathi</strong></div>
              <div class="text-right text-slate-600">Roll: 2501920100437</div>
            </div>
          </div>
          <div class="pt-2 border-t border-[#F3D5C5]/60 text-[11px] font-semibold text-slate-600">
            Branch & Year: B.Tech Computer Science & Engineering (2nd Year)
          </div>
        </div>

        <!-- Under Supervision Of -->
        <div class="bg-[#FBF0EB] p-4 rounded-xl border border-[#F3D5C5] shadow-xs flex flex-col justify-between">
          <div>
            <span class="text-xs font-extrabold text-[#E87722] uppercase tracking-wider block mb-1.5">
              Under Supervision Of :
            </span>
            <p class="text-base font-extrabold text-[#6E3314]">
              Mr. Abhijeet Gupta
            </p>
            <p class="text-xs text-slate-700 font-semibold mt-0.5">
              Assistant Professor, Department of Computer Science & Engineering
            </p>
            <p class="text-[11px] text-slate-600 mt-0.5">
              G. L. Bajaj Institute of Technology & Management, Greater Noida
            </p>
          </div>
          <div class="pt-2 border-t border-[#F3D5C5]/60 text-[11px] font-semibold text-slate-600">
            Affiliated to: Dr. A. P. J. Abdul Kalam Technical University (AKTU, Lucknow)
          </div>
        </div>
      </div>
    </div>

    <!-- ===================================================== -->
    <!-- SLIDE 2: OUTLINE -->
    <!-- ===================================================== -->
    <div class="slide-canvas" id="slide-2">
      <div class="absolute left-0 top-0 bottom-0 w-3 bg-theme-orange"></div>
      
      <!-- Slide Top Banner -->
      <div class="flex items-center bg-[#6E3314] text-white pl-8 pr-12 py-3.5">
        <div class="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center font-black text-xs mr-4 bg-white/10">
          GLB
        </div>
        <h2 class="text-2xl font-bold font-serif tracking-wider uppercase">OUTLINE</h2>
        <span class="ml-auto text-xs italic opacity-80 font-serif">Department of Computer Science & Engineering</span>
      </div>

      <!-- 12 Outline Cards Grid -->
      <div class="p-8 grid grid-cols-2 gap-x-8 gap-y-3 flex-1">
        <!-- 01 -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl px-4 py-2.5 flex items-center gap-3.5 shadow-xs">
          <div class="w-8 h-8 rounded-full bg-[#E87722] text-white flex items-center justify-center font-bold text-xs shrink-0">01</div>
          <span class="font-bold text-sm text-slate-900">Introduction & Domain Background</span>
        </div>
        <!-- 07 -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl px-4 py-2.5 flex items-center gap-3.5 shadow-xs">
          <div class="w-8 h-8 rounded-full bg-[#E87722] text-white flex items-center justify-center font-bold text-xs shrink-0">07</div>
          <span class="font-bold text-sm text-slate-900">Agile Engineering Methodology</span>
        </div>
        <!-- 02 -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl px-4 py-2.5 flex items-center gap-3.5 shadow-xs">
          <div class="w-8 h-8 rounded-full bg-[#E87722] text-white flex items-center justify-center font-bold text-xs shrink-0">02</div>
          <span class="font-bold text-sm text-slate-900">Project Objectives & Scope</span>
        </div>
        <!-- 08 -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl px-4 py-2.5 flex items-center gap-3.5 shadow-xs">
          <div class="w-8 h-8 rounded-full bg-[#E87722] text-white flex items-center justify-center font-bold text-xs shrink-0">08</div>
          <span class="font-bold text-sm text-slate-900">Core Modules & Feature Breakdown</span>
        </div>
        <!-- 03 -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl px-4 py-2.5 flex items-center gap-3.5 shadow-xs">
          <div class="w-8 h-8 rounded-full bg-[#E87722] text-white flex items-center justify-center font-bold text-xs shrink-0">03</div>
          <span class="font-bold text-sm text-slate-900">Existing vs. Proposed System</span>
        </div>
        <!-- 09 -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl px-4 py-2.5 flex items-center gap-3.5 shadow-xs">
          <div class="w-8 h-8 rounded-full bg-[#E87722] text-white flex items-center justify-center font-bold text-xs shrink-0">09</div>
          <span class="font-bold text-sm text-slate-900">Implementation Highlights & Results</span>
        </div>
        <!-- 04 -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl px-4 py-2.5 flex items-center gap-3.5 shadow-xs">
          <div class="w-8 h-8 rounded-full bg-[#E87722] text-white flex items-center justify-center font-bold text-xs shrink-0">04</div>
          <span class="font-bold text-sm text-slate-900">Technology Stack (React 19 & Firebase)</span>
        </div>
        <!-- 10 -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl px-4 py-2.5 flex items-center gap-3.5 shadow-xs">
          <div class="w-8 h-8 rounded-full bg-[#E87722] text-white flex items-center justify-center font-bold text-xs shrink-0">10</div>
          <span class="font-bold text-sm text-slate-900">Testing & Validation Matrix</span>
        </div>
        <!-- 05 -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl px-4 py-2.5 flex items-center gap-3.5 shadow-xs">
          <div class="w-8 h-8 rounded-full bg-[#E87722] text-white flex items-center justify-center font-bold text-xs shrink-0">05</div>
          <span class="font-bold text-sm text-slate-900">Resource Requirements (HW / SW)</span>
        </div>
        <!-- 11 -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl px-4 py-2.5 flex items-center gap-3.5 shadow-xs">
          <div class="w-8 h-8 rounded-full bg-[#E87722] text-white flex items-center justify-center font-bold text-xs shrink-0">11</div>
          <span class="font-bold text-sm text-slate-900">Conclusion & Future Enhancements</span>
        </div>
        <!-- 06 -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl px-4 py-2.5 flex items-center gap-3.5 shadow-xs">
          <div class="w-8 h-8 rounded-full bg-[#E87722] text-white flex items-center justify-center font-bold text-xs shrink-0">06</div>
          <span class="font-bold text-sm text-slate-900">System Design & 3-Tier Architecture</span>
        </div>
        <!-- 12 -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl px-4 py-2.5 flex items-center gap-3.5 shadow-xs">
          <div class="w-8 h-8 rounded-full bg-[#E87722] text-white flex items-center justify-center font-bold text-xs shrink-0">12</div>
          <span class="font-bold text-sm text-slate-900">Academic & Technical References</span>
        </div>
      </div>

      <!-- Slide Footer -->
      <div class="px-8 py-2.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600 bg-white">
        <span class="italic font-serif text-[#6E3314]">Department of Computer Science & Engineering</span>
        <span class="font-bold">2</span>
      </div>
    </div>

    <!-- ===================================================== -->
    <!-- SLIDE 3: INTRODUCTION -->
    <!-- ===================================================== -->
    <div class="slide-canvas" id="slide-3">
      <div class="absolute left-0 top-0 bottom-0 w-3 bg-theme-orange"></div>
      
      <div class="flex items-center bg-[#6E3314] text-white pl-8 pr-12 py-3.5">
        <div class="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center font-black text-xs mr-4 bg-white/10">GLB</div>
        <h2 class="text-2xl font-bold font-serif tracking-wider uppercase">INTRODUCTION</h2>
        <span class="ml-auto text-xs italic opacity-80 font-serif">Department of Computer Science & Engineering</span>
      </div>

      <div class="p-6 space-y-3.5 flex-1 flex flex-col justify-around">
        <!-- 1. Domain & Background -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-4 flex gap-4 shadow-xs">
          <div class="w-10 h-10 rounded-full bg-[#E87722] text-white flex items-center justify-center font-black text-base shrink-0 mt-0.5">1</div>
          <div>
            <h3 class="text-base font-bold text-[#6E3314] mb-1">Domain & Background</h3>
            <p class="text-xs text-slate-700 leading-relaxed">
              <strong>Domain:</strong> FinTech (Financial Technology) & Modern Full-Stack Web Development.<br>
              With the explosion of digital micro-payments via UPI (Unified Payments Interface), shared living arrangements such as student flats, shared rooms, and group trips require real-time, automated tools to record expenditures and settle mutual liabilities transparently.
            </p>
          </div>
        </div>

        <!-- 2. Problem Statement -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-4 flex gap-4 shadow-xs">
          <div class="w-10 h-10 rounded-full bg-[#E87722] text-white flex items-center justify-center font-black text-base shrink-0 mt-0.5">2</div>
          <div>
            <h3 class="text-base font-bold text-[#6E3314] mb-1">Problem Statement</h3>
            <p class="text-xs text-slate-700 leading-relaxed">
              Traditional methods like paper diaries, WhatsApp text logs, and basic spreadsheets are prone to calculation errors, lack automatic debt simplification, and require tedious manual reminders.
              Commercial tools (e.g. Splitwise) have introduced invasive advertisements, 10-second forced delays for free users, and lack direct Indian UPI QR code intent integration.
            </p>
          </div>
        </div>

        <!-- 3. Motivation & Target Audience -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-4 flex gap-4 shadow-xs">
          <div class="w-10 h-10 rounded-full bg-[#E87722] text-white flex items-center justify-center font-black text-base shrink-0 mt-0.5">3</div>
          <div>
            <h3 class="text-base font-bold text-[#6E3314] mb-1">Motivation & Target Audience</h3>
            <p class="text-xs text-slate-700 leading-relaxed">
              <strong>Target Users:</strong> College students, flatmates, travel groups, and student clubs.<br>
              <strong>Motivation:</strong> Build a clean, responsive, zero-advertisement web application powered by a <strong>Greedy Net-Balance Algorithm</strong> that minimizes pairwise transactions from O(N²) to at most O(N-1), combined with instant dynamic UPI QR scan-and-pay.
            </p>
          </div>
        </div>
      </div>

      <div class="px-8 py-2.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600 bg-white">
        <span class="italic font-serif text-[#6E3314]">Department of Computer Science & Engineering</span>
        <span class="font-bold">3</span>
      </div>
    </div>

    <!-- ===================================================== -->
    <!-- SLIDE 4: OBJECTIVES & SCOPE -->
    <!-- ===================================================== -->
    <div class="slide-canvas" id="slide-4">
      <div class="absolute left-0 top-0 bottom-0 w-3 bg-theme-orange"></div>
      
      <div class="flex items-center bg-[#6E3314] text-white pl-8 pr-12 py-3.5">
        <div class="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center font-black text-xs mr-4 bg-white/10">GLB</div>
        <h2 class="text-2xl font-bold font-serif tracking-wider uppercase">OBJECTIVES & SCOPE</h2>
        <span class="ml-auto text-xs italic opacity-80 font-serif">Department of Computer Science & Engineering</span>
      </div>

      <div class="p-6 grid grid-cols-2 gap-6 flex-1">
        <!-- Objectives -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-5 shadow-xs flex flex-col">
          <h3 class="text-base font-bold text-[#6E3314] pb-2 border-b border-[#F3D5C5] mb-3 flex items-center gap-2">
            <span>🎯</span> Project Objectives
          </h3>
          <ul class="space-y-2.5 text-xs text-slate-800 flex-1">
            <li class="flex items-start gap-2">
              <span class="text-[#E87722] font-bold">✔</span>
              <span><strong>Design a responsive full-stack platform:</strong> Build an intuitive UI in React 19 and Tailwind CSS supporting equal, exact, and percentage splits.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-[#E87722] font-bold">✔</span>
              <span><strong>Implement Greedy Debt Simplification:</strong> Minimize net settlements to at most (N-1) payments using an O(N log N) dual-pointer algorithm.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-[#E87722] font-bold">✔</span>
              <span><strong>Native UPI QR Code Integration:</strong> Generate dynamic, pre-filled QR intent codes for 1-tap payment via PhonePe, GPay, and Paytm.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-[#E87722] font-bold">✔</span>
              <span><strong>Real-time Cloud Persistence:</strong> Synchronize ledgers, member expenses, and chat messages in real time using Firebase Firestore.</span>
            </li>
          </ul>
        </div>

        <!-- Scope -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-5 shadow-xs flex flex-col">
          <h3 class="text-base font-bold text-[#6E3314] pb-2 border-b border-[#F3D5C5] mb-3 flex items-center gap-2">
            <span>🔍</span> Scope & Boundaries
          </h3>
          <div class="space-y-3 text-xs text-slate-800 flex-1">
            <div>
              <p class="font-bold text-[#E87722] mb-1">Included in Current Delivery:</p>
              <ul class="list-disc pl-4 space-y-1 text-slate-700">
                <li>Multi-user authentication and customizable user profiles with UPI IDs.</li>
                <li>Group management with 3 split algorithms (Equal, Exact ₹, and %).</li>
                <li>Real-time group collaboration channel with receipt photo capture.</li>
                <li>Monthly personal budget tracker and CSV / JSON data backup.</li>
              </ul>
            </div>
            <div class="pt-2 border-t border-[#F3D5C5]/60">
              <p class="font-bold text-slate-600 mb-1">Future Scope & Limitations:</p>
              <ul class="list-disc pl-4 space-y-1 text-slate-600">
                <li>Direct in-app banking settlement requires RBI / payment aggregator licenses.</li>
                <li>AI vision OCR for automated bill scanning planned for subsequent release.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="px-8 py-2.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600 bg-white">
        <span class="italic font-serif text-[#6E3314]">Department of Computer Science & Engineering</span>
        <span class="font-bold">4</span>
      </div>
    </div>

    <!-- ===================================================== -->
    <!-- SLIDE 5: EXISTING vs PROPOSED SYSTEM -->
    <!-- ===================================================== -->
    <div class="slide-canvas" id="slide-5">
      <div class="absolute left-0 top-0 bottom-0 w-3 bg-theme-orange"></div>
      
      <div class="flex items-center bg-[#6E3314] text-white pl-8 pr-12 py-3.5">
        <div class="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center font-black text-xs mr-4 bg-white/10">GLB</div>
        <h2 class="text-2xl font-bold font-serif tracking-wider uppercase">EXISTING vs PROPOSED SYSTEM</h2>
        <span class="ml-auto text-xs italic opacity-80 font-serif">Department of Computer Science & Engineering</span>
      </div>

      <div class="p-6 flex-1 flex flex-col justify-between">
        <div class="grid grid-cols-2 gap-6">
          <div class="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 class="font-bold text-red-900 text-sm mb-1.5 flex items-center gap-1.5">
              <span>❌</span> Existing Systems (Manual & Splitwise)
            </h4>
            <ul class="text-xs text-slate-700 space-y-1 list-disc pl-4">
              <li>Spreadsheets lack mobile optimization, automated debt graph reduction, and real-time multi-user syncing.</li>
              <li>Splitwise Free forces 10-second advertisement cooldowns and locks debt simplification behind paid tiers.</li>
              <li>No native dynamic Indian UPI QR intent generation.</li>
            </ul>
          </div>

          <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <h4 class="font-bold text-emerald-900 text-sm mb-1.5 flex items-center gap-1.5">
              <span>✔</span> Proposed System (SmartSplit - Group 7)
            </h4>
            <ul class="text-xs text-slate-700 space-y-1 list-disc pl-4">
              <li>100% web-accessible across phones and laptops with zero ads and zero latency.</li>
              <li>Integrated Greedy Net-Balance debt reduction minimizing total transactions to at most (N-1).</li>
              <li>One-tap dynamic UPI QR code generator for instant GPay, PhonePe, and Paytm payments.</li>
            </ul>
          </div>
        </div>

        <!-- Comparative Feature Matrix Table -->
        <div class="mt-3 overflow-hidden rounded-xl border border-slate-200">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-100 text-slate-900 font-bold border-b border-slate-200">
              <tr>
                <th class="py-2 px-3">Feature Parameter</th>
                <th class="py-2 px-3">Manual Diaries / Excel</th>
                <th class="py-2 px-3">Splitwise (Free Tier)</th>
                <th class="py-2 px-3 bg-emerald-100/60 text-emerald-950">SmartSplit (Group 7)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 text-slate-700">
              <tr>
                <td class="py-1.5 px-3 font-semibold">Debt Simplification</td>
                <td class="py-1.5 px-3">Manual formulas only</td>
                <td class="py-1.5 px-3 text-rose-600 font-medium">Locked (Paid Pro Only)</td>
                <td class="py-1.5 px-3 bg-emerald-50 text-emerald-900 font-bold">✔ Built-in Greedy Engine</td>
              </tr>
              <tr>
                <td class="py-1.5 px-3 font-semibold">Native UPI QR Codes</td>
                <td class="py-1.5 px-3">Not Supported</td>
                <td class="py-1.5 px-3 text-amber-700">Limited / 3rd Party</td>
                <td class="py-1.5 px-3 bg-emerald-50 text-emerald-900 font-bold">✔ Dynamic NPCI UPI QR Intent</td>
              </tr>
              <tr>
                <td class="py-1.5 px-3 font-semibold">User Experience</td>
                <td class="py-1.5 px-3">High manual friction</td>
                <td class="py-1.5 px-3 text-rose-600">Ads & 10s wait intervals</td>
                <td class="py-1.5 px-3 bg-emerald-50 text-emerald-900 font-bold">✔ Zero Ads / Instant (< 2ms)</td>
              </tr>
              <tr>
                <td class="py-1.5 px-3 font-semibold">Cloud Sync & Persistence</td>
                <td class="py-1.5 px-3">No (File based)</td>
                <td class="py-1.5 px-3">Proprietary Cloud</td>
                <td class="py-1.5 px-3 bg-emerald-50 text-emerald-900 font-bold">✔ Google Firebase Firestore</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="px-8 py-2.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600 bg-white">
        <span class="italic font-serif text-[#6E3314]">Department of Computer Science & Engineering</span>
        <span class="font-bold">5</span>
      </div>
    </div>

    <!-- ===================================================== -->
    <!-- SLIDE 6: TECHNOLOGY STACK -->
    <!-- ===================================================== -->
    <div class="slide-canvas" id="slide-6">
      <div class="absolute left-0 top-0 bottom-0 w-3 bg-theme-orange"></div>
      
      <div class="flex items-center bg-[#6E3314] text-white pl-8 pr-12 py-3.5">
        <div class="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center font-black text-xs mr-4 bg-white/10">GLB</div>
        <h2 class="text-2xl font-bold font-serif tracking-wider uppercase">TECHNOLOGY STACK</h2>
        <span class="ml-auto text-xs italic opacity-80 font-serif">Department of Computer Science & Engineering</span>
      </div>

      <div class="p-6 grid grid-cols-3 gap-5 flex-1">
        <!-- 1. Frontend -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="w-6 h-6 rounded-full bg-[#E87722] text-white text-xs font-bold flex items-center justify-center">1</span>
              <h3 class="font-bold text-sm text-[#6E3314]">Frontend Tier</h3>
            </div>
            <p class="text-xs font-extrabold text-[#E87722] mb-2">React 19 & TypeScript</p>
            <ul class="text-[11px] text-slate-700 space-y-1.5 list-disc pl-3">
              <li><strong>React 19:</strong> Modern hooks, reactive state model, fast component rendering.</li>
              <li><strong>TypeScript:</strong> Compile-time type validation for User, Expense, and Group models.</li>
              <li><strong>Tailwind CSS v4:</strong> Mobile-first styling with modern glassmorphism.</li>
              <li><strong>Lucide Icons:</strong> Lightweight SVG vector iconography.</li>
            </ul>
          </div>
          <div class="pt-2 border-t border-[#F3D5C5] text-[10px] text-slate-500 font-semibold">
            Single Page Application (SPA)
          </div>
        </div>

        <!-- 2. Backend & Cloud -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="w-6 h-6 rounded-full bg-[#E87722] text-white text-xs font-bold flex items-center justify-center">2</span>
              <h3 class="font-bold text-sm text-[#6E3314]">Backend & Cloud</h3>
            </div>
            <p class="text-xs font-extrabold text-[#E87722] mb-2">Firebase Firestore & Auth</p>
            <ul class="text-[11px] text-slate-700 space-y-1.5 list-disc pl-3">
              <li><strong>Cloud Firestore:</strong> NoSQL document database with onSnapshot real-time sync.</li>
              <li><strong>Firebase Auth:</strong> Secure email/password authentication & user management.</li>
              <li><strong>Security Rules:</strong> Granular access control protecting group data.</li>
              <li><strong>Offline Persistence:</strong> IndexedDB caching for offline operation.</li>
            </ul>
          </div>
          <div class="pt-2 border-t border-[#F3D5C5] text-[10px] text-slate-500 font-semibold">
            Serverless Cloud Architecture
          </div>
        </div>

        <!-- 3. Algorithms & Tools -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="w-6 h-6 rounded-full bg-[#E87722] text-white text-xs font-bold flex items-center justify-center">3</span>
              <h3 class="font-bold text-sm text-[#6E3314]">Engine & Tools</h3>
            </div>
            <p class="text-xs font-extrabold text-[#E87722] mb-2">Greedy Engine & Vite</p>
            <ul class="text-[11px] text-slate-700 space-y-1.5 list-disc pl-3">
              <li><strong>Greedy Engine:</strong> O(N log N) min-cash-flow algorithm reducing payment hops.</li>
              <li><strong>QR Canvas:</strong> Generates standard NPCI-compliant UPI payment intent codes.</li>
              <li><strong>Vite v6.2:</strong> Ultra-fast developer tooling & optimized production bundler.</li>
              <li><strong>Git & GitHub:</strong> Version control, branch workflows, and deployment pipelines.</li>
            </ul>
          </div>
          <div class="pt-2 border-t border-[#F3D5C5] text-[10px] text-slate-500 font-semibold">
            Algorithmic Optimization (< 2ms)
          </div>
        </div>
      </div>

      <div class="px-8 py-2.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600 bg-white">
        <span class="italic font-serif text-[#6E3314]">Department of Computer Science & Engineering</span>
        <span class="font-bold">6</span>
      </div>
    </div>

    <!-- ===================================================== -->
    <!-- SLIDE 7: RESOURCE REQUIREMENTS -->
    <!-- ===================================================== -->
    <div class="slide-canvas" id="slide-7">
      <div class="absolute left-0 top-0 bottom-0 w-3 bg-theme-orange"></div>
      
      <div class="flex items-center bg-[#6E3314] text-white pl-8 pr-12 py-3.5">
        <div class="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center font-black text-xs mr-4 bg-white/10">GLB</div>
        <h2 class="text-2xl font-bold font-serif tracking-wider uppercase">RESOURCE REQUIREMENTS</h2>
        <span class="ml-auto text-xs italic opacity-80 font-serif">Department of Computer Science & Engineering</span>
      </div>

      <div class="p-6 grid grid-cols-2 gap-6 flex-1">
        <!-- Hardware Requirements -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-4 shadow-xs">
          <h3 class="font-bold text-sm text-[#6E3314] mb-3 flex items-center gap-2">
            <span>💻</span> Hardware Specifications (Minimum vs. Used)
          </h3>
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="border-b border-[#F3D5C5] text-slate-800 font-bold">
                <th class="py-1.5">Component</th>
                <th class="py-1.5">Minimum</th>
                <th class="py-1.5">Development Environment</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F3D5C5]/60 text-slate-700">
              <tr>
                <td class="py-2 font-semibold">Processor</td>
                <td>Dual Core i3</td>
                <td class="text-emerald-800 font-bold">Intel Core i5 / Ryzen 5 (or higher)</td>
              </tr>
              <tr>
                <td class="py-2 font-semibold">RAM</td>
                <td>4 GB DDR3</td>
                <td class="text-emerald-800 font-bold">8 GB / 16 GB DDR4</td>
              </tr>
              <tr>
                <td class="py-2 font-semibold">Storage</td>
                <td>2 GB free disk space</td>
                <td class="text-emerald-800 font-bold">256 GB SSD (High I/O speed)</td>
              </tr>
              <tr>
                <td class="py-2 font-semibold">Display</td>
                <td>1366 × 768 px</td>
                <td class="text-emerald-800 font-bold">1920 × 1080 (FHD / Responsive)</td>
              </tr>
              <tr>
                <td class="py-2 font-semibold">Network</td>
                <td>512 Kbps</td>
                <td class="text-emerald-800 font-bold">Broadband / 4G Internet connection</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Software Requirements -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-4 shadow-xs">
          <h3 class="font-bold text-sm text-[#6E3314] mb-3 flex items-center gap-2">
            <span>⚙</span> Software Specifications & Tooling
          </h3>
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="border-b border-[#F3D5C5] text-slate-800 font-bold">
                <th class="py-1.5">Tool Category</th>
                <th class="py-1.5">Software Name</th>
                <th class="py-1.5">Exact Version / Role</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F3D5C5]/60 text-slate-700">
              <tr>
                <td class="py-2 font-semibold">Operating System</td>
                <td>Windows 11 / Linux</td>
                <td class="text-emerald-800 font-bold">64-bit Architecture</td>
              </tr>
              <tr>
                <td class="py-2 font-semibold">Code Editor</td>
                <td>VS Code</td>
                <td class="text-emerald-800 font-bold">v1.95+ with ESLint & Prettier</td>
              </tr>
              <tr>
                <td class="py-2 font-semibold">Runtime Engine</td>
                <td>Node.js & npm / bun</td>
                <td class="text-emerald-800 font-bold">Node v20.x / v22.x LTS</td>
              </tr>
              <tr>
                <td class="py-2 font-semibold">Cloud Database</td>
                <td>Google Firebase</td>
                <td class="text-emerald-800 font-bold">Cloud Firestore & Auth SDK v12</td>
              </tr>
              <tr>
                <td class="py-2 font-semibold">Version Control</td>
                <td>Git & GitHub</td>
                <td class="text-emerald-800 font-bold">Git 2.40+ (Cloud Repository)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="px-8 py-2.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600 bg-white">
        <span class="italic font-serif text-[#6E3314]">Department of Computer Science & Engineering</span>
        <span class="font-bold">7</span>
      </div>
    </div>

    <!-- ===================================================== -->
    <!-- SLIDE 8: SYSTEM DESIGN & ARCHITECTURE -->
    <!-- ===================================================== -->
    <div class="slide-canvas" id="slide-8">
      <div class="absolute left-0 top-0 bottom-0 w-3 bg-theme-orange"></div>
      
      <div class="flex items-center bg-[#6E3314] text-white pl-8 pr-12 py-3.5">
        <div class="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center font-black text-xs mr-4 bg-white/10">GLB</div>
        <h2 class="text-2xl font-bold font-serif tracking-wider uppercase">SYSTEM DESIGN & ARCHITECTURE</h2>
        <span class="ml-auto text-xs italic opacity-80 font-serif">Department of Computer Science & Engineering</span>
      </div>

      <div class="p-6 flex-1 flex flex-col justify-between">
        <!-- 3-Tier Layered Pipeline Diagram -->
        <div class="grid grid-cols-4 gap-3">
          <div class="bg-[#6E3314] text-white p-3.5 rounded-xl text-center shadow-xs">
            <span class="text-[10px] font-bold text-amber-300 block uppercase">Tier 1: Client</span>
            <h4 class="font-bold text-sm mt-0.5">User Web Browser</h4>
            <p class="text-[10px] text-slate-200 mt-1">Desktop & Mobile Viewports</p>
          </div>
          <div class="bg-[#6E3314] text-white p-3.5 rounded-xl text-center shadow-xs">
            <span class="text-[10px] font-bold text-amber-300 block uppercase">Tier 2: Presentation</span>
            <h4 class="font-bold text-sm mt-0.5">React 19 SPA Engine</h4>
            <p class="text-[10px] text-slate-200 mt-1">Context API & Hooks State</p>
          </div>
          <div class="bg-[#E87722] text-white p-3.5 rounded-xl text-center shadow-xs">
            <span class="text-[10px] font-bold text-white/90 block uppercase">Tier 3: Business Logic</span>
            <h4 class="font-bold text-sm mt-0.5">Greedy Debt Optimizer</h4>
            <p class="text-[10px] text-amber-100 mt-1">O(N log N) Dual Heap Matching</p>
          </div>
          <div class="bg-[#6E3314] text-white p-3.5 rounded-xl text-center shadow-xs">
            <span class="text-[10px] font-bold text-amber-300 block uppercase">Tier 4: Cloud Data</span>
            <h4 class="font-bold text-sm mt-0.5">Firebase Firestore</h4>
            <p class="text-[10px] text-slate-200 mt-1">Realtime NoSQL sync</p>
          </div>
        </div>

        <!-- Algorithmic Methodology Box -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-4 shadow-xs mt-3 flex-1 flex flex-col justify-around">
          <h4 class="font-bold text-xs text-[#6E3314] uppercase tracking-wider">
            Mathematical Methodology: Greedy Net-Balance Minimization
          </h4>
          <div class="grid grid-cols-2 gap-4 text-xs">
            <div class="bg-white p-3 rounded-lg border border-[#F3D5C5]">
              <p class="font-bold text-slate-900 mb-1">Step 1: Compute Net Balance per User</p>
              <code class="text-[11px] text-indigo-900 bg-indigo-50 p-1 rounded block">
                Net_Balance(u) = Total_Paid(u) - Total_Owed(u)
              </code>
              <p class="text-[10px] text-slate-600 mt-1">Invariant: Sum of all Net Balances equals exactly 0.00.</p>
            </div>
            <div class="bg-white p-3 rounded-lg border border-[#F3D5C5]">
              <p class="font-bold text-slate-900 mb-1">Step 2: Two-Pointer Greedy Matching</p>
              <code class="text-[11px] text-emerald-900 bg-emerald-50 p-1 rounded block">
                Transfer = Min(Max_Debtor_Amount, Max_Creditor_Amount)
              </code>
              <p class="text-[10px] text-slate-600 mt-1">Eliminates cyclic payment loops; guarantees maximum (N-1) transfers.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="px-8 py-2.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600 bg-white">
        <span class="italic font-serif text-[#6E3314]">Department of Computer Science & Engineering</span>
        <span class="font-bold">8</span>
      </div>
    </div>

    <!-- ===================================================== -->
    <!-- SLIDE 9: METHODOLOGY -->
    <!-- ===================================================== -->
    <div class="slide-canvas" id="slide-9">
      <div class="absolute left-0 top-0 bottom-0 w-3 bg-theme-orange"></div>
      
      <div class="flex items-center bg-[#6E3314] text-white pl-8 pr-12 py-3.5">
        <div class="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center font-black text-xs mr-4 bg-white/10">GLB</div>
        <h2 class="text-2xl font-bold font-serif tracking-wider uppercase">METHODOLOGY</h2>
        <span class="ml-auto text-xs italic opacity-80 font-serif">Department of Computer Science & Engineering</span>
      </div>

      <div class="p-6 flex-1 flex flex-col justify-between">
        <p class="text-xs text-slate-600 font-semibold mb-2">
          Software Development Life Cycle: Agile Scrum framework with 2-week iterative sprints.
        </p>

        <!-- 5 Methodology Cards -->
        <div class="grid grid-cols-5 gap-3">
          <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-3 text-center flex flex-col justify-between shadow-xs">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#E87722] text-white font-bold text-xs flex items-center justify-center mx-auto mb-2">1</div>
              <h4 class="font-bold text-xs text-[#6E3314] mb-1">Requirement Analysis</h4>
              <p class="text-[10px] text-slate-700 leading-tight">Gathered student group expense pain points and payment workflow.</p>
            </div>
            <span class="text-[9px] text-[#E87722] font-bold mt-2">Sprint 1</span>
          </div>

          <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-3 text-center flex flex-col justify-between shadow-xs">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#E87722] text-white font-bold text-xs flex items-center justify-center mx-auto mb-2">2</div>
              <h4 class="font-bold text-xs text-[#6E3314] mb-1">System & UI Design</h4>
              <p class="text-[10px] text-slate-700 leading-tight">Created wireframes, Tailwind styling, and Firestore NoSQL schema.</p>
            </div>
            <span class="text-[9px] text-[#E87722] font-bold mt-2">Sprint 2</span>
          </div>

          <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-3 text-center flex flex-col justify-between shadow-xs">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#E87722] text-white font-bold text-xs flex items-center justify-center mx-auto mb-2">3</div>
              <h4 class="font-bold text-xs text-[#6E3314] mb-1">Development</h4>
              <p class="text-[10px] text-slate-700 leading-tight">Coded React 19 SPA, Greedy Debt Engine, and dynamic UPI QR generator.</p>
            </div>
            <span class="text-[9px] text-[#E87722] font-bold mt-2">Sprint 3-4</span>
          </div>

          <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-3 text-center flex flex-col justify-between shadow-xs">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#E87722] text-white font-bold text-xs flex items-center justify-center mx-auto mb-2">4</div>
              <h4 class="font-bold text-xs text-[#6E3314] mb-1">Testing & QA</h4>
              <p class="text-[10px] text-slate-700 leading-tight">Executed unit tests, split invariance checks, and device latency benchmarks.</p>
            </div>
            <span class="text-[9px] text-[#E87722] font-bold mt-2">Sprint 5</span>
          </div>

          <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-3 text-center flex flex-col justify-between shadow-xs">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#E87722] text-white font-bold text-xs flex items-center justify-center mx-auto mb-2">5</div>
              <h4 class="font-bold text-xs text-[#6E3314] mb-1">Deployment</h4>
              <p class="text-[10px] text-slate-700 leading-tight">Configured production build, GitHub sync, and Cloud Run staging.</p>
            </div>
            <span class="text-[9px] text-[#E87722] font-bold mt-2">Sprint 6</span>
          </div>
        </div>

        <!-- Key Takeaway Note -->
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3 text-xs text-amber-900 flex items-center gap-2">
          <span class="font-bold">💡 Engineering Model:</span>
          <span>Continuous code reviews, modular component testing, and Git version control ensured zero breaking regressions.</span>
        </div>
      </div>

      <div class="px-8 py-2.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600 bg-white">
        <span class="italic font-serif text-[#6E3314]">Department of Computer Science & Engineering</span>
        <span class="font-bold">9</span>
      </div>
    </div>

    <!-- ===================================================== -->
    <!-- SLIDE 10: MODULES & FEATURES -->
    <!-- ===================================================== -->
    <div class="slide-canvas" id="slide-10">
      <div class="absolute left-0 top-0 bottom-0 w-3 bg-theme-orange"></div>
      
      <div class="flex items-center bg-[#6E3314] text-white pl-8 pr-12 py-3.5">
        <div class="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center font-black text-xs mr-4 bg-white/10">GLB</div>
        <h2 class="text-2xl font-bold font-serif tracking-wider uppercase">MODULES & FEATURES</h2>
        <span class="ml-auto text-xs italic opacity-80 font-serif">Department of Computer Science & Engineering</span>
      </div>

      <div class="p-6 grid grid-cols-3 gap-4 flex-1">
        <!-- 01 -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="w-6 h-6 rounded-full bg-[#E87722] text-white text-xs font-bold flex items-center justify-center">01</span>
              <h4 class="font-bold text-xs text-[#6E3314]">Auth & Profile</h4>
            </div>
            <p class="text-[11px] text-slate-700 leading-tight">Firebase login, session persistence, active user switcher, customizable UPI ID & avatars.</p>
          </div>
        </div>

        <!-- 02 -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="w-6 h-6 rounded-full bg-[#E87722] text-white text-xs font-bold flex items-center justify-center">02</span>
              <h4 class="font-bold text-xs text-[#6E3314]">Interactive Dashboard</h4>
            </div>
            <p class="text-[11px] text-slate-700 leading-tight">Total Spending, You Are Owed, You Owe, Net Balance cards, and budget progression bars.</p>
          </div>
        </div>

        <!-- 03 -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="w-6 h-6 rounded-full bg-[#E87722] text-white text-xs font-bold flex items-center justify-center">03</span>
              <h4 class="font-bold text-xs text-[#6E3314]">3 Split Modes</h4>
            </div>
            <p class="text-[11px] text-slate-700 leading-tight">Equal split (S/N), Exact Rupee distribution, and percentage (%) splits with strict sum-validation.</p>
          </div>
        </div>

        <!-- 04 -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="w-6 h-6 rounded-full bg-[#E87722] text-white text-xs font-bold flex items-center justify-center">04</span>
              <h4 class="font-bold text-xs text-[#6E3314]">Greedy Debt Simplifier</h4>
            </div>
            <p class="text-[11px] text-slate-700 leading-tight">Calculates the minimum cash flow needed to balance group liabilities, cancelling cyclic debts.</p>
          </div>
        </div>

        <!-- 05 -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="w-6 h-6 rounded-full bg-[#E87722] text-white text-xs font-bold flex items-center justify-center">05</span>
              <h4 class="font-bold text-xs text-[#6E3314]">Dynamic UPI QR</h4>
            </div>
            <p class="text-[11px] text-slate-700 leading-tight">Generates standard NPCI QR intent with pre-filled payee details for instant PhonePe/GPay payments.</p>
          </div>
        </div>

        <!-- 06 -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="w-6 h-6 rounded-full bg-[#E87722] text-white text-xs font-bold flex items-center justify-center">06</span>
              <h4 class="font-bold text-xs text-[#6E3314]">Chat & Data Backup</h4>
            </div>
            <p class="text-[11px] text-slate-700 leading-tight">Real-time group chat with receipt attachment, recurring expenses, and CSV/JSON export/restore.</p>
          </div>
        </div>
      </div>

      <div class="px-8 py-2.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600 bg-white">
        <span class="italic font-serif text-[#6E3314]">Department of Computer Science & Engineering</span>
        <span class="font-bold">10</span>
      </div>
    </div>

    <!-- ===================================================== -->
    <!-- SLIDE 11: IMPLEMENTATION & RESULTS -->
    <!-- ===================================================== -->
    <div class="slide-canvas" id="slide-11">
      <div class="absolute left-0 top-0 bottom-0 w-3 bg-theme-orange"></div>
      
      <div class="flex items-center bg-[#6E3314] text-white pl-8 pr-12 py-3.5">
        <div class="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center font-black text-xs mr-4 bg-white/10">GLB</div>
        <h2 class="text-2xl font-bold font-serif tracking-wider uppercase">IMPLEMENTATION & RESULTS</h2>
        <span class="ml-auto text-xs italic opacity-80 font-serif">Department of Computer Science & Engineering</span>
      </div>

      <div class="p-6 flex-1 flex flex-col justify-between">
        <div class="grid grid-cols-3 gap-5">
          <!-- Screen 1 -->
          <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-3 flex flex-col">
            <span class="text-[11px] font-bold text-[#6E3314] mb-2 block">1. Dashboard & Expenses</span>
            <div class="bg-white p-2.5 rounded-lg border border-slate-200 text-[10px] space-y-1.5 flex-1">
              <div class="flex justify-between items-center bg-blue-50 p-1.5 rounded font-bold text-blue-900">
                <span>Total Spent</span>
                <span>₹18,450.00</span>
              </div>
              <div class="flex justify-between items-center bg-emerald-50 p-1.5 rounded font-bold text-emerald-900">
                <span>You are Owed</span>
                <span>+₹3,250.00</span>
              </div>
              <div class="flex justify-between items-center bg-rose-50 p-1.5 rounded font-bold text-rose-900">
                <span>You Owe</span>
                <span>-₹1,120.00</span>
              </div>
            </div>
            <p class="text-[10px] text-slate-600 mt-2 text-center font-medium">Real-time metrics with zero lag</p>
          </div>

          <!-- Screen 2 -->
          <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-3 flex flex-col">
            <span class="text-[11px] font-bold text-[#6E3314] mb-2 block">2. Add Expense & Split Modal</span>
            <div class="bg-white p-2.5 rounded-lg border border-slate-200 text-[10px] space-y-1.5 flex-1">
              <div class="p-1.5 rounded bg-slate-50 border border-slate-200">
                <strong>Description:</strong> Weekend Trip Food
              </div>
              <div class="p-1.5 rounded bg-slate-50 border border-slate-200">
                <strong>Amount:</strong> ₹2,400.00 | Paid by Pratibha
              </div>
              <div class="p-1.5 rounded bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                Split: Equal (4 members @ ₹600.00 each)
              </div>
            </div>
            <p class="text-[10px] text-slate-600 mt-2 text-center font-medium">Equal, Exact, and % calculations</p>
          </div>

          <!-- Screen 3 -->
          <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-3 flex flex-col">
            <span class="text-[11px] font-bold text-[#6E3314] mb-2 block">3. Dynamic UPI QR Settlement</span>
            <div class="bg-white p-2.5 rounded-lg border border-slate-200 text-[10px] space-y-1.5 flex-1 flex flex-col items-center justify-center text-center">
              <div class="w-16 h-16 bg-slate-900 text-white flex items-center justify-center font-bold text-xs rounded-md shadow-xs mb-1">
                [UPI QR]
              </div>
              <p class="text-[10px] font-bold text-slate-800">Scan to Pay ₹1,120.00</p>
              <p class="text-[9px] text-slate-500">Payee: pratiksha@oksbi</p>
            </div>
            <p class="text-[10px] text-slate-600 mt-2 text-center font-medium">Verified on GPay & PhonePe</p>
          </div>
        </div>

        <!-- Repository & Deployment Banner -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex justify-between items-center text-xs mt-3">
          <div>
            <span class="font-bold text-blue-900">GitHub Repository:</span>
            <span class="text-blue-800 font-mono ml-2">https://github.com/pratibhasingh2009/Smart-Splitter</span>
          </div>
          <span class="bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full text-[10px]">
            ● Production Live
          </span>
        </div>
      </div>

      <div class="px-8 py-2.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600 bg-white">
        <span class="italic font-serif text-[#6E3314]">Department of Computer Science & Engineering</span>
        <span class="font-bold">11</span>
      </div>
    </div>

    <!-- ===================================================== -->
    <!-- SLIDE 12: TESTING & VALIDATION -->
    <!-- ===================================================== -->
    <div class="slide-canvas" id="slide-12">
      <div class="absolute left-0 top-0 bottom-0 w-3 bg-theme-orange"></div>
      
      <div class="flex items-center bg-[#6E3314] text-white pl-8 pr-12 py-3.5">
        <div class="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center font-black text-xs mr-4 bg-white/10">GLB</div>
        <h2 class="text-2xl font-bold font-serif tracking-wider uppercase">TESTING & VALIDATION</h2>
        <span class="ml-auto text-xs italic opacity-80 font-serif">Department of Computer Science & Engineering</span>
      </div>

      <div class="p-6 flex-1 flex flex-col justify-between">
        <div class="overflow-hidden rounded-xl border border-slate-200 shadow-xs">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-100 text-slate-900 font-bold border-b border-slate-200">
              <tr>
                <th class="py-2 px-3">Test Case</th>
                <th class="py-2 px-3">Input Scenario</th>
                <th class="py-2 px-3">Expected Result</th>
                <th class="py-2 px-3">Observed Latency</th>
                <th class="py-2 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 text-slate-700">
              <tr>
                <td class="py-1.5 px-3 font-semibold">User Authentication</td>
                <td class="py-1.5 px-3">Valid email/password or demo perspective</td>
                <td class="py-1.5 px-3">Session token restored, dashboard rendered</td>
                <td class="py-1.5 px-3 font-mono text-[11px]">320 ms</td>
                <td class="py-1.5 px-3 text-center"><span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">PASS</span></td>
              </tr>
              <tr>
                <td class="py-1.5 px-3 font-semibold">Equal Split Precision</td>
                <td class="py-1.5 px-3">₹1,000 expense among 3 members</td>
                <td class="py-1.5 px-3">₹333.34 + ₹333.33 + ₹333.33 == ₹1,000.00</td>
                <td class="py-1.5 px-3 font-mono text-[11px]">< 1 ms</td>
                <td class="py-1.5 px-3 text-center"><span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">PASS</span></td>
              </tr>
              <tr>
                <td class="py-1.5 px-3 font-semibold">Net Balance Invariance</td>
                <td class="py-1.5 px-3">15 random multi-party expenses</td>
                <td class="py-1.5 px-3">Sum(Net Balances) == 0.00 strictly verified</td>
                <td class="py-1.5 px-3 font-mono text-[11px]">< 2 ms</td>
                <td class="py-1.5 px-3 text-center"><span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">PASS</span></td>
              </tr>
              <tr>
                <td class="py-1.5 px-3 font-semibold">Greedy Debt Simplifier</td>
                <td class="py-1.5 px-3">Cyclic debts among 4 members</td>
                <td class="py-1.5 px-3">6 pairwise debts reduced to 2 direct transfers</td>
                <td class="py-1.5 px-3 font-mono text-[11px]">1.85 ms</td>
                <td class="py-1.5 px-3 text-center"><span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">PASS</span></td>
              </tr>
              <tr>
                <td class="py-1.5 px-3 font-semibold">Dynamic UPI QR Intent</td>
                <td class="py-1.5 px-3">Amount: ₹1,120, Payee: 'pratiksha@oksbi'</td>
                <td class="py-1.5 px-3">Standard NPCI UPI string generated and scanned</td>
                <td class="py-1.5 px-3 font-mono text-[11px]">8.20 ms</td>
                <td class="py-1.5 px-3 text-center"><span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">PASS</span></td>
              </tr>
              <tr>
                <td class="py-1.5 px-3 font-semibold">Firestore Cloud Sync</td>
                <td class="py-1.5 px-3">Expense created in Client 1</td>
                <td class="py-1.5 px-3">Real-time update received in Client 2 tab</td>
                <td class="py-1.5 px-3 font-mono text-[11px]">210 ms</td>
                <td class="py-1.5 px-3 text-center"><span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">PASS</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="text-xs text-slate-600 italic">
          Validation Conclusion: All functional modules, arithmetic invariants, and responsive viewports passed with 100% test success rate.
        </p>
      </div>

      <div class="px-8 py-2.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600 bg-white">
        <span class="italic font-serif text-[#6E3314]">Department of Computer Science & Engineering</span>
        <span class="font-bold">12</span>
      </div>
    </div>

    <!-- ===================================================== -->
    <!-- SLIDE 13: CONCLUSION & FUTURE SCOPE -->
    <!-- ===================================================== -->
    <div class="slide-canvas" id="slide-13">
      <div class="absolute left-0 top-0 bottom-0 w-3 bg-theme-orange"></div>
      
      <div class="flex items-center bg-[#6E3314] text-white pl-8 pr-12 py-3.5">
        <div class="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center font-black text-xs mr-4 bg-white/10">GLB</div>
        <h2 class="text-2xl font-bold font-serif tracking-wider uppercase">CONCLUSION & FUTURE SCOPE</h2>
        <span class="ml-auto text-xs italic opacity-80 font-serif">Department of Computer Science & Engineering</span>
      </div>

      <div class="p-6 grid grid-cols-2 gap-6 flex-1">
        <!-- Conclusion -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="w-6 h-6 rounded-full bg-[#E87722] text-white text-xs font-bold flex items-center justify-center">1</span>
              <h3 class="font-bold text-sm text-[#6E3314]">Project Conclusion</h3>
            </div>
            <ul class="text-xs text-slate-800 space-y-2 list-disc pl-3">
              <li>Successfully designed and built <strong>Personal Budget & Expense Splitter (SmartSplit)</strong> solving real-world group expense friction.</li>
              <li>Integrated the <strong>Greedy Net-Balance Algorithm</strong>, proving that multi-party debt can be minimized mathematically to at most (N-1) transfers.</li>
              <li>Enabled frictionless 1-tap settlements using dynamic NPCI UPI QR code generation.</li>
              <li>Delivered a responsive, zero-advertisement user experience with real-time Firebase cloud synchronization.</li>
            </ul>
          </div>
          <div class="pt-2 border-t border-[#F3D5C5] text-[11px] font-bold text-slate-700">
            All objectives accomplished within 2nd Year Mini Project curriculum.
          </div>
        </div>

        <!-- Future Scope -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="w-6 h-6 rounded-full bg-[#E87722] text-white text-xs font-bold flex items-center justify-center">2</span>
              <h3 class="font-bold text-sm text-[#6E3314]">Future Scope & Enhancements</h3>
            </div>
            <ul class="text-xs text-slate-800 space-y-2 list-disc pl-3">
              <li><strong>OCR / AI Receipt Parsing:</strong> Integrate Gemini Vision AI to read scanned paper bills and automatically populate split items.</li>
              <li><strong>Progressive Web App (PWA):</strong> Enable installable native mobile app packaging with offline push notifications for payment reminders.</li>
              <li><strong>Direct Payment Gateway Webhooks:</strong> Partner with authorized payment aggregators for automated in-app payment status webhooks.</li>
              <li><strong>Multi-Currency Forex:</strong> Live exchange rate API integration for international student travel groups.</li>
            </ul>
          </div>
          <div class="pt-2 border-t border-[#F3D5C5] text-[11px] font-bold text-[#E87722]">
            Scalable architecture ready for commercial mobile deployment.
          </div>
        </div>
      </div>

      <div class="px-8 py-2.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600 bg-white">
        <span class="italic font-serif text-[#6E3314]">Department of Computer Science & Engineering</span>
        <span class="font-bold">13</span>
      </div>
    </div>

    <!-- ===================================================== -->
    <!-- SLIDE 14: REFERENCES -->
    <!-- ===================================================== -->
    <div class="slide-canvas" id="slide-14">
      <div class="absolute left-0 top-0 bottom-0 w-3 bg-theme-orange"></div>
      
      <div class="flex items-center bg-[#6E3314] text-white pl-8 pr-12 py-3.5">
        <div class="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center font-black text-xs mr-4 bg-white/10">GLB</div>
        <h2 class="text-2xl font-bold font-serif tracking-wider uppercase">REFERENCES</h2>
        <span class="ml-auto text-xs italic opacity-80 font-serif">Department of Computer Science & Engineering</span>
      </div>

      <div class="p-6 flex-1 flex flex-col justify-between">
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-xl p-5 shadow-xs flex-1">
          <h3 class="font-bold text-sm text-[#6E3314] mb-3">Academic, Technical & Documentation Citations (APA 7th Edition)</h3>
          <ul class="space-y-3 text-xs text-slate-800">
            <li class="pl-2 border-l-2 border-[#E87722]">
              <strong>[1]</strong> Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). <em>Introduction to Algorithms</em> (4th ed.). MIT Press. (Greedy Algorithms & Minimum Cash Flow Optimization).
            </li>
            <li class="pl-2 border-l-2 border-[#E87722]">
              <strong>[2]</strong> React Documentation. (2026). <em>React 19 Architecture, Hooks & Component Model</em>. Meta Platforms Inc. <a href="https://react.dev" target="_blank" class="text-blue-600 underline">https://react.dev</a>
            </li>
            <li class="pl-2 border-l-2 border-[#E87722]">
              <strong>[3]</strong> Google Firebase. (2026). <em>Cloud Firestore Realtime Database & Security Rules Architecture</em>. Google LLC. <a href="https://firebase.google.com/docs/firestore" target="_blank" class="text-blue-600 underline">https://firebase.google.com/docs/firestore</a>
            </li>
            <li class="pl-2 border-l-2 border-[#E87722]">
              <strong>[4]</strong> National Payments Corporation of India (NPCI). (2026). <em>Unified Payments Interface (UPI) Deep Linking & Dynamic QR Code Specification</em>. <a href="https://www.npci.org.in" target="_blank" class="text-blue-600 underline">https://www.npci.org.in</a>
            </li>
            <li class="pl-2 border-l-2 border-[#E87722]">
              <strong>[5]</strong> Tailwind Labs. (2026). <em>Tailwind CSS v4: Modern Utility-First Frontend Styling Documentation</em>. <a href="https://tailwindcss.com" target="_blank" class="text-blue-600 underline">https://tailwindcss.com</a>
            </li>
          </ul>
        </div>

        <p class="text-xs text-slate-500 italic mt-3">
          Note: All listed technical references and specifications were reviewed and utilized during system design and implementation.
        </p>
      </div>

      <div class="px-8 py-2.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600 bg-white">
        <span class="italic font-serif text-[#6E3314]">Department of Computer Science & Engineering</span>
        <span class="font-bold">14</span>
      </div>
    </div>

    <!-- ===================================================== -->
    <!-- SLIDE 15: THANK YOU -->
    <!-- ===================================================== -->
    <div class="slide-canvas" id="slide-15">
      <div class="absolute left-0 top-0 bottom-0 w-3 bg-theme-orange"></div>
      
      <div class="flex items-center justify-between px-10 pt-8">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full border border-[#6E3314] flex items-center justify-center font-black text-xs text-[#6E3314] bg-orange-50">GLB</div>
          <div>
            <h4 class="font-black text-sm text-[#6E3314]">GL BAJAJ</h4>
            <p class="text-[9px] font-bold text-[#E87722]">FIND YOUR SPARK</p>
          </div>
        </div>
        <p class="italic font-serif text-[#6E3314] text-sm">Department of Computer Science & Engineering</p>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center text-center px-8">
        <h2 class="text-5xl font-black font-serif text-[#6E3314] tracking-wide mb-2">
          Thank You!
        </h2>
        <p class="text-2xl font-serif italic text-[#E87722] mb-6">
          Any Questions / Suggestions?
        </p>

        <!-- Presenter Credits Box -->
        <div class="bg-[#FBF0EB] border border-[#F3D5C5] rounded-2xl p-5 max-w-2xl w-full shadow-sm">
          <p class="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
            Presented by Group No. 7 (2nd Year, B.Tech CSE)
          </p>
          <div class="grid grid-cols-2 gap-y-2 text-sm font-bold text-slate-800">
            <div>Pratibha Singh <span class="text-xs font-normal text-slate-500">(2501920100419)</span></div>
            <div>Pratiksha Singh <span class="text-xs font-normal text-slate-500">(2501920100422)</span></div>
            <div>Priyansh Kalra <span class="text-xs font-normal text-slate-500">(2501920100438)</span></div>
            <div>Priyam Tripathi <span class="text-xs font-normal text-slate-500">(2501920100437)</span></div>
          </div>
          <p class="text-xs font-semibold text-[#6E3314] mt-3 pt-2 border-t border-[#F3D5C5]/60">
            Supervisor: Mr. Abhijeet Gupta (Assistant Professor, Dept. of CSE)
          </p>
        </div>
      </div>

      <div class="px-8 py-2.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600 bg-white">
        <span class="italic font-serif text-[#6E3314]">Department of Computer Science & Engineering</span>
        <span class="font-bold">15</span>
      </div>
    </div>

  </div>

  <script>
    function showToast(msg) {
      const toast = document.getElementById('toast');
      if (toast) {
        toast.innerHTML = msg;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3500);
      }
    }

    // 1-Click Clean PDF Download
    async function downloadPresentationPDF() {
      showToast("⏳ <strong>Generating clean 16:9 Presentation PDF...</strong> Please wait!");
      const container = document.getElementById('slides-container');
      if (!container) return;

      const opt = {
        margin: 0,
        filename: 'SmartSplit_Mini_Project_Presentation_Group7.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: [297, 167], orientation: 'landscape' },
        pagebreak: { mode: ['css', 'legacy'], after: '.slide-canvas' }
      };

      try {
        await html2pdf().set(opt).from(container).save();
        showToast("🎉 <strong>Presentation PDF downloaded successfully!</strong>");
      } catch (e) {
        console.error(e);
        window.print();
      }
    }

    // Fullscreen toggle
    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => alert("Fullscreen error: " + err.message));
      } else {
        document.exitFullscreen();
      }
    }
  </script>
</body>
</html>
`;

fs.writeFileSync("./public/presentation.html", htmlContent);
fs.writeFileSync("./presentation.html", htmlContent);
console.log("Successfully created presentation.html in root and public directories!");
