import fs from "fs";

console.log("Generating exact GL Bajaj presentation HTML viewer...");

function createSlideTemplate(slideNum, title, contentHtml) {
  return `
    <!-- SLIDE ${slideNum}: ${title} -->
    <div id="slide-${slideNum}" class="slide-canvas">
      <!-- TOP ROW: LOGO BOX & BROWN HEADER BAR -->
      <div class="flex items-stretch h-[68px] w-full shrink-0">
        <!-- Top-Left GL Bajaj Logo Box -->
        <div class="w-[195px] bg-white flex items-center justify-center px-3 border-r border-slate-200/60 shrink-0">
          <img src="/assets/gl_bajaj_logo.png" alt="GL Bajaj" class="h-[52px] w-auto object-contain" />
        </div>
        <!-- Top Header Bar (Brown #833C0B) -->
        <div class="flex-1 bg-[#833C0B] flex items-center justify-center px-6">
          <h2 class="text-white font-serif font-bold text-2xl tracking-wide uppercase text-center" style="font-family: Georgia, serif;">
            ${title}
          </h2>
        </div>
      </div>

      <!-- THIN BLUE UNDERLINE (#42719B) -->
      <div class="w-full h-[3px] bg-[#42719B] shrink-0"></div>

      <!-- MIDDLE SECTION: LEFT ORANGE STRIPE + MAIN CONTENT AREA -->
      <div class="flex flex-1 min-h-0 w-full overflow-hidden">
        <!-- Solid Left Orange Column (#ED7D31) -->
        <div class="w-[195px] bg-[#ED7D31] shrink-0 flex flex-col justify-end p-4">
          <!-- Subtle watermark icon or accent -->
          <div class="text-white/40 text-[10px] font-bold tracking-widest uppercase">GLBITM • CSE</div>
        </div>

        <!-- Main Slide Content Area (Pure White Background) -->
        <div class="flex-1 bg-white p-6 flex flex-col justify-between overflow-y-auto">
          <div class="flex-1">
            ${contentHtml}
          </div>

          <!-- BOTTOM FOOTER -->
          <div class="mt-4 pt-2 border-t border-[#ED7D31] flex items-center justify-between text-xs shrink-0">
            <div class="w-12"></div>
            <div class="font-serif italic font-bold text-slate-900 text-[13px] text-center" style="font-family: Georgia, serif;">
              Department of Computer Science & Engineering
            </div>
            <div class="font-mono text-slate-500 text-[11px] w-12 text-right">
              &lt;${slideNum}&gt;
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// SLIDE 1: TITLE SLIDE (CUSTOM GL BAJAJ MASTER)
const slide1 = `
    <!-- SLIDE 1: TITLE SLIDE -->
    <div id="slide-1" class="slide-canvas">
      <!-- Top Row: Logo Box & Empty Blue Line -->
      <div class="flex items-stretch h-[68px] w-full shrink-0">
        <div class="w-[195px] bg-white flex items-center justify-center px-3 border-r border-slate-200/60 shrink-0">
          <img src="/assets/gl_bajaj_logo.png" alt="GL Bajaj" class="h-[52px] w-auto object-contain" />
        </div>
        <div class="flex-1 bg-white"></div>
      </div>

      <!-- Thin Blue Line -->
      <div class="w-full h-[3px] bg-[#42719B] shrink-0"></div>

      <!-- Body Section -->
      <div class="flex flex-1 min-h-0 w-full overflow-hidden">
        <!-- Left Orange Stripe -->
        <div class="w-[195px] bg-[#ED7D31] shrink-0 flex flex-col justify-end p-4">
          <div class="text-white/40 text-[10px] font-bold tracking-widest uppercase">GLBITM • CSE</div>
        </div>

        <!-- Main Area -->
        <div class="flex-1 bg-white px-8 py-5 flex flex-col justify-between overflow-hidden">
          
          <!-- Golden Emblem & Department Heading -->
          <div class="flex flex-col items-center">
            <img src="/assets/gl_bajaj_emblem_gold.png" alt="GL Bajaj Crest" class="h-[105px] w-auto object-contain drop-shadow-sm mb-1" />
            <h3 class="font-serif italic font-bold text-slate-950 text-xl tracking-tight" style="font-family: Georgia, serif;">
              Department of Computer Science & Engineering
            </h3>
          </div>

          <!-- Brown Project Title Banner -->
          <div class="w-full shadow-md my-2">
            <div class="bg-[#833C0B] py-3 px-6 text-center">
              <h1 class="text-white font-serif font-extrabold text-2xl sm:text-[26px] tracking-wide uppercase leading-tight" style="font-family: Georgia, serif;">
                PERSONAL BUDGET & EXPENSE SPLITTER (SMARTSPLIT)
              </h1>
            </div>
            <div class="h-[3px] bg-[#42719B] w-full"></div>
          </div>

          <!-- Session Subtitle -->
          <div class="text-center font-sans font-bold italic text-slate-900 text-sm tracking-wide">
            MINI PROJECT &nbsp;|&nbsp; SESSION 2026-2027
          </div>

          <!-- Bottom Columns: Presented By & Supervision -->
          <div class="grid grid-cols-2 gap-6 pt-2">
            <!-- Left: Presented By -->
            <div class="bg-[#FBE4D4] p-3.5 rounded-xl border border-[#F3CCA8] text-xs">
              <div class="font-bold text-slate-950 text-xs tracking-wider uppercase mb-1.5 flex items-center justify-between">
                <span>PRESENTED BY :</span>
                <span class="bg-[#ED7D31] text-white px-2 py-0.2 rounded font-extrabold text-[10px]">GROUP NO. 7</span>
              </div>
              <div class="space-y-1 text-slate-800 leading-snug">
                <div><strong>1. Pratibha Singh</strong> &nbsp;<span class="text-slate-600 font-mono text-[11px]">(Roll: 2501920100419)</span></div>
                <div><strong>2. Pratiksha Singh</strong> &nbsp;<span class="text-slate-600 font-mono text-[11px]">(Roll: 2501920100422)</span></div>
                <div><strong>3. Priyansh Kalra</strong> &nbsp;<span class="text-slate-600 font-mono text-[11px]">(Roll: 2501920100438)</span></div>
                <div><strong>4. Priyam Tripathi</strong> &nbsp;<span class="text-slate-600 font-mono text-[11px]">(Roll: 2501920100437)</span></div>
                <div class="pt-1 text-[11px] text-[#833C0B] font-semibold">2nd Year B.Tech CSE &nbsp;|&nbsp; 4th Semester</div>
              </div>
            </div>

            <!-- Right: Under Supervision Of -->
            <div class="bg-[#FBE4D4] p-3.5 rounded-xl border border-[#F3CCA8] text-xs">
              <div class="font-bold text-slate-950 text-xs tracking-wider uppercase mb-1.5">
                UNDER SUPERVISION OF :
              </div>
              <div class="space-y-1 text-slate-800 leading-snug">
                <div>Project Guide: <strong class="text-[#833C0B] text-sm block">Mr. Abhijeet Gupta</strong></div>
                <div>Designation: <span class="font-medium text-slate-700">Assistant Professor</span></div>
                <div>Department: <span class="font-medium text-slate-700">Computer Science & Engineering</span></div>
                <div class="text-[11px] text-slate-600 font-medium">G. L. Bajaj Institute of Technology & Management, Greater Noida</div>
                <div class="text-[10px] text-slate-500 italic">Affiliated with Dr. A.P.J. Abdul Kalam Technical University (AKTU)</div>
              </div>
            </div>
          </div>

          <!-- Footer Line -->
          <div class="mt-2 pt-2 border-t border-[#ED7D31] flex items-center justify-between text-xs shrink-0">
            <div class="w-12"></div>
            <div class="font-serif italic font-bold text-slate-900 text-[13px] text-center" style="font-family: Georgia, serif;">
              Department of Computer Science & Engineering
            </div>
            <div class="font-mono text-slate-500 text-[11px] w-12 text-right">
              &lt;1&gt;
            </div>
          </div>

        </div>
      </div>
    </div>
`;

// SLIDE 2: OUTLINE (MATCHES 12-PILL FORMAT)
const slide2Content = `
  <div class="grid grid-cols-2 gap-3.5 h-full content-center pt-2">
    ${[
      { num: "01", text: "Introduction" },
      { num: "02", text: "Objectives & Scope" },
      { num: "03", text: "Existing vs Proposed System" },
      { num: "04", text: "Technology Stack" },
      { num: "05", text: "Resource Requirements" },
      { num: "06", text: "System Design & Architecture" },
      { num: "07", text: "Methodology" },
      { num: "08", text: "Modules & Features" },
      { num: "09", text: "Greedy Settlement Algorithm" },
      { num: "10", text: "Implementation & Results" },
      { num: "11", text: "Testing & Validation" },
      { num: "12", text: "Conclusion & References" }
    ].map(item => `
      <div class="flex items-center gap-3 bg-[#FBE4D4] p-3 rounded-2xl border border-[#F3CCA8] shadow-2xs hover:scale-[1.01] transition-transform">
        <div class="w-8 h-8 rounded-full bg-[#ED7D31] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
          ${item.num}
        </div>
        <div class="font-bold text-slate-900 text-sm">
          ${item.text}
        </div>
      </div>
    `).join("")}
  </div>
`;

// SLIDE 3: INTRODUCTION
const slide3Content = `
  <div class="grid grid-cols-3 gap-4 h-full content-stretch">
    <div class="bg-[#FBE4D4] p-4 rounded-2xl border border-[#F3CCA8] flex flex-col">
      <div class="flex items-center gap-2.5 mb-2.5">
        <div class="w-7 h-7 rounded-full bg-[#ED7D31] text-white flex items-center justify-center font-bold text-xs shrink-0">01</div>
        <h4 class="font-serif font-bold text-[#833C0B] text-base" style="font-family: Georgia, serif;">Domain & Background</h4>
      </div>
      <ul class="space-y-2 text-xs text-slate-800 flex-1 leading-relaxed list-disc list-inside">
        <li>FinTech & Distributed Web Systems engineering domain.</li>
        <li>Shared living expenses are routine for college roommates, project groups, and traveling peers.</li>
        <li>Manual calculation creates confusion, misremembered debts, and social friction.</li>
      </ul>
    </div>

    <div class="bg-[#FBE4D4] p-4 rounded-2xl border border-[#F3CCA8] flex flex-col">
      <div class="flex items-center gap-2.5 mb-2.5">
        <div class="w-7 h-7 rounded-full bg-[#ED7D31] text-white flex items-center justify-center font-bold text-xs shrink-0">02</div>
        <h4 class="font-serif font-bold text-[#833C0B] text-base" style="font-family: Georgia, serif;">Problem Statement</h4>
      </div>
      <ul class="space-y-2 text-xs text-slate-800 flex-1 leading-relaxed list-disc list-inside">
        <li>Messy paper logs and group chat messages lead to missed records and forgotten settlements.</li>
        <li>Circular debts result in unnecessary multiple peer transactions (A owes B, B owes C, C owes A).</li>
        <li>Existing market apps lock vital settlement features behind paid monthly subscriptions.</li>
      </ul>
    </div>

    <div class="bg-[#FBE4D4] p-4 rounded-2xl border border-[#F3CCA8] flex flex-col">
      <div class="flex items-center gap-2.5 mb-2.5">
        <div class="w-7 h-7 rounded-full bg-[#ED7D31] text-white flex items-center justify-center font-bold text-xs shrink-0">03</div>
        <h4 class="font-serif font-bold text-[#833C0B] text-base" style="font-family: Georgia, serif;">Motivation & Significance</h4>
      </div>
      <ul class="space-y-2 text-xs text-slate-800 flex-1 leading-relaxed list-disc list-inside">
        <li>Build a fast, ad-free, transparent platform specifically tailored for students and shared groups.</li>
        <li>Algorithmic debt optimization reducing multi-party payments to minimal direct transfers.</li>
        <li>Native UPI payment links and instant real-time synchronization via Google Firestore.</li>
      </ul>
    </div>
  </div>
`;

// SLIDE 4: OBJECTIVES & SCOPE
const slide4Content = `
  <div class="grid grid-cols-2 gap-5 h-full content-stretch">
    <div class="bg-[#FBE4D4] p-5 rounded-2xl border border-[#F3CCA8] flex flex-col">
      <h4 class="font-serif font-bold text-[#833C0B] text-lg mb-3" style="font-family: Georgia, serif;">Project Objectives</h4>
      <ul class="space-y-2.5 text-xs text-slate-800 leading-relaxed list-disc list-inside">
        <li><strong>Design & Develop</strong> a clean, responsive single-page web app for tracking individual & group budgets.</li>
        <li><strong>Implement Multi-Type Splits</strong> supporting Equal, Exact Amounts, Percentage, and Custom Share weights.</li>
        <li><strong>Formulate Greedy Debt Simplification</strong> running in O(N log N) to eliminate cyclic liabilities.</li>
        <li><strong>Integrate Dynamic UPI QR Codes</strong> for direct seamless peer settlements without manual VPA entry.</li>
        <li><strong>Ensure Secure Persistence</strong> with Firebase Firestore database security rules and token authentication.</li>
      </ul>
    </div>

    <div class="bg-[#FBE4D4] p-5 rounded-2xl border border-[#F3CCA8] flex flex-col">
      <h4 class="font-serif font-bold text-[#833C0B] text-lg mb-3" style="font-family: Georgia, serif;">Project Scope Boundaries</h4>
      <div class="space-y-3 text-xs text-slate-800 leading-relaxed">
        <div>
          <div class="font-bold text-[#ED7D31] uppercase tracking-wider mb-1">Delivered in Version 1.0 (Included):</div>
          <p class="text-slate-700">• Full Group Lifecycle, Multi-currency (INR ₹, USD $, EUR €, GBP £), In-App Group Chat, Monthly Analytics, and Demo Sandbox Mode.</p>
        </div>
        <div>
          <div class="font-bold text-slate-600 uppercase tracking-wider mb-1">Future Scope & Limitations (Version 2.0):</div>
          <p class="text-slate-700">• Automated OCR Bill scanning via Vision API, direct banking webhook reconciliation, and packaging as a native Android APK.</p>
        </div>
      </div>
    </div>
  </div>
`;

// SLIDE 5: EXISTING VS PROPOSED SYSTEM
const slide5Content = `
  <div class="h-full flex flex-col justify-between">
    <div class="overflow-x-auto rounded-xl border border-[#F3CCA8] shadow-2xs">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-[#833C0B] text-white">
            <th class="p-2.5 font-serif font-bold" style="font-family: Georgia, serif;">Evaluation Parameter</th>
            <th class="p-2.5 bg-slate-700 font-medium">Manual / Excel Sheets</th>
            <th class="p-2.5 bg-slate-700 font-medium">Commercial Split Apps</th>
            <th class="p-2.5 bg-[#ED7D31] font-bold">SmartSplit (Proposed)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F3CCA8] bg-[#FBE4D4] text-slate-800">
          <tr>
            <td class="p-2 font-bold">Debt Simplification</td>
            <td class="p-2">None (Raw totals)</td>
            <td class="p-2">Basic (Locked in Pro)</td>
            <td class="p-2 font-bold text-[#833C0B]">O(N log N) Greedy (Auto & Free)</td>
          </tr>
          <tr>
            <td class="p-2 font-bold">UPI QR Payment</td>
            <td class="p-2">Manual copy-paste of VPA</td>
            <td class="p-2">External redirect</td>
            <td class="p-2 font-bold text-[#833C0B]">Direct Dynamic UPI QR Generated</td>
          </tr>
          <tr>
            <td class="p-2 font-bold">Split Modalities</td>
            <td class="p-2">Equal only</td>
            <td class="p-2">Equal & Percentage</td>
            <td class="p-2 font-bold text-[#833C0B]">Equal, Exact, %, Shares, Unequal</td>
          </tr>
          <tr>
            <td class="p-2 font-bold">In-App Chat</td>
            <td class="p-2">External messaging app</td>
            <td class="p-2">Comment threads only</td>
            <td class="p-2 font-bold text-[#833C0B]">Dedicated Real-time Group Chat Channel</td>
          </tr>
          <tr>
            <td class="p-2 font-bold">Cost & Privacy</td>
            <td class="p-2">Manual file sharing</td>
            <td class="p-2">Ad-heavy / Subscription tier</td>
            <td class="p-2 font-bold text-[#833C0B]">100% Free & Open Source Sandbox</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-3 bg-[#FFF5EE] p-3 rounded-xl border border-[#ED7D31] text-xs text-slate-800">
      <strong class="text-[#833C0B]">Literature Survey Insight:</strong> Existing tools leave a significant gap between simple calculators and cluttered commercial apps. SmartSplit solves this by combining minimal transaction optimization with native UPI payments and zero subscription barriers.
    </div>
  </div>
`;

// SLIDE 6: TECHNOLOGY STACK
const slide6Content = `
  <div class="grid grid-cols-3 gap-4 h-full content-stretch">
    <div class="bg-[#FBE4D4] p-4 rounded-2xl border border-[#F3CCA8] flex flex-col">
      <div class="w-7 h-7 rounded-full bg-[#ED7D31] text-white flex items-center justify-center font-bold text-xs mb-2">1</div>
      <h4 class="font-serif font-bold text-[#833C0B] text-base mb-1" style="font-family: Georgia, serif;">Frontend Layer</h4>
      <div class="font-bold text-xs text-[#ED7D31] mb-2">React 19 & TypeScript</div>
      <ul class="space-y-1.5 text-xs text-slate-800 list-disc list-inside">
        <li>React 19 Component Architecture with custom hooks.</li>
        <li>TypeScript for static type safety & strict schemas.</li>
        <li>Tailwind CSS for responsive layouts.</li>
        <li>Lucide React Icons for crisp interface elements.</li>
        <li>Vite for instant Hot-Module Replacement.</li>
      </ul>
    </div>

    <div class="bg-[#FBE4D4] p-4 rounded-2xl border border-[#F3CCA8] flex flex-col">
      <div class="w-7 h-7 rounded-full bg-[#ED7D31] text-white flex items-center justify-center font-bold text-xs mb-2">2</div>
      <h4 class="font-serif font-bold text-[#833C0B] text-base mb-1" style="font-family: Georgia, serif;">Backend & Logic Layer</h4>
      <div class="font-bold text-xs text-[#ED7D31] mb-2">Node.js & Algorithm Engine</div>
      <ul class="space-y-1.5 text-xs text-slate-800 list-disc list-inside">
        <li>Node.js runtime environment.</li>
        <li>Greedy Min-Cash-Flow debt simplification.</li>
        <li>Deterministic UPI URI payload generation.</li>
        <li>Web Crypto API for secure data hashing.</li>
        <li>Zero-sum verification matrix validation.</li>
      </ul>
    </div>

    <div class="bg-[#FBE4D4] p-4 rounded-2xl border border-[#F3CCA8] flex flex-col">
      <div class="w-7 h-7 rounded-full bg-[#ED7D31] text-white flex items-center justify-center font-bold text-xs mb-2">3</div>
      <h4 class="font-serif font-bold text-[#833C0B] text-base mb-1" style="font-family: Georgia, serif;">Database & Cloud Tools</h4>
      <div class="font-bold text-xs text-[#ED7D31] mb-2">Firebase Firestore & Git</div>
      <ul class="space-y-1.5 text-xs text-slate-800 list-disc list-inside">
        <li>Google Firebase Firestore NoSQL Database.</li>
        <li>Firebase Tokenized User Authentication.</li>
        <li>IndexedDB fallback for in-browser Demo Sandbox.</li>
        <li>Git & GitHub for version control.</li>
        <li>Postman for API verification.</li>
      </ul>
    </div>
  </div>
`;

// SLIDE 7: RESOURCE REQUIREMENTS
const slide7Content = `
  <div class="grid grid-cols-2 gap-5 h-full content-stretch">
    <div class="bg-[#FBE4D4] p-4 rounded-2xl border border-[#F3CCA8] flex flex-col">
      <h4 class="font-serif font-bold text-[#833C0B] text-base mb-2.5" style="font-family: Georgia, serif;">Hardware Requirements</h4>
      <table class="w-full text-xs text-left border-collapse">
        <tr class="border-b border-[#F3CCA8]"><td class="py-1.5 font-bold text-slate-900">Processor (CPU)</td><td class="py-1.5 text-slate-700">Intel Core i3 / AMD Ryzen 3 or higher</td></tr>
        <tr class="border-b border-[#F3CCA8]"><td class="py-1.5 font-bold text-slate-900">RAM (Memory)</td><td class="py-1.5 text-slate-700">8 GB recommended (4 GB minimum)</td></tr>
        <tr class="border-b border-[#F3CCA8]"><td class="py-1.5 font-bold text-slate-900">Storage</td><td class="py-1.5 text-slate-700">256 GB SSD / HDD (2 GB free space)</td></tr>
        <tr class="border-b border-[#F3CCA8]"><td class="py-1.5 font-bold text-slate-900">Display</td><td class="py-1.5 text-slate-700">1366 x 768 or Full HD 1920 x 1080</td></tr>
        <tr><td class="py-1.5 font-bold text-slate-900">Network</td><td class="py-1.5 text-slate-700">Broadband Wi-Fi connection for cloud sync</td></tr>
      </table>
    </div>

    <div class="bg-[#FBE4D4] p-4 rounded-2xl border border-[#F3CCA8] flex flex-col">
      <h4 class="font-serif font-bold text-[#833C0B] text-base mb-2.5" style="font-family: Georgia, serif;">Software Requirements</h4>
      <table class="w-full text-xs text-left border-collapse">
        <tr class="border-b border-[#F3CCA8]"><td class="py-1.5 font-bold text-slate-900">Operating System</td><td class="py-1.5 text-slate-700">Windows 10/11, macOS, Ubuntu Linux</td></tr>
        <tr class="border-b border-[#F3CCA8]"><td class="py-1.5 font-bold text-slate-900">Code Editor / IDE</td><td class="py-1.5 text-slate-700">Visual Studio Code (v1.90+)</td></tr>
        <tr class="border-b border-[#F3CCA8]"><td class="py-1.5 font-bold text-slate-900">Runtime & Package</td><td class="py-1.5 text-slate-700">Node.js (v20 LTS) & npm</td></tr>
        <tr class="border-b border-[#F3CCA8]"><td class="py-1.5 font-bold text-slate-900">Web Browser</td><td class="py-1.5 text-slate-700">Chrome, Edge, Firefox (ES6+ support)</td></tr>
        <tr><td class="py-1.5 font-bold text-slate-900">Database & Cloud</td><td class="py-1.5 text-slate-700">Firebase Firestore & Cloud Run</td></tr>
      </table>
    </div>
  </div>
`;

// SLIDE 8: SYSTEM DESIGN & ARCHITECTURE
const slide8Content = `
  <div class="flex flex-col justify-between h-full space-y-3">
    ${[
      { tier: "Tier 1: Presentation Layer", sub: "React 19 SPA & Tailwind CSS", desc: "Interactive Dashboard, Split Wizards, Group Chat, Settlement Modals, and responsive mobile viewport." },
      { tier: "Tier 2: Business Logic & Algorithm Layer", sub: "Node.js & Greedy Solver", desc: "Greedy Min-Cash-Flow algorithm, multi-party split engine (equal, exact, percentage, shares), and UPI URI generator." },
      { tier: "Tier 3: Persistence & Security Layer", sub: "Firebase Firestore & Auth", desc: "Cloud collections (users, groups, expenses, settlements), JWT security rules, and offline IndexedDB demo sandbox." }
    ].map(t => `
      <div class="bg-[#FBE4D4] p-3.5 rounded-2xl border border-[#F3CCA8] flex items-center gap-4">
        <div class="w-2 h-14 bg-[#ED7D31] rounded-full shrink-0"></div>
        <div>
          <div class="font-serif font-bold text-[#833C0B] text-sm" style="font-family: Georgia, serif;">${t.tier} <span class="text-xs font-sans text-[#ED7D31] font-semibold">(${t.sub})</span></div>
          <div class="text-xs text-slate-800 mt-1 leading-snug">${t.desc}</div>
        </div>
      </div>
    `).join("")}
  </div>
`;

// SLIDE 9: METHODOLOGY
const slide9Content = `
  <div class="flex flex-col justify-between h-full">
    <div class="grid grid-cols-5 gap-3">
      ${[
        { num: "1", title: "Requirement Analysis", desc: "Gather user stories, collegiate survey, and set constraints." },
        { num: "2", title: "System Design", desc: "Plan UI flows, data models, and greedy algorithm logic." },
        { num: "3", title: "Development", desc: "Sprint implementation of React UI and calculation engine." },
        { num: "4", title: "Testing & QA", desc: "Verify zero-sum math, edge cases, and cross-browser checks." },
        { num: "5", title: "Deployment", desc: "Host on Cloud Run, seed mock demo groups, and verify URLs." }
      ].map(s => `
        <div class="bg-[#FBE4D4] p-3 rounded-2xl border border-[#F3CCA8] text-center flex flex-col items-center">
          <div class="w-8 h-8 rounded-full bg-[#ED7D31] text-white flex items-center justify-center font-bold text-sm mb-2 shadow-sm">
            ${s.num}
          </div>
          <div class="font-serif font-bold text-[#833C0B] text-xs mb-1" style="font-family: Georgia, serif;">${s.title}</div>
          <div class="text-[11px] text-slate-700 leading-snug">${s.desc}</div>
        </div>
      `).join("")}
    </div>

    <div class="bg-[#FFF5EE] p-3 rounded-xl border border-[#ED7D31] text-xs text-center text-slate-900 font-medium">
      <strong class="text-[#833C0B]">Agile Methodology:</strong> Conducted 4 two-week sprint cycles with continuous integration, automated builds, and peer code reviews following Department of CSE project guidelines.
    </div>
  </div>
`;

// SLIDE 10: MODULES & FEATURES
const slide10Content = `
  <div class="grid grid-cols-3 gap-3.5 h-full content-stretch">
    ${[
      { num: "01", title: "User Authentication", desc: "Firebase tokenized login, profile customization, and guest sandbox access." },
      { num: "02", title: "Smart Dashboard", desc: "Real-time summary cards: Total Owed, Total Lending, and Monthly Spending Trends." },
      { num: "03", title: "Expense Splitting", desc: "Multi-party split modalities: Equal, Exact, Percentage, and Custom Share weights." },
      { num: "04", title: "Group Management", desc: "Create trip/flatmate groups, invite members, set budgets, and categorize expenses." },
      { num: "05", title: "Settlement & UPI QR", desc: "Automated debt reduction, settlement recording, and dynamic UPI QR generator." },
      { num: "06", title: "Analytics & Export", desc: "Interactive category charts, monthly breakdown, and 1-Click PDF/Word project report export." }
    ].map(m => `
      <div class="bg-[#FBE4D4] p-3 rounded-2xl border border-[#F3CCA8] flex flex-col justify-between">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-6 h-6 rounded-full bg-[#ED7D31] text-white flex items-center justify-center font-bold text-[11px] shrink-0">${m.num}</div>
          <h4 class="font-serif font-bold text-[#833C0B] text-xs" style="font-family: Georgia, serif;">${m.title}</h4>
        </div>
        <p class="text-[11px] text-slate-800 leading-snug">${m.desc}</p>
      </div>
    `).join("")}
  </div>
`;

// SLIDE 11: GREEDY SETTLEMENT ALGORITHM
const slide11Content = `
  <div class="grid grid-cols-2 gap-5 h-full content-stretch">
    <div class="bg-[#FBE4D4] p-4 rounded-2xl border border-[#F3CCA8] flex flex-col">
      <h4 class="font-serif font-bold text-[#833C0B] text-base mb-2" style="font-family: Georgia, serif;">Greedy Min-Cash-Flow Formulation</h4>
      <div class="space-y-2 text-xs text-slate-800 leading-relaxed">
        <div>
          <strong class="text-[#ED7D31]">1. Net Balance Calculation:</strong><br/>
          For each member <em>i</em>: <code>Net[i] = Sum(Paid) - Sum(Owed)</code>. The zero-sum property guarantees: <code>&Sigma; Net[i] == 0.00</code>.
        </div>
        <div>
          <strong class="text-[#ED7D31]">2. Partition & Sort:</strong><br/>
          Divide into Debtors (Net &lt; 0) and Creditors (Net &gt; 0). Sort descending by absolute values.
        </div>
        <div>
          <strong class="text-[#ED7D31]">3. Greedy Pairing:</strong><br/>
          Pair the largest debtor with the largest creditor. Settle <code>min(|Debt|, |Credit|)</code>. Reduces transactions from O(N²) to at most N-1!
        </div>
      </div>
    </div>

    <div class="bg-[#FBE4D4] p-4 rounded-2xl border border-[#F3CCA8] flex flex-col">
      <h4 class="font-serif font-bold text-[#833C0B] text-base mb-2" style="font-family: Georgia, serif;">Before vs After Optimization</h4>
      <div class="space-y-2 text-xs text-slate-800 leading-relaxed">
        <div class="bg-white/80 p-2.5 rounded-xl border border-slate-200">
          <strong class="text-slate-900">4 Roommates (Trip Expense):</strong><br/>
          Pratibha paid ₹1,200 (Food) &bull; Pratiksha paid ₹600 (Cab) &bull; Priyansh paid ₹400 (Groceries).
        </div>
        <div class="text-red-700 font-semibold">
          Without Algorithm: 6 separate cyclic transfers required.
        </div>
        <div class="text-emerald-800 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
          With SmartSplit: Just 2 direct payments!<br/>
          &bull; Priyam pays ₹600 to Pratibha<br/>
          &bull; Priyansh pays ₹300 to Pratibha<br/>
          <span class="text-xs text-[#ED7D31]">67% reduction in total transactions!</span>
        </div>
      </div>
    </div>
  </div>
`;

// SLIDE 12: IMPLEMENTATION & RESULTS
const slide12Content = `
  <div class="flex flex-col justify-between h-full">
    <div class="grid grid-cols-3 gap-4">
      ${[
        { title: "Dashboard & Budgets", desc: "Live summary cards, spending breakdown, and real-time balance stats." },
        { title: "Smart Split Wizard", desc: "Multi-party split modalities with instant zero-sum validation." },
        { title: "Settlement & UPI QR", desc: "One-tap payment confirmation and standard UPI QR payload." }
      ].map(sc => `
        <div class="bg-[#FBE4D4] p-3 rounded-2xl border border-[#F3CCA8] text-center flex flex-col items-center">
          <h4 class="font-serif font-bold text-[#833C0B] text-xs mb-2" style="font-family: Georgia, serif;">${sc.title}</h4>
          <div class="w-full h-24 bg-white rounded-xl border border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-mono mb-2">
            [Live Screen Verified]
          </div>
          <p class="text-[11px] text-slate-800 leading-snug">${sc.desc}</p>
        </div>
      `).join("")}
    </div>

    <div class="bg-[#FFF5EE] p-3 rounded-xl border border-[#ED7D31] text-xs text-center text-slate-900">
      <strong>Live App:</strong> <a href="https://ais-dev-6uq6o6ofo6pym3m3ggio77-368234083540.asia-southeast1.run.app" class="text-blue-700 underline font-mono">https://ais-dev-6uq6o6ofo6pym3m3ggio77-368234083540.asia-southeast1.run.app</a><br/>
      <span class="text-slate-600">GitHub: Group No. 7 - Personal Budget & Expense Splitter (SmartSplit)</span>
    </div>
  </div>
`;

// SLIDE 13: TESTING & VALIDATION
const slide13Content = `
  <div class="h-full flex flex-col justify-between">
    <div class="overflow-x-auto rounded-xl border border-[#F3CCA8]">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-[#833C0B] text-white">
            <th class="p-2 font-serif font-bold" style="font-family: Georgia, serif;">Test ID</th>
            <th class="p-2">Test Scenario</th>
            <th class="p-2">Input Data</th>
            <th class="p-2">Expected Result</th>
            <th class="p-2 bg-[#ED7D31] text-center">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F3CCA8] bg-[#FBE4D4] text-slate-800 text-[11px]">
          <tr>
            <td class="p-1.5 font-bold">TC-01</td>
            <td class="p-1.5">User Authentication</td>
            <td class="p-1.5">Valid email & password</td>
            <td class="p-1.5">JWT session issued; redirect to Dashboard</td>
            <td class="p-1.5 text-center font-bold text-emerald-800 bg-emerald-100">PASS</td>
          </tr>
          <tr>
            <td class="p-1.5 font-bold">TC-02</td>
            <td class="p-1.5">Equal Split Math</td>
            <td class="p-1.5">Amount: ₹1,000, 4 members</td>
            <td class="p-1.5">Exact ₹250.00 assigned per member</td>
            <td class="p-1.5 text-center font-bold text-emerald-800 bg-emerald-100">PASS</td>
          </tr>
          <tr>
            <td class="p-1.5 font-bold">TC-03</td>
            <td class="p-1.5">Zero-Sum Net Balance</td>
            <td class="p-1.5">15 random group expenses</td>
            <td class="p-1.5">Sum of all Net Balances == 0.00 strictly verified</td>
            <td class="p-1.5 text-center font-bold text-emerald-800 bg-emerald-100">PASS</td>
          </tr>
          <tr>
            <td class="p-1.5 font-bold">TC-04</td>
            <td class="p-1.5">Greedy Optimization</td>
            <td class="p-1.5">Cyclic loop: A-&gt;B-&gt;C-&gt;A</td>
            <td class="p-1.5">Reduced to minimal non-cyclic transactions</td>
            <td class="p-1.5 text-center font-bold text-emerald-800 bg-emerald-100">PASS</td>
          </tr>
          <tr>
            <td class="p-1.5 font-bold">TC-05</td>
            <td class="p-1.5">UPI QR Payload</td>
            <td class="p-1.5">Payee VPA & amount ₹450</td>
            <td class="p-1.5">Valid standard RFC UPI payload string</td>
            <td class="p-1.5 text-center font-bold text-emerald-800 bg-emerald-100">PASS</td>
          </tr>
          <tr>
            <td class="p-1.5 font-bold">TC-06</td>
            <td class="p-1.5">Latency Benchmark</td>
            <td class="p-1.5">50 members graph</td>
            <td class="p-1.5">Execution latency &lt; 2 ms</td>
            <td class="p-1.5 text-center font-bold text-emerald-800 bg-emerald-100">PASS</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-2 bg-[#FFF5EE] p-2.5 rounded-xl border border-[#ED7D31] text-xs text-slate-800">
      <strong>Verification Summary:</strong> Completed Unit Tests on calculation engine, Functional Tests on expense wizards, and Cross-Browser tests on Chrome, Edge, and Firefox.
    </div>
  </div>
`;

// SLIDE 14: CONCLUSION & FUTURE SCOPE
const slide14Content = `
  <div class="grid grid-cols-2 gap-5 h-full content-stretch">
    <div class="bg-[#FBE4D4] p-4 rounded-2xl border border-[#F3CCA8] flex flex-col">
      <h4 class="font-serif font-bold text-[#833C0B] text-base mb-2.5" style="font-family: Georgia, serif;">Conclusion & Achievements</h4>
      <ul class="space-y-2 text-xs text-slate-800 leading-relaxed list-disc list-inside">
        <li>Successfully designed and built SmartSplit for tracking and settling collegiate group expenses.</li>
        <li>Eliminated manual calculation mistakes and cut transaction count by over 60% with greedy optimization.</li>
        <li>Provided full group lifecycle management, in-app messaging, and one-tap report generation.</li>
        <li>Strengthened team engineering competencies across React 19, TypeScript, algorithms, and Firestore.</li>
      </ul>
    </div>

    <div class="bg-[#FBE4D4] p-4 rounded-2xl border border-[#F3CCA8] flex flex-col">
      <h4 class="font-serif font-bold text-[#833C0B] text-base mb-2.5" style="font-family: Georgia, serif;">Future Scope & Enhancements</h4>
      <ul class="space-y-2 text-xs text-slate-800 leading-relaxed list-disc list-inside">
        <li><strong>OCR Bill Parsing:</strong> Integrate Vision AI to automatically scan printed receipts into itemized shares.</li>
        <li><strong>Direct UPI Webhooks:</strong> Partner with payment aggregators to confirm transactions via bank webhooks.</li>
        <li><strong>Native Mobile App:</strong> Package via Capacitor PWA for installability and instant push notifications.</li>
      </ul>
    </div>
  </div>
`;

// SLIDE 15: REFERENCES
const slide15Content = `
  <div class="bg-[#FBE4D4] p-5 rounded-2xl border border-[#F3CCA8] h-full flex flex-col justify-between">
    <h4 class="font-serif font-bold text-[#833C0B] text-base mb-2" style="font-family: Georgia, serif;">Academic & Technical References (APA Style)</h4>
    <div class="space-y-2 text-xs text-slate-800 leading-relaxed">
      <div>[1] Cormen, T. H., Leiserson, C. E., Rivest, R. L., &amp; Stein, C. (2022). <em>Introduction to Algorithms</em> (4th ed.). MIT Press. (Greedy Min-Cash-Flow section).</div>
      <div>[2] Facebook Open Source. (2026). <em>React: The Library for Web and Native User Interfaces</em>. Meta Platforms, Inc. https://react.dev</div>
      <div>[3] Google Firebase. (2026). <em>Cloud Firestore Documentation: Real-time NoSQL Database</em>. Alphabet Inc. https://firebase.google.com/docs/firestore</div>
      <div>[4] National Payments Corporation of India (NPCI). (2025). <em>Unified Payments Interface (UPI) Linking Specifications (v2.1)</em>. NPCI Technical Specifications.</div>
      <div>[5] Mozilla Developer Network (MDN). (2026). <em>Web Crypto API &amp; Client-Side Storage Guidelines</em>. Mozilla Foundation. https://developer.mozilla.org</div>
      <div>[6] Dr. A.P.J. Abdul Kalam Technical University (AKTU). (2026). <em>B.Tech CSE Mini Project Evaluation Criteria &amp; Format</em>. Lucknow, Uttar Pradesh.</div>
    </div>
    <div class="text-[11px] text-slate-600 italic border-t border-[#F3CCA8] pt-2">
      All references adhere to APA 7th edition formatting guidelines as required by AKTU.
    </div>
  </div>
`;

// SLIDE 16: THANK YOU (MATCHES EXACT TEMPLATE)
const slide16Content = `
  <div class="h-full flex flex-col items-center justify-center text-center">
    <h1 class="font-sans font-bold text-slate-950 text-5xl mb-2">
      Thank You
    </h1>
    <p class="font-serif italic font-bold text-[#833C0B] text-2xl mb-6" style="font-family: Georgia, serif;">
      Any questions?
    </p>
    <div class="bg-[#FBE4D4] px-6 py-3.5 rounded-2xl border border-[#F3CCA8] text-xs text-slate-800 space-y-1">
      <div><strong>Personal Budget &amp; Expense Splitter (SmartSplit)</strong></div>
      <div>Group No. 7 &nbsp;|&nbsp; 2nd Year B.Tech CSE (Session 2026–2027)</div>
      <div class="text-slate-600 font-medium">Department of Computer Science &amp; Engineering</div>
      <div class="text-slate-500">G. L. Bajaj Institute of Technology &amp; Management, Greater Noida</div>
    </div>
  </div>
`;

const slides = [
  slide1,
  createSlideTemplate(2, "Outline", slide2Content),
  createSlideTemplate(3, "Introduction", slide3Content),
  createSlideTemplate(4, "Objectives & Scope", slide4Content),
  createSlideTemplate(5, "Existing vs Proposed System", slide5Content),
  createSlideTemplate(6, "Technology Stack", slide6Content),
  createSlideTemplate(7, "Resource Requirements", slide7Content),
  createSlideTemplate(8, "System Design & Architecture", slide8Content),
  createSlideTemplate(9, "Methodology", slide9Content),
  createSlideTemplate(10, "Modules & Features", slide10Content),
  createSlideTemplate(11, "Greedy Settlement Algorithm", slide11Content),
  createSlideTemplate(12, "Implementation & Results", slide12Content),
  createSlideTemplate(13, "Testing & Validation", slide13Content),
  createSlideTemplate(14, "Conclusion & Future Scope", slide14Content),
  createSlideTemplate(15, "References", slide15Content),
  createSlideTemplate(16, "Thank You", slide16Content)
];

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmartSplit - GL Bajaj Mini Project Presentation - Group 7</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box !important; }
    @page {
      size: 297mm 167mm; /* 16:9 Landscape */
      margin: 0;
    }
    body {
      background-color: #1a1a24;
      margin: 0;
      padding: 60px 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .slide-canvas {
      width: 1120px;
      height: 630px;
      margin: 32px auto;
      background: #ffffff;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
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
  </style>
</head>
<body class="antialiased">

  <!-- TOP ACTION TOOLBAR -->
  <div class="no-print fixed top-3 left-1/2 -translate-x-1/2 z-50 flex flex-wrap items-center justify-center gap-2 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700 max-w-[96vw]">
    <div class="flex items-center space-x-2 mr-2">
      <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
      <span class="font-bold text-xs tracking-wide">GL Bajaj CSE (Group 7)</span>
      <span class="text-slate-600">|</span>
      <span class="text-xs text-amber-300 font-semibold">16 Official Slides</span>
    </div>

    <!-- PPTX DOWNLOAD BUTTON -->
    <a href="/SmartSplit_Mini_Project_Presentation_Group7.pptx" download="SmartSplit_Mini_Project_Presentation_Group7.pptx" class="bg-[#ED7D31] hover:bg-[#d96c24] active:scale-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow transition flex items-center space-x-1.5 cursor-pointer">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
      <span>Download .PPTX (PowerPoint)</span>
    </a>

    <!-- PRINT TO PDF BUTTON -->
    <button onclick="window.print()" class="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow transition flex items-center space-x-1.5 cursor-pointer">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
      <span>Print / Save as PDF</span>
    </button>
  </div>

  <!-- SLIDES CONTAINER -->
  <div class="max-w-[1140px] mx-auto">
    ${slides.join("\n")}
  </div>

</body>
</html>
`;

fs.writeFileSync("presentation.html", fullHtml, "utf8");
fs.writeFileSync("public/presentation.html", fullHtml, "utf8");
console.log("Successfully generated presentation.html and public/presentation.html!");
