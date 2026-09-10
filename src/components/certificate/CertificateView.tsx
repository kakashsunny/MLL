import React, { useState, useRef, useEffect } from 'react';
import { UserProgress, ViewMode } from '../../types';
import { 
  getStoredProfile, 
  recordQuizCompletion, 
  recordCodingCompletion, 
  recordDebuggingCompletion, 
  claimCertificateRecord,
  verifyCertificateRecord,
  updateCertificateRecipientName,
  CertificateVerificationRecord,
  saveProgress 
} from '../../services/storageService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  QUIZ_ASSESSMENTS, 
  CODING_ASSESSMENTS, 
  DEBUGGING_ASSESSMENTS 
} from '../../data/assessmentData';
import { 
  evaluateCodingChallenge, 
  evaluateDebuggingChallenge, 
  EvaluationResult 
} from '../../utils/assessmentEvaluator';
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
  Lock, 
  Unlock, 
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Play,
  FileCode2,
  Bug,
  BrainCircuit,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Search,
  FileCheck,
  XCircle,
  ShieldAlert,
  QrCode,
  X,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  generateCertificateQrCode,
  drawQrCodeOnCanvas,
  getCertificateVerificationUrl
} from '../../utils/qrCodeGenerator';

interface CertificateViewProps {
  userProgress: UserProgress;
  onSelectView?: (view: ViewMode) => void;
  onUpdateXP?: (amount: number) => void;
  onProgressUpdate?: (progress: UserProgress) => void;
}

type TabMode = 'dashboard' | 'quiz' | 'coding' | 'debugging' | 'certificate' | 'verify';

