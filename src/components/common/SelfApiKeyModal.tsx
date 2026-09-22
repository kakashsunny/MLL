import React, { useState, useEffect } from 'react';
import { 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Trash2, 
  ShieldCheck, 
  Sparkles,
  Loader2,
  X
} from 'lucide-react';
import { 
  getCustomGeminiKey, 
  setCustomGeminiKey, 
  validateCustomGeminiKey 
} from '../../services/geminiService';

interface SelfApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SelfApiKeyModal: React.FC<SelfApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showKeyText, setShowKeyText] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Sync with current stored key when modal opens
  useEffect(() => {
    if (isOpen) {
      const existingKey = getCustomGeminiKey();
      setApiKeyInput(existingKey);
      setStatusMessage(
        existingKey
          ? { type: 'success', text: 'Active Self API Key loaded from local browser storage.' }
          : null
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      setStatusMessage({ type: 'error', text: 'Please paste a Gemini API key first to validate.' });
      return;
    }

    setIsValidating(true);
    setStatusMessage(null);

    const result = await validateCustomGeminiKey(trimmed);
    setIsValidating(false);

    if (result.valid) {
      setStatusMessage({ 
        type: 'success', 
        text: '✓ Key Verified! Successfully established live inference session with Gemini 3.8 Flash.' 
      });
    } else {
      setStatusMessage({ 
        type: 'error', 
        text: `Validation Failed: ${result.error || 'Please ensure the API key is active in Google AI Studio.'}` 
      });
    }
  };

  const handleSave = () => {
    const trimmed = apiKeyInput.trim();
    setCustomGeminiKey(trimmed);
    if (trimmed) {
      setStatusMessage({ 
        type: 'success', 
        text: '✓ Self API Key saved! All chat bots, tutors, and code auditors will now use your key.' 
      });
    } else {
      setStatusMessage({ 
        type: 'info', 
        text: '✓ Cleared. Reset to NeuraForge built-in platform gateway.' 
      });
    }
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setApiKeyInput('');
    setCustomGeminiKey('');
    setStatusMessage({ 
      type: 'info', 
      text: '✓ Self API key removed. Reverted to built-in platform gateway.' 
    });
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const isSelfKeyActive = !!getCustomGeminiKey();

  return (
    <div 
      id="self_api_key_modal_backdrop" 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs overflow-y-auto p-3 sm:p-4 flex items-start sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="self_api_key_modal_dialog"
        className="w-full max-w-lg max-h-[92vh] flex flex-col bg-[#FAF8F2] border-[3px] border-[#111111] shadow-[8px_8px_0px_0px_#111111] select-none my-auto"
      >
        {/* Header - Fixed/Sticky at top of dialog */}
        <div className="flex items-center justify-between border-b-[2px] border-[#111111] px-4 sm:px-5 py-3 bg-[#FAF8F2] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-[#111111] text-white flex items-center justify-center border border-[#111111] shadow-[2px_2px_0px_0px_#1A42D9]">
              <Key className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold font-mono text-[#111111] tracking-tight flex items-center gap-2">
                <span>Self Gemini API Key (BYOK)</span>
              </h2>
              <p className="text-[10px] sm:text-[11px] font-mono text-stone-600">
                Direct AI access across all bots, mentors & code auditors
              </p>
            </div>
          </div>

          <button
            id="close_self_api_key_modal_btn"
            onClick={onClose}
            className="p-1.5 hover:bg-stone-200 border-[1.5px] border-[#111111] text-stone-800 transition-colors bg-white"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto px-4 sm:px-5 py-3.5 space-y-3">
          {/* Current Status Indicator */}
          <div className="flex items-center justify-between p-2.5 bg-white border-[2px] border-[#111111] text-xs font-mono">
            <span className="text-stone-600 font-bold uppercase text-[10px]">CURRENT ROUTE:</span>
            <div className="flex items-center gap-1.5 font-bold">
              {isSelfKeyActive ? (
                <span className="text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Self API Key Active (BYOK)</span>
                </span>
              ) : (
                <span className="text-[#1A42D9] flex items-center gap-1.5 bg-blue-50 px-2 py-0.5 border border-blue-200">
                  <span className="w-2 h-2 rounded-full bg-[#1A42D9]" />
                  <span>Built-in Platform Gateway (Default)</span>
                </span>
              )}
            </div>
          </div>

          {/* Description & Scope */}
          <div className="text-xs text-stone-700 leading-relaxed font-sans space-y-1">
            <p>
              Provide your personal <strong>Google AI Studio Gemini API Key</strong>. When configured, all chat bots and assistants connect directly using your key with no shared rate limits:
            </p>
            <ul className="grid grid-cols-2 gap-1 text-[10px] sm:text-[11px] font-mono text-stone-600 pt-0.5">
              <li className="flex items-center gap-1">
                <span className="text-[#1A42D9]">▸</span> Forge AI Socratic Tutor
              </li>
              <li className="flex items-center gap-1">
                <span className="text-[#1A42D9]">▸</span> Course Lesson Chatbot
              </li>
              <li className="flex items-center gap-1">
                <span className="text-[#1A42D9]">▸</span> Syntax Assistant
              </li>
              <li className="flex items-center gap-1">
                <span className="text-[#1A42D9]">▸</span> Jupyter Code Explainer
              </li>
              <li className="flex items-center gap-1">
                <span className="text-[#1A42D9]">▸</span> Code Auditor & REPL
              </li>
              <li className="flex items-center gap-1">
                <span className="text-[#1A42D9]">▸</span> Bar Raiser Interviewer
              </li>
            </ul>
          </div>

          {/* Key Input Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <label htmlFor="self_api_key_input" className="font-bold text-stone-900">Gemini API Key:</label>
              <a 
                href="https://aistudio.google.com/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#1A42D9] hover:underline flex items-center gap-1 text-[11px] font-bold"
              >
                <span>Get Free Key at Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative flex items-center">
              <input
                id="self_api_key_input"
                aria-label="Gemini API Key input"
                type={showKeyText ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-3 pr-10 py-2 bg-white border-[2px] border-[#111111] font-mono text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#1A42D9]"
              />
              <button
                type="button"
                onClick={() => setShowKeyText(!showKeyText)}
                className="absolute right-2.5 p-1 text-stone-500 hover:text-stone-900 cursor-pointer"
                title={showKeyText ? 'Hide API Key' : 'Show API Key'}
                aria-label={showKeyText ? 'Hide API Key' : 'Show API Key'}
              >
                {showKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Status / Feedback message */}
          {statusMessage && (
            <div 
              className={`p-2 text-xs font-mono border flex items-start gap-2 ${
                statusMessage.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                  : statusMessage.type === 'error'
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-blue-50 border-blue-300 text-blue-800'
              }`}
            >
              {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              {statusMessage.type === 'info' && <Sparkles className="w-4 h-4 text-[#1A42D9] shrink-0 mt-0.5" />}
              <span className="leading-snug">{statusMessage.text}</span>
            </div>
          )}

          {/* Security Notice */}
          <div className="p-2 bg-stone-100 border border-stone-300 text-[10px] sm:text-[11px] font-mono text-stone-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              Your API key is saved exclusively in your browser's private <code className="bg-stone-200 px-1 py-0.5 rounded text-[10px]">localStorage</code>. It is proxied strictly to Google Gemini API over HTTPS.
            </span>
          </div>
        </div>

        {/* Action Controls - Fixed at bottom of dialog */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 border-t-[2px] border-[#111111] bg-[#FAF8F2] shrink-0">
          <div className="flex items-center gap-2">
            {isSelfKeyActive && (
              <button
                onClick={handleClear}
                className="px-2.5 py-1.5 text-xs font-mono text-stone-600 hover:text-rose-700 hover:bg-rose-50 border border-stone-300 hover:border-rose-300 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear & Reset</span>
                <span className="sm:hidden">Reset</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-mono text-stone-600 hover:bg-stone-200 border border-stone-300 bg-white"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestKey}
              disabled={isValidating || !apiKeyInput.trim()}
              className="px-3 py-1.5 text-xs font-mono font-bold bg-white hover:bg-stone-100 text-stone-800 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 flex items-center gap-1.5"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1A42D9]" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Test Key</span>
                </>
              )}
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-mono font-bold bg-[#111111] hover:bg-[#1A42D9] text-white border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-colors"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
