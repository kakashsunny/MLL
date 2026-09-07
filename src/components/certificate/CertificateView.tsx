import React, { useState, useRef } from 'react';
import { UserProgress, ViewMode } from '../../types';
import { getStoredProfile } from '../../services/storageService';
import { 
  Award, 
  Printer, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft, 
  Copy, 
  Check, 
  ShieldCheck, 
  ExternalLink,
  BookOpen,
  Share2,
  Lock,
  Unlock,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CertificateViewProps {
  userProgress: UserProgress;
  onSelectView?: (view: ViewMode) => void;
  onUpdateXP?: (amount: number) => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  userProgress,
  onSelectView,
  onUpdateXP
}) => {
  const profile = getStoredProfile();
  
  // Customization State
  const [recipientName, setRecipientName] = useState(profile.name || 'ML Practitioner');
  const [specialization, setSpecialization] = useState('Machine Learning & First-Principles Engineering');
  const [credentialId] = useState(() => `NF-2026-ML-${Math.floor(1000 + Math.random() * 9000)}`);
  const [issueDate, setIssueDate] = useState(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  });

  // Fast-track demo unlock toggle so user can test and export immediately
  const [demoUnlocked, setDemoUnlocked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);

  const certRef = useRef<HTMLDivElement>(null);

  // Completion calculation
  const completedQuizzesCount = userProgress.completedQuizzes?.length || 0;
  const completedLessonsCount = userProgress.completedLessons?.length || 0;
  const completedChallengesCount = userProgress.completedChallenges?.length || 0;
  
  // Requirements: at least 1 challenge or quiz or lesson, or demoUnlocked
  const isEligible = demoUnlocked || completedQuizzesCount >= 1 || completedLessonsCount >= 3 || completedChallengesCount >= 1 || (userProgress.xp || 0) >= 500;
  const isFullyHonored = demoUnlocked || (completedLessonsCount >= 5 && completedQuizzesCount >= 3);

  // Handle Printable PDF
  const handlePrint = () => {
    window.print();
  };

  // Handle High-DPI PNG Canvas Generation
  const handleDownloadPng = async () => {
    setIsExportingPng(true);
    try {
      const width = 2400;
      const height = 1600;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Background Parchment Fill
      ctx.fillStyle = '#FAF8F2';
      ctx.fillRect(0, 0, width, height);

      // Subtle textured border
      ctx.fillStyle = '#F3EFE6';
      ctx.fillRect(40, 40, width - 80, height - 80);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(70, 70, width - 140, height - 140);

      // 2. Outer Neo-Brutalist Frame
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 12;
      ctx.strokeRect(80, 80, width - 160, height - 160);

      // Inner Accent Frame
      ctx.strokeStyle = '#1A42D9';
      ctx.lineWidth = 4;
      ctx.strokeRect(104, 104, width - 208, height - 208);

      // Thin hairline frame
      ctx.strokeStyle = '#E0DCCF';
      ctx.lineWidth = 2;
      ctx.strokeRect(120, 120, width - 240, height - 240);

      // Corner Corner Rosettes / Marks
      const drawCornerBracket = (x: number, y: number, angle: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-30, 0);
        ctx.lineTo(30, 0);
        ctx.moveTo(0, -30);
        ctx.lineTo(0, 30);
        ctx.stroke();
        ctx.restore();
      };
      drawCornerBracket(104, 104, 0);
      drawCornerBracket(width - 104, 104, 0);
      drawCornerBracket(104, height - 104, 0);
      drawCornerBracket(width - 104, height - 104, 0);

      // 3. Institution Header
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1A42D9';
      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.fillText('NEURAFORGE RESEARCH INSTITUTE OF MACHINE LEARNING', width / 2, 230);

      ctx.fillStyle = '#666666';
      ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('DEPARTMENT OF FIRST-PRINCIPLES ARTIFICIAL INTELLIGENCE & EMPIRICAL SYSTEMS', width / 2, 275);

      // Horizontal Divider
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 350, 315);
      ctx.lineTo(width / 2 + 350, 315);
      ctx.stroke();

      // Small Emblem Diamond in Divider
      ctx.fillStyle = '#1A42D9';
      ctx.beginPath();
      ctx.arc(width / 2, 315, 8, 0, Math.PI * 2);
      ctx.fill();

      // 4. Certificate Title
      ctx.fillStyle = '#111111';
      ctx.font = '900 78px "Newsreader", serif';
      ctx.fillText('CERTIFICATE OF MASTERY', width / 2, 430);

      ctx.fillStyle = '#444444';
      ctx.font = 'italic 32px "Newsreader", serif';
      ctx.fillText('This official credential affirms that', width / 2, 510);

      // 5. Recipient Name
      ctx.fillStyle = '#111111';
      ctx.font = 'bold 96px "Newsreader", serif';
      ctx.fillText(recipientName.toUpperCase(), width / 2, 635);

      // Underline under Name
      ctx.strokeStyle = '#1A42D9';
      ctx.lineWidth = 4;
      const nameWidth = ctx.measureText(recipientName.toUpperCase()).width;
      ctx.beginPath();
      ctx.moveTo(width / 2 - nameWidth / 2 - 40, 665);
      ctx.lineTo(width / 2 + nameWidth / 2 + 40, 665);
      ctx.stroke();

      // 6. Citation Statement
      ctx.fillStyle = '#333333';
      ctx.font = '400 30px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('has successfully demonstrated empirical execution and theoretical rigor in the discipline of', width / 2, 735);

      ctx.fillStyle = '#1A42D9';
      ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(specialization, width / 2, 805);

      ctx.fillStyle = '#555555';
      ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Formulating closed-form solutions, loss function curvature, backpropagation dynamics, and production pipelines.', width / 2, 855);

      // 7. Five Core Competencies Grid
      const competencies = [
        'Ordinary Least Squares & Normal Equations',
        'Stochastic Gradient Descent & Convexity',
        'Voronoi Tessellation & Distance Metrics',
        'Recursive Gini Partitioning & Trees',
        'Tensor Calculus & Backprop Optimization'
      ];
      const startY = 930;
      ctx.font = 'bold 20px "JetBrains Mono", monospace';
      competencies.forEach((comp, idx) => {
        const col = idx % 2 === 0 ? width / 2 - 450 : width / 2 + 100;
        const rowY = startY + Math.floor(idx / 2) * 45;
        if (idx === 4) {
          // Center the 5th item
          ctx.fillStyle = '#1A42D9';
          ctx.fillText('✓  ' + comp, width / 2 - 180, startY + 95);
        } else {
          ctx.fillStyle = '#111111';
          ctx.fillText('✓  ' + comp, col, rowY);
        }
      });

      // 8. Signatures & Verified Seal (Bottom Area)
      const bottomY = 1260;

      // Left Signature: Research Fellow
      ctx.textAlign = 'left';
      ctx.fillStyle = '#111111';
      ctx.font = 'italic 38px "Newsreader", serif';
      ctx.fillText('Dr. Elena Rostova', 300, bottomY);
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(300, bottomY + 15);
      ctx.lineTo(650, bottomY + 15);
      ctx.stroke();
      ctx.font = 'bold 18px "JetBrains Mono", monospace';
      ctx.fillStyle = '#666666';
      ctx.fillText('DR. ELENA ROSTOVA', 300, bottomY + 45);
      ctx.font = '400 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Chief Fellow, Theoretical Intelligence', 300, bottomY + 70);

      // Right Signature: Director of Systems
      ctx.textAlign = 'left';
      ctx.fillStyle = '#111111';
      ctx.font = 'italic 38px "Newsreader", serif';
      ctx.fillText('Marcus Vance', width - 650, bottomY);
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width - 650, bottomY + 15);
      ctx.lineTo(width - 300, bottomY + 15);
      ctx.stroke();
      ctx.font = 'bold 18px "JetBrains Mono", monospace';
      ctx.fillStyle = '#666666';
      ctx.fillText('MARCUS VANCE', width - 650, bottomY + 45);
      ctx.font = '400 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Director, Applied ML Systems Lab', width - 650, bottomY + 70);

      // Center Official Seal Emblem
      ctx.save();
      ctx.translate(width / 2, bottomY + 20);
      // Gold outer ring
      ctx.beginPath();
      ctx.arc(0, 0, 80, 0, Math.PI * 2);
      ctx.fillStyle = '#D97706';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#B45309';
      ctx.stroke();

      // Inner navy ring
      ctx.beginPath();
      ctx.arc(0, 0, 70, 0, Math.PI * 2);
      ctx.fillStyle = '#1A42D9';
      ctx.fill();

      // Seal text
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px "JetBrains Mono", monospace';
      ctx.fillText('NEURAFORGE', 0, -25);
      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('★ 2026 ★', 0, 5);
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.fillText('VERIFIED', 0, 30);
      ctx.restore();

      // 9. Bottom Footer Bar: Credential ID, Verification URL & Date
      ctx.textAlign = 'center';
      ctx.fillStyle = '#888888';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillText(`CREDENTIAL ID: ${credentialId}   •   ISSUED: ${issueDate.toUpperCase()}   •   VERIFY: neuraforge.ai/credentials`, width / 2, 1480);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeName = recipientName.replace(/[^a-zA-Z0-9]/g, '_');
        a.download = `NeuraForge_Machine_Learning_Certificate_${safeName}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsExportingPng(false);
        try {
          confetti({ particleCount: 60, spread: 70 });
        } catch (e) {}
      }, 'image/png');
    } catch (err) {
      console.error('PNG export failed', err);
      setIsExportingPng(false);
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(`https://neuraforge.ai/credentials/${credentialId}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleUnlockDemo = () => {
    setDemoUnlocked(true);
    if (onUpdateXP) onUpdateXP(500);
    try {
      confetti({ particleCount: 70, spread: 80 });
    } catch (e) {}
  };

  return (
    <div id="certificate_view_container" className="min-h-full bg-[#F7F5EF] text-[#111111] p-4 sm:p-8 lg:p-10 select-none">
      
      {/* Printable CSS Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable_certificate_node, #printable_certificate_node * {
            visibility: visible;
          }
          #printable_certificate_node {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 24px;
            box-shadow: none !important;
            border-width: 4px !important;
            background: #FFFFFF !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: landscape;
            margin: 8mm;
          }
        }
      `}</style>

      {/* 1. Header & Back Bar (Hidden on Print) */}
      <div className="max-w-6xl mx-auto mb-8 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E2D9] pb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectView?.('dashboard')}
              className="p-2 bg-white hover:bg-stone-50 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-[#111111] transition-all cursor-pointer"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-[10px] font-mono uppercase text-stone-400 font-bold tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1A42D9]" />
                <span>NeuraForge Accreditation System</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                Official Certificate of Mastery
              </h1>
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-none bg-white hover:bg-stone-50 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-mono text-xs font-bold text-[#111111] flex items-center gap-2 transition-all cursor-pointer"
              title="Print to PDF (Landscape)"
            >
              <Printer className="w-4 h-4 text-[#1A42D9]" />
              <span>PRINT / PDF</span>
            </button>

            <button
              onClick={handleDownloadPng}
              disabled={isExportingPng}
              className="px-5 py-2.5 rounded-none bg-[#111111] hover:bg-[#1A42D9] border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-mono text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer"
              title="Export High-Res 2400x1600 PNG"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPng ? 'RENDERING PNG...' : 'DOWNLOAD PNG'}</span>
            </button>

            <button
              onClick={handleCopyShareLink}
              className="px-3.5 py-2.5 rounded-none bg-white hover:bg-stone-50 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-mono text-xs font-bold text-[#111111] flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copy verification URL"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-500" />}
              <span className="hidden sm:inline">{copiedLink ? 'COPIED!' : 'SHARE'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Overview Status & Customization Panel (Hidden on Print) */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 no-print">
        
        {/* Left Card: Progress Verification Checklist */}
        <div className="lg:col-span-6 bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] rounded-none p-6">
          <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#1A42D9] border border-[#111111]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                Competency Verification Status
              </span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border border-[#111111] ${
              isEligible ? 'bg-emerald-50 text-emerald-900 border-emerald-700' : 'bg-amber-50 text-amber-900'
            }`}>
              {isEligible ? 'ACCREDITED & UNLOCKED' : 'IN PROGRESS'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 bg-[#FAF8F2] border-[2px] border-[#111111]">
              <div className="flex items-center gap-2 text-xs font-mono">
                <CheckCircle2 className={`w-4 h-4 ${completedQuizzesCount >= 1 || demoUnlocked ? 'text-emerald-700' : 'text-stone-400'}`} />
                <span className="font-bold">Diagnostic Benchmarks:</span>
              </div>
              <span className="text-xs font-mono font-black text-[#1A42D9]">
                {demoUnlocked ? '8 / 8 Complete' : `${completedQuizzesCount} / 8 Complete`}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#FAF8F2] border-[2px] border-[#111111]">
              <div className="flex items-center gap-2 text-xs font-mono">
                <CheckCircle2 className={`w-4 h-4 ${completedLessonsCount >= 1 || demoUnlocked ? 'text-emerald-700' : 'text-stone-400'}`} />
                <span className="font-bold">Theoretical Course Lessons:</span>
              </div>
              <span className="text-xs font-mono font-black text-[#1A42D9]">
                {demoUnlocked ? '10 / 10 Mastered' : `${completedLessonsCount} / 10 Mastered`}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#FAF8F2] border-[2px] border-[#111111]">
              <div className="flex items-center gap-2 text-xs font-mono">
                <CheckCircle2 className={`w-4 h-4 ${completedChallengesCount >= 1 || demoUnlocked ? 'text-emerald-700' : 'text-stone-400'}`} />
                <span className="font-bold">Empirical Jupyter Lab Challenges:</span>
              </div>
              <span className="text-xs font-mono font-black text-[#1A42D9]">
                {demoUnlocked ? '5 / 5 Verified' : `${completedChallengesCount} / 5 Verified`}
              </span>
            </div>
          </div>

          {/* Quick Demo Unlock Button for instant examiner review */}
          {!demoUnlocked && (
            <div className="mt-4 pt-3 border-t-[2px] border-[#111111] flex items-center justify-between">
              <span className="text-[11px] font-mono text-stone-600">
                Want to preview the 100% completed certificate immediately?
              </span>
              <button
                onClick={handleUnlockDemo}
                className="px-3 py-1.5 rounded-none bg-[#FAF8F2] hover:bg-stone-100 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] text-[10px] font-mono font-bold text-[#1A42D9] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Unlock className="w-3 h-3" />
                <span>FAST-TRACK UNLOCK</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Card: Credential Customization */}
        <div className="lg:col-span-6 bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] rounded-none p-6">
          <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-3 mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
              Credential Personalization
            </span>
            <span className="text-[10px] font-mono text-stone-500 font-bold">
              ID: {credentialId}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold text-stone-700 uppercase mb-1">
                Recipient Legal Name:
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full px-3.5 py-2 rounded-none bg-[#FAF8F2] border-[2px] border-[#111111] font-mono text-xs font-bold text-[#111111] focus:outline-none focus:border-[#1A42D9]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-stone-700 uppercase mb-1">
                Specialization Track:
              </label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3.5 py-2 rounded-none bg-[#FAF8F2] border-[2px] border-[#111111] font-mono text-xs font-bold text-[#111111] focus:outline-none focus:border-[#1A42D9] cursor-pointer"
              >
                <option value="Machine Learning & First-Principles Engineering">
                  Machine Learning & First-Principles Engineering
                </option>
                <option value="Deep Neural Networks & Tensor Calculus">
                  Deep Neural Networks & Tensor Calculus
                </option>
                <option value="Empirical Systems & Feature Pipeline Architecture">
                  Empirical Systems & Feature Pipeline Architecture
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. THE CERTIFICATE DISPLAY (PRINTABLE & HIGH-FIDELITY) */}
      <div className="max-w-6xl mx-auto flex justify-center">
        <div
          ref={certRef}
          id="printable_certificate_node"
          className="w-full bg-[#FCFAF5] border-[4px] border-[#111111] shadow-[10px_10px_0px_0px_#111111] p-8 sm:p-14 lg:p-16 relative select-text overflow-hidden"
        >
          {/* Decorative Framing */}
          <div className="border-[2px] border-[#1A42D9] p-6 sm:p-10 relative">
            
            {/* Corner Decorative Crosshairs */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#111111]" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#111111]" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#111111]" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#111111]" />

            {/* Institution Brand */}
            <div className="text-center space-y-1 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A42D9]/10 border border-[#1A42D9] text-[#1A42D9] font-mono text-[11px] font-bold tracking-widest uppercase">
                <span>NEURAFORGE INSTITUTE OF ARTIFICIAL INTELLIGENCE</span>
              </div>
              <p className="text-stone-500 font-mono text-[10px] tracking-wider uppercase">
                DIVISION OF COMPUTATIONAL MATHEMATICS & FIRST-PRINCIPLES SYSTEMS
              </p>
            </div>

            {/* Title */}
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl sm:text-5xl font-black font-serif tracking-tight text-[#111111]">
                CERTIFICATE OF MASTERY
              </h2>
              <p className="text-xs sm:text-sm font-serif italic text-stone-600">
                This official credential certifies that
              </p>
            </div>

            {/* Recipient Name */}
            <div className="text-center my-6">
              <div className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif text-[#111111] tracking-wide uppercase underline decoration-[#1A42D9] decoration-2 underline-offset-8">
                {recipientName || 'LEARNER'}
              </div>
            </div>

            {/* Citation Statement */}
            <div className="text-center max-w-3xl mx-auto space-y-3 my-8">
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
                has successfully fulfilled all theoretical evaluations, empirical Jupyter benchmarks, and mathematical proofs required to establish certified mastery in
              </p>
              <div className="text-lg sm:text-xl font-bold font-mono text-[#1A42D9]">
                {specialization}
              </div>
              <p className="text-[11px] text-stone-500 font-mono leading-relaxed">
                Demonstrating rigorous analytical formulation across loss landscapes, closed-form projections, backpropagation dynamics, and data leakage safeguards.
              </p>
            </div>

            {/* Five Certified Competencies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-w-3xl mx-auto my-8 text-center sm:text-left">
              {[
                'Ordinary Least Squares & Projections',
                'Convex Optimization & Gradient Descent',
                'Voronoi Metric Spaces & K-Means',
                'Recursive Gini Partitioning & Trees',
                'Neural Backprop & Tensor Calculus',
                'Pipeline Integrity & Leakage Prevention'
              ].map((skill, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-white border border-[#111111] text-[10px] font-mono font-bold text-stone-800">
                  <Check className="w-3.5 h-3.5 text-[#1A42D9] shrink-0" />
                  <span className="truncate">{skill}</span>
                </div>
              ))}
            </div>

            {/* Signatures & Seal Section */}
            <div className="pt-8 border-t-[2px] border-[#111111] mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8 items-center text-center sm:text-left">
              
              {/* Signature 1 */}
              <div>
                <div className="h-10 flex items-end justify-center sm:justify-start">
                  <span className="font-serif italic text-2xl text-stone-800 font-bold">
                    Elena Rostova
                  </span>
                </div>
                <div className="border-t border-[#111111] pt-1.5 mt-1">
                  <div className="text-[11px] font-mono font-bold text-[#111111]">
                    DR. ELENA ROSTOVA
                  </div>
                  <div className="text-[10px] font-mono text-stone-500">
                    Lead Fellow, Theoretical Intelligence
                  </div>
                </div>
              </div>

              {/* Verified Gold Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-[#D97706] border-[3px] border-[#B45309] flex items-center justify-center shadow-md p-1">
                  <div className="w-full h-full rounded-full bg-[#1A42D9] border border-amber-300 flex flex-col items-center justify-center text-white text-center p-1">
                    <span className="text-[8px] font-mono tracking-widest uppercase font-bold text-amber-300">
                      NEURAFORGE
                    </span>
                    <Award className="w-5 h-5 text-amber-300 my-0.5" />
                    <span className="text-[8px] font-mono font-black tracking-wider">
                      VERIFIED
                    </span>
                  </div>
                </div>
              </div>

              {/* Signature 2 */}
              <div className="sm:text-right">
                <div className="h-10 flex items-end justify-center sm:justify-end">
                  <span className="font-serif italic text-2xl text-stone-800 font-bold">
                    Marcus Vance
                  </span>
                </div>
                <div className="border-t border-[#111111] pt-1.5 mt-1">
                  <div className="text-[11px] font-mono font-bold text-[#111111]">
                    MARCUS VANCE
                  </div>
                  <div className="text-[10px] font-mono text-stone-500">
                    Director of Machine Learning Lab
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Verification Footer */}
            <div className="mt-8 pt-4 border-t border-stone-300 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-stone-500">
              <div>
                CREDENTIAL ID: <span className="font-bold text-[#111111]">{credentialId}</span>
              </div>
              <div>
                DATE OF ISSUANCE: <span className="font-bold text-[#111111]">{issueDate}</span>
              </div>
              <div className="flex items-center gap-1 text-[#1A42D9] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CRYPTOGRAPHICALLY VERIFIED</span>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