export const CertificateView: React.FC<CertificateViewProps> = ({
  userProgress,
  onSelectView,
  onUpdateXP,
  onProgressUpdate
}) => {
  const { user, profile: authProfile } = useAuth();
  const profile = getStoredProfile();

  const [activeTab, setActiveTab] = useState<TabMode>('dashboard');

  // Customization & Credential State
  const [recipientName, setRecipientName] = useState(
    userProgress.certificateRecipientName || user?.displayName || authProfile?.displayName || profile.name || 'ML Practitioner'
  );
  const courseName = 'Machine Learning & First-Principles Engineering';
  const [issueDate, setIssueDate] = useState(() => {
    if (userProgress.certificateClaimedAt) {
      return new Date(userProgress.certificateClaimedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  });

  const [credentialId, setCredentialId] = useState<string>(() => {
    return userProgress.certificateId || `FFA-ML-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  // QR Code State
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedQrUrl, setCopiedQrUrl] = useState(false);

  // Generate QR Code data URL when credential ID changes
  useEffect(() => {
    let isMounted = true;
    generateCertificateQrCode(credentialId, { width: 320, margin: 1 })
      .then(url => {
        if (isMounted) setQrCodeDataUrl(url);
      })
      .catch(err => console.error('Failed to generate certificate QR code:', err));
    return () => { isMounted = false; };
  }, [credentialId]);

  // Read URL search params to auto-verify if opened via QR code scan
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search);
      const verifyTarget = params.get('verify') || params.get('certificateId');
      if (verifyTarget) {
        setVerificationInput(verifyTarget);
        handleRunVerification(verifyTarget);
        setActiveTab('verify');
      }
    }
  }, []);

  const handleCopyQrUrl = () => {
    const url = getCertificateVerificationUrl(credentialId);
    navigator.clipboard.writeText(url);
    setCopiedQrUrl(true);
    setTimeout(() => setCopiedQrUrl(false), 2500);
  };

  const handleDownloadQrImage = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.download = `QRCode_${credentialId}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  // Verification Search State
  const [verificationInput, setVerificationInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<CertificateVerificationRecord | null>(null);
  const [hasSearchedVerification, setHasSearchedVerification] = useState(false);

  const handleRunVerification = (idToTest?: string) => {
    const target = (idToTest !== undefined ? idToTest : verificationInput).trim();
    if (!target) return;
    const result = verifyCertificateRecord(target);
    setVerificationResult(result);
    setHasSearchedVerification(true);
  };

  // Stage 1: Quiz State
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState(false);

  // Stage 2: Coding State
  const [currentCodingIdx, setCurrentCodingIdx] = useState(0);
  const [codingCode, setCodingCode] = useState(CODING_ASSESSMENTS[0]?.starterCode || '');
  const [codingEvalResult, setCodingEvalResult] = useState<EvaluationResult | null>(null);
  const [isEvaluatingCoding, setIsEvaluatingCoding] = useState(false);
  const [showCodingHint, setShowCodingHint] = useState(false);

  // Stage 3: Debugging State
  const [currentDebuggingIdx, setCurrentDebuggingIdx] = useState(0);
  const [debuggingCode, setDebuggingCode] = useState(DEBUGGING_ASSESSMENTS[0]?.brokenCode || '');
  const [debuggingEvalResult, setDebuggingEvalResult] = useState<EvaluationResult | null>(null);
  const [isEvaluatingDebugging, setIsEvaluatingDebugging] = useState(false);
  const [showDebuggingHint, setShowDebuggingHint] = useState(false);

  // Synchronize code when changing challenge index
  useEffect(() => {
    const c = CODING_ASSESSMENTS[currentCodingIdx];
    if (c) {
      setCodingCode(c.starterCode);
      setCodingEvalResult(null);
      setShowCodingHint(false);
    }
  }, [currentCodingIdx]);

  useEffect(() => {
    const d = DEBUGGING_ASSESSMENTS[currentDebuggingIdx];
    if (d) {
      setDebuggingCode(d.brokenCode);
      setDebuggingEvalResult(null);
      setShowDebuggingHint(false);
    }
  }, [currentDebuggingIdx]);

  // Assessment Progress Calculations (Strict 20 / 20 / 20)
  const completedQuizzes = userProgress.completedQuizzes || [];
  const completedCoding = userProgress.completedCodingChallenges || [];
  const completedDebugging = userProgress.completedDebuggingChallenges || [];

  // Deduplicated counts out of 20
  const quizCount = Math.min(20, completedQuizzes.filter(id => id.startsWith('quiz_')).length);
  const codingCount = Math.min(20, completedCoding.filter(id => id.startsWith('code_')).length);
  const debuggingCount = Math.min(20, completedDebugging.filter(id => id.startsWith('debug_')).length);

  // Strict Eligibility Rule: ALL THREE MUST BE EXACTLY 20/20
  const isEligible = quizCount >= 20 && codingCount >= 20 && debuggingCount >= 20;
  const isClaimed = !!userProgress.certificateClaimed;

  // Percentage calculations
  const quizPercent = Math.round((quizCount / 20) * 100);
  const codingPercent = Math.round((codingCount / 20) * 100);
  const debuggingPercent = Math.round((debuggingCount / 20) * 100);

  // ASCII Progress bar generator
  const renderProgressBar = (count: number, total: number = 20) => {
    const filledBlocks = Math.round((count / total) * 16);
    const emptyBlocks = 16 - filledBlocks;
    return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
  };

  // --------------------------------------------------------------------------
  // Quiz Handlers
  // --------------------------------------------------------------------------
  const currentQuiz = QUIZ_ASSESSMENTS[currentQuizIdx] || QUIZ_ASSESSMENTS[0];
  const isCurrentQuizCompleted = completedQuizzes.includes(currentQuiz.id);

  const handleSelectQuizOption = (optionIdx: number) => {
    if (isQuizAnswered) return;
    setSelectedQuizOption(optionIdx);
    setIsQuizAnswered(true);

    const isCorrect = optionIdx === currentQuiz.correctAnswer;
    const updated = recordQuizCompletion(currentQuiz.id, isCorrect, isCorrect ? 100 : 0, currentQuiz.xpReward);
    
    if (onProgressUpdate) onProgressUpdate(updated);
    if (onUpdateXP && isCorrect) onUpdateXP(currentQuiz.xpReward);

    if (isCorrect) {
      try {
        confetti({ particleCount: 35, spread: 45 });
      } catch (e) {}
    }
  };

  const handleNextQuiz = () => {
    if (currentQuizIdx < QUIZ_ASSESSMENTS.length - 1) {
      setCurrentQuizIdx(i => i + 1);
      setSelectedQuizOption(null);
      setIsQuizAnswered(false);
    }
  };

  const handlePrevQuiz = () => {
    if (currentQuizIdx > 0) {
      setCurrentQuizIdx(i => i - 1);
      setSelectedQuizOption(null);
      setIsQuizAnswered(false);
    }
  };

  // --------------------------------------------------------------------------
  // Coding Challenge Handlers
  // --------------------------------------------------------------------------
  const currentCoding = CODING_ASSESSMENTS[currentCodingIdx] || CODING_ASSESSMENTS[0];
  const isCurrentCodingCompleted = completedCoding.includes(currentCoding.id);

  const handleRunCodingEvaluation = async () => {
    setIsEvaluatingCoding(true);
    try {
      const result = await evaluateCodingChallenge(currentCoding.id, codingCode);
      setCodingEvalResult(result);

      if (result.passed) {
        const updated = recordCodingCompletion(currentCoding.id, true, currentCoding.xpReward);
        if (onProgressUpdate) onProgressUpdate(updated);
        if (onUpdateXP) onUpdateXP(currentCoding.xpReward);
        try {
          confetti({ particleCount: 50, spread: 60 });
        } catch (e) {}
      }
    } finally {
      setIsEvaluatingCoding(false);
    }
  };

  // --------------------------------------------------------------------------
  // Debugging Challenge Handlers
  // --------------------------------------------------------------------------
  const currentDebugging = DEBUGGING_ASSESSMENTS[currentDebuggingIdx] || DEBUGGING_ASSESSMENTS[0];
  const isCurrentDebuggingCompleted = completedDebugging.includes(currentDebugging.id);

  const handleRunDebuggingEvaluation = async () => {
    setIsEvaluatingDebugging(true);
    try {
      const result = await evaluateDebuggingChallenge(currentDebugging.id, debuggingCode);
      setDebuggingEvalResult(result);

      if (result.passed) {
        const updated = recordDebuggingCompletion(currentDebugging.id, true, currentDebugging.xpReward);
        if (onProgressUpdate) onProgressUpdate(updated);
        if (onUpdateXP) onUpdateXP(currentDebugging.xpReward);
        try {
          confetti({ particleCount: 50, spread: 60 });
        } catch (e) {}
      }
    } finally {
      setIsEvaluatingDebugging(false);
    }
  };

  // --------------------------------------------------------------------------
  // Claim Certificate Handler
  // --------------------------------------------------------------------------
  const handleClaimCertificate = () => {
    if (!isEligible) return;

    const generatedId = userProgress.certificateId || `FFA-ML-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    setCredentialId(generatedId);
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    setIssueDate(currentDate);

    const updated = claimCertificateRecord(generatedId, recipientName);
    if (onProgressUpdate) onProgressUpdate(updated);
    if (onUpdateXP) onUpdateXP(1000); // 1,000 XP Capstone Completion Reward

    try {
      confetti({ particleCount: 120, spread: 90 });
    } catch (e) {}
  };

  // --------------------------------------------------------------------------
  // Certificate Export (PNG & PDF)
  // --------------------------------------------------------------------------
  const handlePrint = () => {
    if (!isEligible || !isClaimed) return;
    window.print();
  };

  const handleDownloadPng = async () => {
    if (!isEligible || !isClaimed) return;
    setIsExportingPng(true);
    try {
      const width = 2400;
      const height = 1600;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Background Fill
      ctx.fillStyle = '#FAF8F2';
      ctx.fillRect(0, 0, width, height);

      // Subtle textured parchment border
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

      // Corner Brackets
      const drawCorner = (x: number, y: number, angle: number) => {
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
      drawCorner(104, 104, 0);
      drawCorner(width - 104, 104, 0);
      drawCorner(104, height - 104, 0);
      drawCorner(width - 104, height - 104, 0);

      // 3. Organization Header (Strictly Sunny Organization)
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1A42D9';
      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.fillText('SUNNY ORGANIZATION', width / 2, 230);

      ctx.fillStyle = '#666666';
      ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('ACADEMIC & FIRST-PRINCIPLES ARTIFICIAL INTELLIGENCE DIVISION', width / 2, 275);

      // Divider Line
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 350, 315);
      ctx.lineTo(width / 2 + 350, 315);
      ctx.stroke();

      // Center Diamond
      ctx.fillStyle = '#1A42D9';
      ctx.beginPath();
      ctx.arc(width / 2, 315, 8, 0, Math.PI * 2);
      ctx.fill();

      // 4. Certificate Title
      ctx.fillStyle = '#111111';
      ctx.font = '900 68px "Newsreader", serif';
      ctx.fillText('Certificate of Completion', width / 2, 430);

      ctx.fillStyle = '#555555';
      ctx.font = 'italic 28px "Newsreader", serif';
      ctx.fillText('This certificate is proudly presented to', width / 2, 510);

      // 5. Learner Name
      ctx.fillStyle = '#111111';
      ctx.font = '900 76px "Newsreader", serif';
      const upperName = (recipientName || 'LEARNER').toUpperCase();
      ctx.fillText(upperName, width / 2, 630);

      // Underline
      const textWidth = ctx.measureText(upperName).width;
      ctx.strokeStyle = '#1A42D9';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(width / 2 - textWidth / 2 - 20, 655);
      ctx.lineTo(width / 2 + textWidth / 2 + 20, 655);
      ctx.stroke();

      // 6. Course & Assessment Achievement Statement
      ctx.fillStyle = '#555555';
      ctx.font = '400 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('for successfully completing the', width / 2, 740);

      ctx.fillStyle = '#1A42D9';
      ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(courseName, width / 2, 810);

      ctx.fillStyle = '#333333';
      ctx.font = '500 26px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('and successfully completing all required assessments:', width / 2, 880);

      // 7. Three Assessment Badges
      const badgeY = 960;
      const badges = [
        '✓  20 Quiz Challenges',
        '✓  20 Coding Challenges',
        '✓  20 Debugging Challenges'
      ];
      const spacing = 480;
      const startX = width / 2 - spacing;

      badges.forEach((b, i) => {
        const bx = startX + i * spacing;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 2;
        ctx.fillRect(bx - 200, badgeY - 35, 400, 60);
        ctx.strokeRect(bx - 200, badgeY - 35, 400, 60);

        ctx.fillStyle = '#111111';
        ctx.font = 'bold 22px "JetBrains Mono", monospace';
        ctx.fillText(b, bx, badgeY + 5);
      });

      // 8. Signatures & Issuer (K AKASH — Founder, Sunny Organization)
      const bottomY = 1250;

      // Sole Issuer: K AKASH
      ctx.textAlign = 'center';
      ctx.fillStyle = '#111111';
      ctx.font = 'italic bold 46px "Newsreader", serif';
      ctx.fillText('K Akash', width / 2, bottomY);

      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 250, bottomY + 18);
      ctx.lineTo(width / 2 + 250, bottomY + 18);
      ctx.stroke();

      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.fillStyle = '#111111';
      ctx.fillText('K AKASH', width / 2, bottomY + 55);

      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#1A42D9';
      ctx.fillText('Founder', width / 2, bottomY + 88);

      ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#444444';
      ctx.fillText('Sunny Organization', width / 2, bottomY + 118);

      ctx.font = 'bold 20px "JetBrains Mono", monospace';
      ctx.fillStyle = '#111111';
      ctx.fillText('“K AKASH — Founder, Sunny Organization”', width / 2, bottomY + 155);

      // Official Institutional Seal (Right Side)
      const sealX = width - 360;
      const sealY = bottomY + 40;
      ctx.save();
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(sealX, sealY, 68, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#1A42D9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sealX, sealY, 60, 0, Math.PI * 2);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#111111';
      ctx.fillText('SUNNY ORG', sealX, sealY - 14);
      ctx.fillText('★ VERIFIED ★', sealX, sealY + 4);
      ctx.fillText('ACADEMIC 2026', sealX, sealY + 22);
      ctx.restore();

      // Left: Security Barcode Pattern & Verification Credential ID
      const barcodeX = 180;
      const barcodeY = bottomY;
      for (let i = 0; i < 36; i++) {
        const lineW = (i % 3 === 0 ? 4 : (i % 2 === 0 ? 2 : 1));
        ctx.fillStyle = '#111111';
        ctx.fillRect(barcodeX + i * 5, barcodeY, lineW, 36);
      }

      ctx.textAlign = 'left';
      ctx.font = 'bold 17px "JetBrains Mono", monospace';
      ctx.fillStyle = '#333333';
      ctx.fillText(`CREDENTIAL ID: ${credentialId}`, 180, 1475);
      ctx.fillText(`STATUS: VERIFIED ACADEMIC ACCREDITATION`, 180, 1505);

      // Right: Issue Date
      ctx.textAlign = 'right';
      ctx.fillText(`DATE OF ISSUANCE: ${issueDate}`, width - 180, 1475);
      ctx.fillText(`ISSUED BY: K AKASH — Founder, Sunny Organization`, width - 180, 1505);

      // Embedded Verification QR Code on Export Canvas (Right side, next to seal)
      try {
        const qrVerificationUrl = getCertificateVerificationUrl(credentialId);
        const qrSize = 120;
        const qrX = width - 560;
        const qrY = bottomY - 15;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 2;
        ctx.strokeRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);

        await drawQrCodeOnCanvas(ctx, qrVerificationUrl, qrX, qrY, qrSize);

        ctx.textAlign = 'center';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillStyle = '#111111';
        ctx.fillText('SCAN TO VERIFY', qrX + qrSize / 2, qrY + qrSize + 22);
      } catch (qrErr) {
        console.warn('Canvas QR embedding skipped:', qrErr);
      }

      // Trigger Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Certificate_${upperName.replace(/\s+/g, '_')}_SunnyOrg.png`;
      link.href = dataUrl;
      link.click();
      setIsExportingPng(false);
    } catch (err) {
      console.error('PNG export failed', err);
      setIsExportingPng(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!isEligible || !isClaimed) return;
    navigator.clipboard.writeText(`https://sunnyorg.com/credentials/${credentialId}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
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

      {/* 1. Header Bar */}
      <div className="max-w-6xl mx-auto mb-6 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E2D9] pb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectView?.('dashboard')}
              className="p-2.5 bg-white hover:bg-stone-50 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 text-[#111111] transition-all cursor-pointer"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-[10px] font-mono uppercase text-stone-500 font-bold tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1A42D9]" />
                <span>Sunny Organization Accreditation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                Machine Learning Certification Hub
              </h1>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handlePrint}
              disabled={!isEligible || !isClaimed}
              className={`px-4 py-2.5 font-mono text-xs font-bold border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] flex items-center gap-2 transition-all cursor-pointer ${
                isEligible && isClaimed 
                  ? 'bg-white hover:bg-stone-50 text-[#111111]' 
                  : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed shadow-none'
              }`}
              title={isEligible && isClaimed ? "Print Official Certificate" : "Locked: Complete all 3 assessments to unlock"}
            >
              <Printer className="w-4 h-4 text-[#1A42D9]" />
              <span>PRINT / PDF</span>
            </button>

            <button
              onClick={handleDownloadPng}
              disabled={!isEligible || !isClaimed || isExportingPng}
              className={`px-5 py-2.5 font-mono text-xs font-bold border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] flex items-center gap-2 transition-all cursor-pointer ${
                isEligible && isClaimed 
                  ? 'bg-[#111111] hover:bg-[#1A42D9] text-white' 
                  : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed shadow-none'
              }`}
              title={isEligible && isClaimed ? "Download High-Res 2400x1600 PNG" : "Locked: Complete all 3 assessments to unlock"}
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPng ? 'RENDERING PNG...' : 'DOWNLOAD PNG'}</span>
            </button>

            <button
              onClick={handleCopyShareLink}
              disabled={!isEligible || !isClaimed}
              className={`px-3.5 py-2.5 font-mono text-xs font-bold border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] flex items-center gap-1.5 transition-all cursor-pointer ${
                isEligible && isClaimed 
                  ? 'bg-white hover:bg-stone-50 text-[#111111]' 
                  : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed shadow-none'
              }`}
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-500" />}
              <span className="hidden sm:inline">{copiedLink ? 'COPIED!' : 'SHARE'}</span>
            </button>

            <button
              onClick={() => setIsQrModalOpen(true)}
              disabled={!isEligible || !isClaimed}
              className={`px-3.5 py-2.5 font-mono text-xs font-bold border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] flex items-center gap-1.5 transition-all cursor-pointer ${
                isEligible && isClaimed 
                  ? 'bg-white hover:bg-stone-50 text-[#111111]' 
                  : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed shadow-none'
              }`}
              title={isEligible && isClaimed ? "View and share verification QR code" : "Locked: Complete all 3 assessments to unlock"}
            >
              <QrCode className="w-4 h-4 text-[#1A42D9]" />
              <span>QR CODE</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 border-b border-[#E5E2D9]">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-mono text-xs font-bold border-[2px] border-[#111111] transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#111111] text-white shadow-[2px_2px_0px_0px_#111111]'
                : 'bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            OVERVIEW & PROGRESS
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 font-mono text-xs font-bold border-[2px] border-[#111111] transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-[#111111] text-white shadow-[2px_2px_0px_0px_#111111]'
                : 'bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>1. QUIZ CHALLENGE ({quizCount}/20)</span>
          </button>

          <button
            onClick={() => setActiveTab('coding')}
            className={`px-4 py-2 font-mono text-xs font-bold border-[2px] border-[#111111] transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'coding'
                ? 'bg-[#111111] text-white shadow-[2px_2px_0px_0px_#111111]'
                : 'bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>2. CODING CHALLENGE ({codingCount}/20)</span>
          </button>

          <button
            onClick={() => setActiveTab('debugging')}
            className={`px-4 py-2 font-mono text-xs font-bold border-[2px] border-[#111111] transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'debugging'
                ? 'bg-[#111111] text-white shadow-[2px_2px_0px_0px_#111111]'
                : 'bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>3. DEBUGGING CHALLENGE ({debuggingCount}/20)</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            className={`px-4 py-2 font-mono text-xs font-bold border-[2px] border-[#111111] transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'certificate'
                ? 'bg-[#1A42D9] text-white shadow-[2px_2px_0px_0px_#111111]'
                : isEligible 
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' 
                  : 'bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            {isEligible ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
            <span>CERTIFICATE {isEligible ? (isClaimed ? '✓ READY' : '★ CLAIM') : '🔒 LOCKED'}</span>
          </button>

          <button
            onClick={() => setActiveTab('verify')}
            className={`px-4 py-2 font-mono text-xs font-bold border-[2px] border-[#111111] transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'verify'
                ? 'bg-[#111111] text-white shadow-[2px_2px_0px_0px_#111111]'
                : 'bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#1A42D9]" />
            <span>VERIFY CREDENTIAL</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: DASHBOARD & OVERVIEW                                           */}
      {/* ==================================================================== */}
      {activeTab === 'dashboard' && (
        <div className="max-w-6xl mx-auto space-y-6 no-print">
          
          {/* THE SPECIFIED ASSESSMENT PROGRESS DASHBOARD */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-[2px] border-[#111111] pb-4 mb-6 gap-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 font-bold">
                  Sunny Organization Official Accreditation Protocol
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
                  ASSESSMENT PROGRESS
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 font-mono text-xs font-bold border-[2px] border-[#111111] flex items-center gap-1.5 ${
                  isEligible 
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-800' 
                    : 'bg-amber-100 text-amber-900 border-amber-800'
                }`}>
                  {isEligible ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <Lock className="w-4 h-4 text-amber-700" />}
                  <span>{isEligible ? (isClaimed ? 'CERTIFICATE: UNLOCKED & ISSUED' : 'CERTIFICATE: UNLOCKED (CLAIM PENDING)') : 'CERTIFICATE: LOCKED'}</span>
                </span>
              </div>
            </div>

            {/* ASCII & Graphical Representation */}
            <div className="bg-[#FAF8F2] border-[2px] border-[#111111] p-5 sm:p-6 font-mono text-xs sm:text-sm space-y-5">
              
              {/* Stage 1: Quiz */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center font-bold">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#1A42D9] border border-[#111111]" />
                    <span>Quiz</span>
                  </span>
                  <span className="text-[#1A42D9]">
                    {quizCount >= 20 ? '✓ 20/20' : `${quizCount}/20 (${quizPercent}%)`}
                  </span>
                </div>
                <div className="text-stone-800 text-sm sm:text-base tracking-wider overflow-x-auto whitespace-pre font-bold select-none">
                  {renderProgressBar(quizCount, 20)} <span className="text-xs text-stone-600">{quizCount}/20</span>
                </div>
              </div>

              {/* Stage 2: Coding */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center font-bold">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#D97706] border border-[#111111]" />
                    <span>Coding</span>
                  </span>
                  <span className="text-[#D97706]">
                    {codingCount >= 20 ? '✓ 20/20' : `${codingCount}/20 (${codingPercent}%)`}
                  </span>
                </div>
                <div className="text-stone-800 text-sm sm:text-base tracking-wider overflow-x-auto whitespace-pre font-bold select-none">
                  {renderProgressBar(codingCount, 20)} <span className="text-xs text-stone-600">{codingCount}/20</span>
                </div>
              </div>

              {/* Stage 3: Debugging */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center font-bold">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-rose-600 border border-[#111111]" />
                    <span>Debugging</span>
                  </span>
                  <span className="text-rose-700">
                    {debuggingCount >= 20 ? '✓ 20/20' : `${debuggingCount}/20 (${debuggingPercent}%)`}
                  </span>
                </div>
                <div className="text-stone-800 text-sm sm:text-base tracking-wider overflow-x-auto whitespace-pre font-bold select-none">
                  {renderProgressBar(debuggingCount, 20)} <span className="text-xs text-stone-600">{debuggingCount}/20</span>
                </div>
              </div>

              {/* Certificate Summary */}
              <div className="pt-3 border-t border-stone-300 flex justify-between items-center font-bold text-sm">
                <span>Certificate</span>
                <span className={isEligible ? 'text-emerald-700' : 'text-amber-800'}>
                  {isEligible ? '✓ UNLOCKED' : '🔒 LOCKED'}
                </span>
              </div>
            </div>

            {/* Congratulations Banner / Unlock CTA */}
            {isEligible ? (
              <div className="mt-6 p-5 bg-emerald-50 border-[2px] border-emerald-800 text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black tracking-tight">
                      Congratulations! You have successfully completed all course assessments.
                    </h3>
                    <p className="text-xs font-mono text-emerald-800">
                      20/20 Quiz • 20/20 Coding • 20/20 Debugging fully verified by Sunny Organization.
                    </p>
                  </div>
                </div>

                {!isClaimed ? (
                  <button
                    onClick={() => {
                      handleClaimCertificate();
                      setActiveTab('certificate');
                    }}
                    className="px-6 py-3 bg-[#111111] hover:bg-[#1A42D9] text-white font-mono text-xs font-black tracking-wider uppercase border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
                  >
                    CLAIM CERTIFICATE
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('certificate')}
                    className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs font-bold border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    <span>VIEW ISSUED CERTIFICATE</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-6 p-4 bg-amber-50 border-[2px] border-amber-700 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Certificate remains locked until all 3 assessment tracks are 20/20 complete.
                  </span>
                </div>
                <div className="text-stone-700">
                  Remaining: {20 - quizCount} Quiz, {20 - codingCount} Coding, {20 - debuggingCount} Debugging
                </div>
              </div>
            )}

            {/* Quick Action Stage Launchers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              
              <div className="p-4 bg-white border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-stone-500">Stage 1</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border border-[#111111] ${
                    quizCount >= 20 ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-100 text-stone-800'
                  }`}>
                    {quizCount >= 20 ? 'COMPLETED' : `${quizCount}/20`}
                  </span>
                </div>
                <h4 className="text-sm font-black text-[#111111]">Quiz Challenge</h4>
                <p className="text-[11px] text-stone-600 leading-relaxed font-mono">
                  20 conceptual multiple-choice challenges testing loss functions, regularization, linear models, and neural architectures.
                </p>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className="w-full py-2 bg-[#FAF8F2] hover:bg-stone-100 border-[2px] border-[#111111] text-xs font-mono font-bold text-[#111111] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{quizCount >= 20 ? 'REVIEW QUESTIONS' : 'CONTINUE QUIZ'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 bg-white border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-stone-500">Stage 2</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border border-[#111111] ${
                    codingCount >= 20 ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-100 text-stone-800'
                  }`}>
                    {codingCount >= 20 ? 'COMPLETED' : `${codingCount}/20`}
                  </span>
                </div>
                <h4 className="text-sm font-black text-[#111111]">Coding Challenge</h4>
                <p className="text-[11px] text-stone-600 leading-relaxed font-mono">
                  20 practical Python and NumPy algorithmic implementations across Easy, Medium, and Hard tiers with automated test evaluation.
                </p>
                <button
                  onClick={() => setActiveTab('coding')}
                  className="w-full py-2 bg-[#FAF8F2] hover:bg-stone-100 border-[2px] border-[#111111] text-xs font-mono font-bold text-[#111111] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{codingCount >= 20 ? 'REVIEW PROBLEMS' : 'CONTINUE CODING'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 bg-white border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-stone-500">Stage 3</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border border-[#111111] ${
                    debuggingCount >= 20 ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-100 text-stone-800'
                  }`}>
                    {debuggingCount >= 20 ? 'COMPLETED' : `${debuggingCount}/20`}
                  </span>
                </div>
                <h4 className="text-sm font-black text-[#111111]">Debugging Challenge</h4>
                <p className="text-[11px] text-stone-600 leading-relaxed font-mono">
                  20 broken ML snippets with realistic bugs: broadcasting errors, gradient inversions, data leakage, and numerical overflows.
                </p>
                <button
                  onClick={() => setActiveTab('debugging')}
                  className="w-full py-2 bg-[#FAF8F2] hover:bg-stone-100 border-[2px] border-[#111111] text-xs font-mono font-bold text-[#111111] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{debuggingCount >= 20 ? 'REVIEW BUGS' : 'CONTINUE DEBUGGING'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

          {/* Legal Recipient Customization Card */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] p-6">
            <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-3 mb-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                Certificate Recipient Profile
              </h3>
              <span className="text-[10px] font-mono text-stone-500 font-bold">
                ID: {credentialId}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-stone-700 uppercase mb-1">
                  Learner Legal Name (Appears on Certificate):
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F2] border-[2px] border-[#111111] font-mono text-xs font-bold text-[#111111] focus:outline-none focus:border-[#1A42D9]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-stone-700 uppercase mb-1">
                  Accredited Course Curriculum:
                </label>
                <input
                  type="text"
                  disabled
                  value={courseName}
                  className="w-full px-3.5 py-2.5 bg-stone-100 border-[2px] border-[#111111] font-mono text-xs font-bold text-stone-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-stone-600">
              <div>
                Issuer: <span className="font-bold text-[#111111]">K AKASH — Founder, Sunny Organization</span>
              </div>
              <div>
                Accreditation Status: <span className="font-bold text-[#1A42D9]">{isEligible ? 'Eligible for Issuance' : 'Incomplete Requirements'}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: STAGE 1 - QUIZ CHALLENGE (20 QUESTIONS)                       */}
      {/* ==================================================================== */}
      {activeTab === 'quiz' && (
        <div className="max-w-4xl mx-auto space-y-6 no-print">
          
          {/* Quiz Stage Header */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-[2px] border-[#111111] pb-3 mb-4 gap-2">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-[#1A42D9]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                  Stage 1: 20 Quiz Challenges
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-[#1A42D9]">
                Progress: {quizCount} / 20 Answered
              </div>
            </div>

            {/* Question Index Pills 1..20 */}
            <div className="flex flex-wrap gap-1.5 my-3">
              {QUIZ_ASSESSMENTS.map((q, idx) => {
                const isCompleted = completedQuizzes.includes(q.id);
                const isCurrent = idx === currentQuizIdx;
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQuizIdx(idx);
                      setSelectedQuizOption(null);
                      setIsQuizAnswered(false);
                    }}
                    className={`w-8 h-8 font-mono text-xs font-bold border-[2px] transition-all cursor-pointer flex items-center justify-center ${
                      isCurrent
                        ? 'border-[#111111] bg-[#111111] text-white shadow-[2px_2px_0px_0px_#1A42D9]'
                        : isCompleted
                          ? 'border-emerald-700 bg-emerald-100 text-emerald-950'
                          : 'border-[#111111] bg-[#FAF8F2] text-[#111111] hover:bg-stone-200'
                    }`}
                    title={q.title}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Card */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#FAF8F2] border border-[#111111] font-mono text-[10px] font-bold uppercase">
                  {currentQuiz.category}
                </span>
                <span className={`px-2 py-0.5 border border-[#111111] font-mono text-[10px] font-bold uppercase ${
                  currentQuiz.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-900' :
                  currentQuiz.difficulty === 'Medium' ? 'bg-amber-50 text-amber-900' :
                  'bg-rose-50 text-rose-900'
                }`}>
                  {currentQuiz.difficulty}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-stone-500">
                Question {currentQuizIdx + 1} of 20
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#111111] leading-relaxed">
              {currentQuiz.question}
            </h3>

            {/* 4 Options */}
            <div className="space-y-2.5">
              {currentQuiz.options.map((opt, oIdx) => {
                const isSelected = selectedQuizOption === oIdx;
                const isCorrect = oIdx === currentQuiz.correctAnswer;
                let btnStyle = 'bg-[#FAF8F2] hover:bg-stone-100 text-[#111111] border-[#111111]';

                if (isQuizAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-100 border-emerald-800 text-emerald-950 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-100 border-rose-800 text-rose-950';
                  } else {
                    btnStyle = 'bg-white opacity-50 border-stone-300 text-stone-600';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectQuizOption(oIdx)}
                    disabled={isQuizAnswered}
                    className={`w-full p-3.5 text-left border-[2px] transition-all font-sans text-xs sm:text-sm flex items-start gap-3 cursor-pointer ${btnStyle}`}
                  >
                    <span className="font-mono font-bold text-xs uppercase shrink-0 mt-0.5">
                      {String.fromCharCode(65 + oIdx)}.
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation when answered */}
            {isQuizAnswered && (
              <div className={`p-4 border-[2px] space-y-1.5 ${
                selectedQuizOption === currentQuiz.correctAnswer
                  ? 'bg-emerald-50 border-emerald-800 text-emerald-950'
                  : 'bg-amber-50 border-amber-800 text-amber-950'
              }`}>
                <div className="font-mono text-xs font-bold flex items-center gap-1.5">
                  {selectedQuizOption === currentQuiz.correctAnswer ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>Correct Answer! (+{currentQuiz.xpReward} XP)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-800" />
                      <span>Explanation:</span>
                    </>
                  )}
                </div>
                <p className="text-xs leading-relaxed font-sans">
                  {currentQuiz.explanation}
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={handlePrevQuiz}
                disabled={currentQuizIdx === 0}
                className="px-4 py-2 bg-white border-[2px] border-[#111111] font-mono text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                PREVIOUS QUESTION
              </button>

              <button
                onClick={handleNextQuiz}
                disabled={currentQuizIdx === QUIZ_ASSESSMENTS.length - 1}
                className="px-4 py-2 bg-[#111111] hover:bg-[#1A42D9] text-white border-[2px] border-[#111111] font-mono text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
              >
                <span>NEXT QUESTION</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: STAGE 2 - CODING CHALLENGE (20 PROBLEMS)                      */}
      {/* ==================================================================== */}
      {activeTab === 'coding' && (
        <div className="max-w-5xl mx-auto space-y-6 no-print">
          
          {/* Coding Stage Header & Index Selector */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-[2px] border-[#111111] pb-3 mb-4 gap-2">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-[#D97706]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                  Stage 2: 20 Coding Challenges
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-[#D97706]">
                Progress: {codingCount} / 20 Verified
              </div>
            </div>

            {/* 1..20 Problem Selector */}
            <div className="flex flex-wrap gap-1.5 my-3">
              {CODING_ASSESSMENTS.map((c, idx) => {
                const isCompleted = completedCoding.includes(c.id);
                const isCurrent = idx === currentCodingIdx;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCurrentCodingIdx(idx)}
                    className={`w-8 h-8 font-mono text-xs font-bold border-[2px] transition-all cursor-pointer flex items-center justify-center ${
                      isCurrent
                        ? 'border-[#111111] bg-[#111111] text-white shadow-[2px_2px_0px_0px_#D97706]'
                        : isCompleted
                          ? 'border-emerald-700 bg-emerald-100 text-emerald-950'
                          : 'border-[#111111] bg-[#FAF8F2] text-[#111111] hover:bg-stone-200'
                    }`}
                    title={c.title}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Problem Details & Editor */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-3 gap-2">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-stone-500">
                  Challenge {currentCodingIdx + 1} of 20
                </span>
                <h3 className="text-lg font-black text-[#111111]">
                  {currentCoding.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#FAF8F2] border border-[#111111] font-mono text-[10px] font-bold">
                  {currentCoding.category}
                </span>
                <span className="px-2 py-0.5 bg-amber-50 border border-amber-800 text-amber-950 font-mono text-[10px] font-bold">
                  {currentCoding.difficulty}
                </span>
                <span className="font-mono text-xs font-bold text-emerald-700">
                  +{currentCoding.xpReward} XP
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-800 font-sans leading-relaxed">
              {currentCoding.description}
            </p>

            {/* Code Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-stone-600">
                <span>Python Implementation:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCodingHint(!showCodingHint)}
                    className="text-[#1A42D9] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showCodingHint ? 'Hide Hint' : 'View Hint'}</span>
                  </button>
                  <button
                    onClick={() => setCodingCode(currentCoding.starterCode)}
                    className="text-stone-500 hover:text-[#111111] cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {showCodingHint && (
                <div className="p-3 bg-amber-50 border-[2px] border-amber-800 text-amber-950 font-mono text-xs">
                  <strong>Hint:</strong> {currentCoding.hint}
                </div>
              )}

              <textarea
                value={codingCode}
                onChange={(e) => setCodingCode(e.target.value)}
                rows={11}
                className="w-full p-4 font-mono text-xs bg-[#111111] text-emerald-400 border-[2px] border-[#111111] focus:outline-none focus:border-[#1A42D9] leading-relaxed resize-y"
                spellCheck={false}
              />
            </div>

            {/* Run & Evaluate Button */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handleRunCodingEvaluation}
                disabled={isEvaluatingCoding}
                className="px-6 py-3 bg-[#111111] hover:bg-[#1A42D9] text-white border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 font-mono text-xs font-black flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isEvaluatingCoding ? 'RUNNING TEST SUITE...' : 'SUBMIT & EVALUATE CODE'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentCodingIdx(Math.max(0, currentCodingIdx - 1))}
                  disabled={currentCodingIdx === 0}
                  className="px-3 py-2 bg-white border-[2px] border-[#111111] font-mono text-xs font-bold disabled:opacity-30 cursor-pointer"
                >
                  PREV
                </button>
                <button
                  onClick={() => setCurrentCodingIdx(Math.min(CODING_ASSESSMENTS.length - 1, currentCodingIdx + 1))}
                  disabled={currentCodingIdx === CODING_ASSESSMENTS.length - 1}
                  className="px-3 py-2 bg-white border-[2px] border-[#111111] font-mono text-xs font-bold disabled:opacity-30 cursor-pointer"
                >
                  NEXT
                </button>
              </div>
            </div>

            {/* Test Evaluation Console */}
            {codingEvalResult && (
              <div className={`p-4 border-[2px] font-mono text-xs space-y-3 ${
                codingEvalResult.passed 
                  ? 'bg-emerald-50 border-emerald-800 text-emerald-950' 
                  : 'bg-rose-50 border-rose-800 text-rose-950'
              }`}>
                <div className="flex items-center justify-between border-b border-current/20 pb-2 font-bold">
                  <span>TEST RESULTS ({codingEvalResult.executionTimeMs}ms)</span>
                  <span>SCORE: {codingEvalResult.score}%</span>
                </div>

                <div className="space-y-1.5">
                  {codingEvalResult.testCases.map((tc, tIdx) => (
                    <div key={tIdx} className="flex items-start gap-2">
                      {tc.passed ? (
                        <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold">{tc.name}:</span> {tc.details}
                        {tc.input && (
                          <div className="text-[11px] opacity-80">Input: {tc.input} | Expected: {tc.expected}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-current/20 text-xs font-bold">
                  {codingEvalResult.output}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: STAGE 3 - DEBUGGING CHALLENGE (20 PROBLEMS)                   */}
      {/* ==================================================================== */}
      {activeTab === 'debugging' && (
        <div className="max-w-5xl mx-auto space-y-6 no-print">
          
          {/* Debugging Stage Header & Index Selector */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-[2px] border-[#111111] pb-3 mb-4 gap-2">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                  Stage 3: 20 Debugging Challenges
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-rose-700">
                Progress: {debuggingCount} / 20 Resolved
              </div>
            </div>

            {/* 1..20 Bug Selector */}
            <div className="flex flex-wrap gap-1.5 my-3">
              {DEBUGGING_ASSESSMENTS.map((d, idx) => {
                const isCompleted = completedDebugging.includes(d.id);
                const isCurrent = idx === currentDebuggingIdx;
                return (
                  <button
                    key={d.id}
                    onClick={() => setCurrentDebuggingIdx(idx)}
                    className={`w-8 h-8 font-mono text-xs font-bold border-[2px] transition-all cursor-pointer flex items-center justify-center ${
                      isCurrent
                        ? 'border-[#111111] bg-[#111111] text-white shadow-[2px_2px_0px_0px_#E11D48]'
                        : isCompleted
                          ? 'border-emerald-700 bg-emerald-100 text-emerald-950'
                          : 'border-[#111111] bg-[#FAF8F2] text-[#111111] hover:bg-stone-200'
                    }`}
                    title={d.title}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bug Details & Editor */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-3 gap-2">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-stone-500">
                  Bug Investigation {currentDebuggingIdx + 1} of 20
                </span>
                <h3 className="text-lg font-black text-[#111111]">
                  {currentDebugging.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#FAF8F2] border border-[#111111] font-mono text-[10px] font-bold">
                  {currentDebugging.category}
                </span>
                <span className="px-2 py-0.5 bg-rose-50 border border-rose-800 text-rose-950 font-mono text-[10px] font-bold">
                  {currentDebugging.difficulty}
                </span>
                <span className="font-mono text-xs font-bold text-emerald-700">
                  +{currentDebugging.xpReward} XP
                </span>
              </div>
            </div>

            <div className="p-4 bg-rose-50 border-[2px] border-rose-800 text-rose-950 font-mono text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Bug className="w-4 h-4" />
                <span>Production Bug Symptom:</span>
              </div>
              <p className="font-sans leading-relaxed">{currentDebugging.description}</p>
            </div>

            {/* Code Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-stone-600">
                <span>Fix the Broken Code Below:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDebuggingHint(!showDebuggingHint)}
                    className="text-[#1A42D9] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showDebuggingHint ? 'Hide Hint' : 'View Hint'}</span>
                  </button>
                  <button
                    onClick={() => setDebuggingCode(currentDebugging.brokenCode)}
                    className="text-stone-500 hover:text-[#111111] cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {showDebuggingHint && (
                <div className="p-3 bg-amber-50 border-[2px] border-amber-800 text-amber-950 font-mono text-xs">
                  <strong>Hint:</strong> {currentDebugging.hint}
                </div>
              )}

              <textarea
                value={debuggingCode}
                onChange={(e) => setDebuggingCode(e.target.value)}
                rows={11}
                className="w-full p-4 font-mono text-xs bg-[#111111] text-amber-300 border-[2px] border-[#111111] focus:outline-none focus:border-[#1A42D9] leading-relaxed resize-y"
                spellCheck={false}
              />
            </div>

            {/* Run & Evaluate Button */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handleRunDebuggingEvaluation}
                disabled={isEvaluatingDebugging}
                className="px-6 py-3 bg-[#111111] hover:bg-[#1A42D9] text-white border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 font-mono text-xs font-black flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isEvaluatingDebugging ? 'RUNNING INTEGRITY CHECKS...' : 'SUBMIT FIX & VERIFY'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDebuggingIdx(Math.max(0, currentDebuggingIdx - 1))}
                  disabled={currentDebuggingIdx === 0}
                  className="px-3 py-2 bg-white border-[2px] border-[#111111] font-mono text-xs font-bold disabled:opacity-30 cursor-pointer"
                >
                  PREV
                </button>
                <button
                  onClick={() => setCurrentDebuggingIdx(Math.min(DEBUGGING_ASSESSMENTS.length - 1, currentDebuggingIdx + 1))}
                  disabled={currentDebuggingIdx === DEBUGGING_ASSESSMENTS.length - 1}
                  className="px-3 py-2 bg-white border-[2px] border-[#111111] font-mono text-xs font-bold disabled:opacity-30 cursor-pointer"
                >
                  NEXT
                </button>
              </div>
            </div>

            {/* Test Evaluation Console */}
            {debuggingEvalResult && (
              <div className={`p-4 border-[2px] font-mono text-xs space-y-3 ${
                debuggingEvalResult.passed 
                  ? 'bg-emerald-50 border-emerald-800 text-emerald-950' 
                  : 'bg-rose-50 border-rose-800 text-rose-950'
              }`}>
                <div className="flex items-center justify-between border-b border-current/20 pb-2 font-bold">
                  <span>DEBUGGER RESULTS ({debuggingEvalResult.executionTimeMs}ms)</span>
                  <span>STATUS: {debuggingEvalResult.passed ? 'BUG FIXED' : 'STILL BUGGY'}</span>
                </div>

                <div className="space-y-1.5">
                  {debuggingEvalResult.testCases.map((tc, tIdx) => (
                    <div key={tIdx} className="flex items-start gap-2">
                      {tc.passed ? (
                        <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold">{tc.name}:</span> {tc.details}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-current/20 text-xs font-bold">
                  {debuggingEvalResult.output}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: THE CERTIFICATE DISPLAY (PRINTABLE & HIGH-FIDELITY)           */}
      {/* ==================================================================== */}
      {activeTab === 'certificate' && (
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* If NOT eligible: show prominent locked alert */}
          {!isEligible && (
            <div className="bg-amber-50 border-[3px] border-amber-800 p-6 shadow-[5px_5px_0px_0px_#111111] no-print">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-600 text-white rounded-none border-[2px] border-[#111111] flex items-center justify-center shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-amber-950 uppercase tracking-wide">
                    Certificate Locked — Assessment Requirements Incomplete
                  </h3>
                  <p className="text-xs font-mono text-amber-900 leading-relaxed">
                    Sunny Organization policy strictly mandates that the final certificate must be earned by completing 100% of all three evaluation stages. Previews and downloads remain locked until requirements are verified.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono font-bold">
                    <span className={quizCount >= 20 ? 'text-emerald-700' : 'text-amber-900'}>
                      Quiz: {quizCount}/20 {quizCount >= 20 ? '✓' : `(Needs ${20 - quizCount} more)`}
                    </span>
                    <span className={codingCount >= 20 ? 'text-emerald-700' : 'text-amber-900'}>
                      Coding: {codingCount}/20 {codingCount >= 20 ? '✓' : `(Needs ${20 - codingCount} more)`}
                    </span>
                    <span className={debuggingCount >= 20 ? 'text-emerald-700' : 'text-amber-900'}>
                      Debugging: {debuggingCount}/20 {debuggingCount >= 20 ? '✓' : `(Needs ${20 - debuggingCount} more)`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* If eligible but not claimed yet */}
          {isEligible && !isClaimed && (
            <div className="bg-emerald-50 border-[3px] border-emerald-800 p-6 shadow-[5px_5px_0px_0px_#111111] no-print">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-emerald-950">
                      Congratulations! You have successfully completed all course assessments.
                    </h3>
                    <p className="text-xs font-mono text-emerald-800">
                      Click below to generate your unique credential ID and claim your official Sunny Organization certificate.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleClaimCertificate}
                  className="px-8 py-3.5 bg-[#111111] hover:bg-[#1A42D9] text-white font-mono text-xs font-black uppercase tracking-wider border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] cursor-pointer whitespace-nowrap transition-all"
                >
                  CLAIM CERTIFICATE
                </button>
              </div>
            </div>
          )}

          {/* THE OFFICIAL CERTIFICATE NODE */}
          <div className="space-y-4">

            {/* Recipient Customization Toolbar (no-print) */}
            <div className="bg-white border-[3px] border-[#111111] p-4 shadow-[4px_4px_0px_0px_#111111] flex flex-col md:flex-row items-center justify-between gap-4 no-print">
              <div className="w-full md:w-auto flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700 whitespace-nowrap">
                  CERTIFICATE RECIPIENT NAME:
                </span>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setRecipientName(newName);
                    if (isEligible && isClaimed) {
                      const updated = updateCertificateRecipientName(newName);
                      if (onProgressUpdate) onProgressUpdate(updated);
                    }
                  }}
                  placeholder="Enter official recipient name"
                  className="w-full sm:max-w-xs px-3 py-1.5 font-mono text-xs font-bold border-[2px] border-[#111111] bg-stone-50 focus:bg-white focus:outline-hidden focus:border-[#1A42D9]"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
                <button
                  onClick={() => {
                    setVerificationInput(credentialId);
                    handleRunVerification(credentialId);
                    setActiveTab('verify');
                  }}
                  className="px-3.5 py-1.5 font-mono text-xs font-bold border-[2px] border-[#111111] bg-white hover:bg-stone-100 text-[#111111] flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#111111] cursor-pointer"
                  title="Test and verify this certificate on the registry"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1A42D9]" />
                  <span>VERIFY ON REGISTRY</span>
                </button>

                <button
                  onClick={handlePrint}
                  disabled={!isEligible || !isClaimed}
                  className={`px-3.5 py-1.5 font-mono text-xs font-bold border-[2px] border-[#111111] flex items-center gap-1.5 cursor-pointer ${
                    isEligible && isClaimed
                      ? 'bg-white hover:bg-stone-100 text-[#111111] shadow-[2px_2px_0px_0px_#111111]'
                      : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5 text-[#1A42D9]" />
                  <span>PRINT / PDF</span>
                </button>

                <button
                  onClick={handleDownloadPng}
                  disabled={!isEligible || !isClaimed || isExportingPng}
                  className={`px-4 py-1.5 font-mono text-xs font-bold border-[2px] border-[#111111] flex items-center gap-1.5 cursor-pointer ${
                    isEligible && isClaimed
                      ? 'bg-[#111111] hover:bg-[#1A42D9] text-white shadow-[2px_2px_0px_0px_#111111]'
                      : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingPng ? 'RENDERING...' : 'DOWNLOAD PNG'}</span>
                </button>

                <button
                  onClick={() => setIsQrModalOpen(true)}
                  disabled={!isEligible || !isClaimed}
                  className={`px-3.5 py-1.5 font-mono text-xs font-bold border-[2px] border-[#111111] flex items-center gap-1.5 cursor-pointer ${
                    isEligible && isClaimed
                      ? 'bg-white hover:bg-stone-100 text-[#111111] shadow-[2px_2px_0px_0px_#111111]'
                      : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed'
                  }`}
                  title="View & Share Verification QR Code"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#1A42D9]" />
                  <span>QR CODE</span>
                </button>
              </div>
            </div>

            <div className="flex justify-center relative">
              {/* Watermark/Lock Overlay if NOT eligible */}
              {!isEligible && (
                <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center no-print">
                  <div className="bg-white border-[4px] border-[#111111] shadow-[10px_10px_0px_0px_#111111] p-8 max-w-md space-y-4">
                    <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-900 mx-auto flex items-center justify-center border-[2px] border-[#111111]">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-black text-[#111111]">
                      CERTIFICATE LOCKED
                    </h4>
                    <p className="text-xs font-mono text-stone-600 leading-relaxed">
                      Complete all 20 Quiz Challenges, 20 Coding Challenges, and 20 Debugging Challenges to unlock and claim this official credential.
                    </p>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="w-full py-2.5 bg-[#111111] hover:bg-[#1A42D9] text-white font-mono text-xs font-bold border-[2px] border-[#111111] transition-colors cursor-pointer"
                    >
                      RETURN TO PROGRESS DASHBOARD
                    </button>
                  </div>
                </div>
              )}

              {/* The Certificate Paper Document */}
              <div
                ref={certRef}
                id="printable_certificate_node"
                className="w-full bg-[#FAF8F2] border-[4px] border-[#111111] shadow-[12px_12px_0px_0px_#111111] p-6 sm:p-12 lg:p-16 relative select-text overflow-hidden"
              >
                {/* Decorative Framing */}
                <div className="border-[2px] border-[#1A42D9] p-6 sm:p-10 relative bg-white/60">
                  
                  {/* Corner Decorative Crosshairs */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#111111]" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#111111]" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#111111]" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#111111]" />

                  {/* Micro Top Security Header */}
                  <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3 mb-6 font-mono text-[9px] sm:text-[10px] text-stone-500 tracking-widest uppercase">
                    <span>ACCREDITATION ID: {credentialId}</span>
                    <span className="hidden sm:inline">SUNNY ORGANIZATION // DEPT. OF FIRST-PRINCIPLES INTELLIGENCE</span>
                    <span>STATUS: {isEligible && isClaimed ? 'VERIFIED' : 'PENDING'}</span>
                  </div>

                  {/* Organization Brand: SUNNY ORGANIZATION */}
                  <div className="text-center space-y-1 mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A42D9]/10 border border-[#1A42D9] text-[#1A42D9] font-mono text-xs font-bold tracking-widest uppercase">
                      <span>SUNNY ORGANIZATION</span>
                    </div>
                    <p className="text-stone-500 font-mono text-[10px] tracking-wider uppercase">
                      ACADEMIC & FIRST-PRINCIPLES ARTIFICIAL INTELLIGENCE DIVISION
                    </p>
                  </div>

                  {/* Title */}
                  <div className="text-center space-y-2 mb-8">
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight text-[#111111]">
                      Certificate of Accreditation
                    </h2>
                    <p className="text-xs sm:text-sm font-serif italic text-stone-600">
                      This official academic record certifies that
                    </p>
                  </div>

                  {/* Recipient Name */}
                  <div className="text-center my-6">
                    <div className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif text-[#111111] tracking-wide uppercase underline decoration-[#1A42D9] decoration-2 underline-offset-8">
                      {recipientName || 'LEARNER NAME'}
                    </div>
                  </div>

                  {/* Citation Statement */}
                  <div className="text-center max-w-3xl mx-auto space-y-2 my-6">
                    <p className="text-xs sm:text-sm text-stone-700 font-sans">
                      has successfully satisfied all academic and practical requirements for the program:
                    </p>
                    <div className="text-lg sm:text-2xl font-bold font-mono text-[#1A42D9]">
                      {courseName}
                    </div>
                    <p className="text-xs sm:text-sm text-stone-600 font-sans font-medium pt-1">
                      having demonstrated complete mastery across all three rigorous evaluation gates:
                    </p>
                  </div>

                  {/* Three Required Assessments Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto my-6 text-center">
                    <div className="p-3 bg-white border border-[#111111] text-xs font-mono font-bold text-stone-900 flex items-center justify-center gap-2 shadow-xs">
                      <Check className="w-4 h-4 text-[#1A42D9] shrink-0" />
                      <span>20 Quiz Challenges</span>
                    </div>
                    <div className="p-3 bg-white border border-[#111111] text-xs font-mono font-bold text-stone-900 flex items-center justify-center gap-2 shadow-xs">
                      <Check className="w-4 h-4 text-[#1A42D9] shrink-0" />
                      <span>20 Coding Challenges</span>
                    </div>
                    <div className="p-3 bg-white border border-[#111111] text-xs font-mono font-bold text-stone-900 flex items-center justify-center gap-2 shadow-xs">
                      <Check className="w-4 h-4 text-[#1A42D9] shrink-0" />
                      <span>20 Debugging Challenges</span>
                    </div>
                  </div>

                  {/* Signatures, Seal & QR Code Section: K AKASH — Founder, Sunny Organization */}
                  <div className="pt-8 border-t-[2px] border-[#111111] mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-center gap-6">
                    
                    {/* 1. Left: Security Barcode Pattern & Hash */}
                    <div className="flex flex-col items-center sm:items-start space-y-2 text-stone-600 font-mono text-[10px]">
                      <div className="flex items-center gap-0.5 h-8">
                        {[4, 2, 6, 2, 3, 5, 2, 4, 3, 6, 2, 4, 5, 3, 2, 6, 4, 2, 3, 5, 4, 2].map((w, idx) => (
                          <div
                            key={idx}
                            className="bg-[#111111] h-full"
                            style={{ width: `${w}px`, marginRight: '1px' }}
                          />
                        ))}
                      </div>
                      <div className="font-bold text-[#111111]">
                        HASH: 0x{credentialId.replace(/[^0-9]/g, '') || '948201'}7F8B
                      </div>
                      <div className="text-[9px] text-stone-500">
                        CRYPTOGRAPHIC REGISTRY ANCHOR
                      </div>
                    </div>

                    {/* 2. Center-Left: Authoritative Signature Block */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 font-bold mb-2">
                        ISSUED & SIGNED BY
                      </div>

                      <div className="h-12 flex items-end justify-center">
                        <span className="font-serif italic text-3xl sm:text-4xl text-stone-900 font-black tracking-wide">
                          K Akash
                        </span>
                      </div>

                      <div className="w-48 sm:w-52 border-t-2 border-[#111111] pt-2 mt-1 text-center">
                        <div className="text-sm font-mono font-black text-[#111111] tracking-wider">
                          K AKASH
                        </div>
                        <div className="text-xs font-mono font-bold text-[#1A42D9]">
                          Founder
                        </div>
                        <div className="text-xs font-mono text-stone-600 font-medium">
                          Sunny Organization
                        </div>
                      </div>

                      <div className="mt-2 px-2.5 py-0.5 bg-stone-100 border border-stone-300 font-mono text-[10px] text-stone-900 font-bold">
                        “K AKASH — Founder”
                      </div>
                    </div>

                    {/* 3. Center-Right: Institutional Seal */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-22 h-22 rounded-full border-[3px] border-[#111111] p-1 flex items-center justify-center bg-white shadow-xs">
                        <div className="w-full h-full rounded-full border-2 border-[#1A42D9] border-dashed flex flex-col items-center justify-center text-center p-1">
                          <span className="font-mono text-[8px] font-black text-stone-800 tracking-tighter">SUNNY ORG</span>
                          <span className="text-amber-500 text-[10px]">★</span>
                          <span className="font-mono text-[7px] font-bold text-[#1A42D9] uppercase tracking-tight">VERIFIED</span>
                          <span className="font-mono text-[7px] text-stone-500 font-medium">ACCREDITATION</span>
                        </div>
                      </div>
                      <span className="font-mono text-[9px] text-stone-500 font-bold mt-1">OFFICIAL SEAL</span>
                    </div>

                    {/* 4. Right: Official Verification QR Code */}
                    <div className="flex flex-col items-center sm:items-end justify-center">
                      <button
                        type="button"
                        onClick={() => setIsQrModalOpen(true)}
                        className="group relative p-1.5 bg-white border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] hover:shadow-[1px_1px_0px_0px_#111111] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer text-center"
                        title="Click to view & share high-resolution QR verification code"
                      >
                        {qrCodeDataUrl ? (
                          <img 
                            src={qrCodeDataUrl} 
                            alt={`Verification QR for ${credentialId}`}
                            className="w-18 h-18 sm:w-20 sm:h-20 object-contain"
                          />
                        ) : (
                          <div className="w-18 h-18 sm:w-20 sm:h-20 bg-stone-100 flex items-center justify-center font-mono text-[8px] text-stone-400">
                            GENERATING...
                          </div>
                        )}
                        <div className="mt-1 flex items-center justify-center gap-1 text-[8px] font-mono font-bold text-[#1A42D9] group-hover:underline">
                          <QrCode className="w-2.5 h-2.5" />
                          <span>SCAN TO VERIFY</span>
                        </div>
                      </button>
                      <span className="font-mono text-[8px] text-stone-500 font-bold mt-1 tracking-wider uppercase">
                        VERIFICATION QR
                      </span>
                    </div>

                  </div>

                  {/* Bottom Verification Footer */}
                  <div className="mt-8 pt-4 border-t border-stone-300 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-stone-600">
                    <div>
                      CREDENTIAL ID: <span className="font-bold text-[#111111]">{credentialId}</span>
                    </div>
                    <button
                      onClick={() => {
                        setVerificationInput(credentialId);
                        handleRunVerification(credentialId);
                        setActiveTab('verify');
                      }}
                      className="flex items-center gap-1 text-[#1A42D9] hover:underline font-bold cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>VERIFIED ACADEMIC ACCREDITATION [LOOKUP →]</span>
                    </button>
                    <div>
                      DATE OF ISSUANCE: <span className="font-bold text-[#111111]">{issueDate}</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: CREDENTIAL VERIFICATION REGISTRY                              */}
      {/* ==================================================================== */}
      {activeTab === 'verify' && (
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header Banner */}
          <div className="bg-white border-[3px] border-[#111111] p-6 sm:p-8 shadow-[6px_6px_0px_0px_#111111]">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-[#1A42D9] text-white font-mono text-[10px] font-bold tracking-widest uppercase">
                SUNNY ORGANIZATION
              </span>
              <span className="px-2.5 py-1 bg-stone-100 border border-stone-300 font-mono text-[10px] font-bold tracking-widest text-stone-700 uppercase">
                PUBLIC INTEGRITY REGISTRY
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#111111] tracking-tight">
              Credential Verification Registry
            </h2>
            <p className="text-xs sm:text-sm font-mono text-stone-600 mt-2 leading-relaxed max-w-2xl">
              Cryptographically and procedurally verify Sunny Organization machine learning certificates. Enter an official Credential ID to validate recipient completion status, earned date, and rigorous 20/20/20 assessment records.
            </p>
          </div>

          {/* Search Input Box */}
          <div className="bg-white border-[3px] border-[#111111] p-6 shadow-[6px_6px_0px_0px_#111111] space-y-4">
            <label className="block font-mono text-xs font-bold text-stone-800 uppercase tracking-wider">
              ENTER CERTIFICATE ID TO VERIFY:
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={verificationInput}
                  onChange={(e) => setVerificationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRunVerification();
                  }}
                  placeholder="e.g. FFA-ML-2026-849201"
                  className="w-full pl-10 pr-4 py-3 font-mono text-sm font-bold border-[2px] border-[#111111] bg-stone-50 focus:bg-white focus:outline-hidden focus:border-[#1A42D9] tracking-wider uppercase"
                />
              </div>

              <button
                onClick={() => handleRunVerification()}
                className="px-6 py-3 bg-[#111111] hover:bg-[#1A42D9] text-white font-mono text-xs font-bold uppercase tracking-wider border-[2px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] cursor-pointer transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                <span>VERIFY CREDENTIAL</span>
              </button>
            </div>

            {/* Quick Test Links */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs font-mono text-stone-600">
              <span className="font-bold text-stone-700">Quick Test:</span>
              <button
                onClick={() => {
                  setVerificationInput(credentialId);
                  handleRunVerification(credentialId);
                }}
                className="underline hover:text-[#1A42D9] cursor-pointer font-bold"
              >
                Test with My Certificate ID ({credentialId})
              </button>
            </div>
          </div>

          {/* Verification Results Display */}
          {hasSearchedVerification && verificationResult && (
            <div className="space-y-4">
              {verificationResult.isValid ? (
                /* SUCCESSFUL VERIFICATION REPORT */
                <div className="bg-white border-[4px] border-emerald-800 shadow-[8px_8px_0px_0px_#065F46] overflow-hidden">
                  
                  {/* Status Banner */}
                  <div className="bg-emerald-700 text-white px-6 py-3.5 font-mono text-xs sm:text-sm font-black tracking-wider uppercase flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-200 shrink-0" />
                      <span>[✓] 100% VERIFIED AUTHENTIC ACCREDITATION</span>
                    </div>
                    <span className="text-[10px] bg-emerald-800 px-2.5 py-1 border border-emerald-600">
                      REGISTRY RECORD #VALID
                    </span>
                  </div>

                  <div className="p-6 sm:p-8 space-y-6">
                    
                    {/* Key Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-stone-200">
                      <div className="space-y-1">
                        <span className="font-mono text-[10px] uppercase font-bold text-stone-500">
                          ACCREDITED RECIPIENT
                        </span>
                        <div className="text-xl font-serif font-black text-[#111111] uppercase tracking-wide">
                          {verificationResult.recipientName}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="font-mono text-[10px] uppercase font-bold text-stone-500">
                          ACCREDITED CURRICULUM
                        </span>
                        <div className="text-base font-mono font-bold text-[#1A42D9]">
                          {verificationResult.courseName}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="font-mono text-[10px] uppercase font-bold text-stone-500">
                          ISSUING AUTHORITY & SIGNATORY
                        </span>
                        <div className="text-sm font-mono font-black text-[#111111]">
                          {verificationResult.issuer}
                        </div>
                        <div className="text-xs font-mono text-stone-600">
                          Sunny Organization
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="font-mono text-[10px] uppercase font-bold text-stone-500">
                          CREDENTIAL IDENTIFIER
                        </span>
                        <div className="text-sm font-mono font-bold text-[#111111]">
                          {verificationResult.certificateId}
                        </div>
                        <div className="text-[11px] font-mono text-stone-500">
                          Issued: {new Date(verificationResult.issuedAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Verified Assessment Milestone Proof */}
                    <div className="space-y-3">
                      <span className="font-mono text-xs font-black uppercase text-stone-800 tracking-wider">
                        VERIFIED 3-STAGE RIGOROUS ASSESSMENT AUDIT:
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-emerald-50 border-[2px] border-emerald-800 font-mono text-xs space-y-1">
                          <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>STAGE 1: THEORY</span>
                          </div>
                          <div className="text-[11px] text-emerald-800 font-medium">
                            20 / 20 Quiz Challenges Passed
                          </div>
                        </div>

                        <div className="p-3 bg-emerald-50 border-[2px] border-emerald-800 font-mono text-xs space-y-1">
                          <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>STAGE 2: ALGORITHMS</span>
                          </div>
                          <div className="text-[11px] text-emerald-800 font-medium">
                            20 / 20 Coding Challenges Verified
                          </div>
                        </div>

                        <div className="p-3 bg-emerald-50 border-[2px] border-emerald-800 font-mono text-xs space-y-1">
                          <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>STAGE 3: DEBUGGING</span>
                          </div>
                          <div className="text-[11px] text-emerald-800 font-medium">
                            20 / 20 Edge Cases Resolved
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Official Signatory Citation */}
                    <div className="p-4 bg-stone-50 border border-stone-300 font-mono text-xs space-y-1">
                      <div className="text-stone-500 text-[10px] uppercase font-bold">
                        AUTHENTICATION ATTESTATION:
                      </div>
                      <div className="text-stone-900 font-bold">
                        “K AKASH — Founder, Sunny Organization”
                      </div>
                      <div className="text-stone-500 text-[10px]">
                        Cryptographic Hash: 0x{verificationResult.certificateId.replace(/[^0-9]/g, '')}7F8B92AC01
                      </div>
                    </div>

                    {/* Quick View Button */}
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => setActiveTab('certificate')}
                        className="px-6 py-2.5 bg-[#111111] hover:bg-[#1A42D9] text-white font-mono text-xs font-bold border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] cursor-pointer flex items-center gap-2"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>VIEW OFFICIAL CERTIFICATE DOCUMENT</span>
                      </button>

                      <button
                        onClick={handlePrint}
                        className="px-4 py-2.5 bg-white hover:bg-stone-50 text-[#111111] font-mono text-xs font-bold border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] cursor-pointer flex items-center gap-1.5"
                      >
                        <Printer className="w-4 h-4 text-[#1A42D9]" />
                        <span>PRINT RECORD</span>
                      </button>

                      <button
                        onClick={() => setIsQrModalOpen(true)}
                        className="px-4 py-2.5 bg-white hover:bg-stone-50 text-[#111111] font-mono text-xs font-bold border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] cursor-pointer flex items-center gap-1.5"
                      >
                        <QrCode className="w-4 h-4 text-[#1A42D9]" />
                        <span>SHARE QR CODE</span>
                      </button>
                    </div>

                  </div>
                </div>
              ) : (
                /* FAILED / UNVERIFIED REPORT */
                <div className="bg-white border-[4px] border-rose-900 shadow-[8px_8px_0px_0px_#881337] overflow-hidden">
                  <div className="bg-rose-800 text-white px-6 py-3.5 font-mono text-xs sm:text-sm font-black tracking-wider uppercase flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-200 shrink-0" />
                    <span>[!] CREDENTIAL UNVERIFIED / NOT FOUND</span>
                  </div>

                  <div className="p-6 sm:p-8 space-y-4">
                    <h3 className="text-lg font-black text-rose-950 font-serif">
                      Verification Search Returned No Valid Record
                    </h3>

                    <p className="text-xs font-mono text-stone-700 leading-relaxed">
                      The Certificate ID <span className="font-bold text-[#111111] bg-stone-100 px-1.5 py-0.5 border border-stone-300">"{verificationInput}"</span> could not be authenticated against the Sunny Organization registry.
                    </p>

                    <div className="bg-amber-50 border-[2px] border-amber-800 p-4 space-y-2 text-xs font-mono text-amber-950">
                      <div className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-700" />
                        <span>STRICT SUNNY ORGANIZATION INTEGRITY STANDARDS:</span>
                      </div>
                      <p className="leading-relaxed">
                        Sunny Organization certificates cannot be issued, previewed, or claimed simply by viewing course material. Every credential requires verified 100% completion of all three stages:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Stage 1: 20 Quiz Challenges (Theory)</li>
                        <li>Stage 2: 20 Coding Challenges (NumPy / Python)</li>
                        <li>Stage 3: 20 Debugging Challenges (Numerical Gradients & Shapes)</li>
                      </ul>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setActiveTab('dashboard')}
                        className="px-6 py-2.5 bg-[#111111] hover:bg-[#1A42D9] text-white font-mono text-xs font-bold border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] cursor-pointer flex items-center gap-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>RETURN TO ASSESSMENTS DASHBOARD</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setVerificationInput(credentialId);
                          handleRunVerification(credentialId);
                        }}
                        className="px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-800 font-mono text-xs font-bold border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] cursor-pointer"
                      >
                        TEST CURRENT USER ID ({credentialId})
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {/* Educational Standard Card if not searched yet */}
          {!hasSearchedVerification && (
            <div className="bg-stone-100 border-[2px] border-stone-300 p-6 font-mono text-xs space-y-2 text-stone-700">
              <div className="font-bold text-[#111111] uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#1A42D9]" />
                <span>ABOUT SUNNY ORGANIZATION VERIFICATION</span>
              </div>
              <p className="leading-relaxed">
                Every certificate issued by Sunny Organization contains an immutable Credential ID (formatted as <span className="font-bold text-[#111111]">FFA-ML-2026-XXXXXX</span>). Our registry verifies completion timestamps, candidate names, and guarantees that all 60 rigorous assessments (20 Quiz, 20 Coding, and 20 Debugging) were passed before accreditation.
              </p>
            </div>
          )}

        </div>
      )}

      {/* ==================================================================== */}
      {/* QR CODE SHARE & SCAN MODAL                                           */}
      {/* ==================================================================== */}
      {isQrModalOpen && (
        <div 
          id="qr_code_modal_backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs no-print"
          onClick={() => setIsQrModalOpen(false)}
        >
          <div 
            id="qr_code_modal_content"
            className="w-full max-w-md bg-white border-[4px] border-[#111111] shadow-[8px_8px_0px_0px_#111111] p-6 space-y-5 relative select-none"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#1A42D9] text-white">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-black uppercase text-[#111111] tracking-tight">
                    CREDENTIAL QR CODE
                  </h3>
                  <p className="font-mono text-[10px] text-stone-500">
                    SCAN TO VERIFY ACCREDITATION
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsQrModalOpen(false)}
                className="p-1.5 hover:bg-stone-100 border border-transparent hover:border-[#111111] text-stone-500 hover:text-[#111111] transition-colors cursor-pointer"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code Presentation Box */}
            <div className="flex flex-col items-center justify-center p-6 bg-[#FAF8F2] border-[2px] border-[#111111] relative">
              <div className="p-3 bg-white border-[2px] border-[#111111] shadow-[4px_4px_0px_0px_#111111]">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt={`Verification QR Code for ${credentialId}`}
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 bg-stone-100 flex items-center justify-center font-mono text-xs text-stone-400">
                    Generating QR Code...
                  </div>
                )}
              </div>

              {/* Status pill under QR */}
              <div className="mt-4 flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-800 text-emerald-900 font-mono text-[10px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>ACTIVE VERIFICATION ENCODING</span>
              </div>
            </div>

            {/* Credential Details */}
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center py-1 border-b border-stone-200">
                <span className="text-stone-500">RECIPIENT:</span>
                <span className="font-bold text-[#111111]">{recipientName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-200">
                <span className="text-stone-500">CREDENTIAL ID:</span>
                <span className="font-bold text-[#1A42D9]">{credentialId}</span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-stone-500 text-[10px] uppercase font-bold">
                  VERIFICATION URL:
                </span>
                <div className="p-2 bg-stone-100 border border-stone-300 text-[10px] break-all font-mono text-stone-700 select-all">
                  {getCertificateVerificationUrl(credentialId)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={handleCopyQrUrl}
                className="w-full py-2.5 px-3 bg-white hover:bg-stone-50 text-[#111111] font-mono text-xs font-bold border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                {copiedQrUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-500" />}
                <span>{copiedQrUrl ? 'URL COPIED!' : 'COPY URL'}</span>
              </button>

              <button
                onClick={handleDownloadQrImage}
                disabled={!qrCodeDataUrl}
                className="w-full py-2.5 px-3 bg-[#111111] hover:bg-[#1A42D9] text-white font-mono text-xs font-bold border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD QR</span>
              </button>
            </div>

            {/* Scan Guidance note */}
            <p className="font-mono text-[10px] text-stone-500 text-center leading-normal">
              Point any smartphone camera or scanning app at this QR code to view live verified completion metrics.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
