import React, { useState, useEffect } from 'react';
import { Key, Sparkles } from 'lucide-react';
import { getCustomGeminiKey } from '../../services/geminiService';
import { SelfApiKeyModal } from './SelfApiKeyModal';

interface SelfApiKeyButtonProps {
  variant?: 'default' | 'compact' | 'pill' | 'dark';
  className?: string;
  label?: string;
}

export const SelfApiKeyButton: React.FC<SelfApiKeyButtonProps> = ({
  variant = 'default',
  className = '',
  label
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSelfKey, setHasSelfKey] = useState<boolean>(() => !!getCustomGeminiKey());

  useEffect(() => {
    const handleKeyUpdate = () => {
      setHasSelfKey(!!getCustomGeminiKey());
    };

    window.addEventListener('neuraforge_gemini_key_updated', handleKeyUpdate);
    window.addEventListener('storage', handleKeyUpdate);

    return () => {
      window.removeEventListener('neuraforge_gemini_key_updated', handleKeyUpdate);
      window.removeEventListener('storage', handleKeyUpdate);
    };
  }, []);

  const defaultLabel = hasSelfKey ? 'Self Key: Active' : (label || 'Self API Key');

  if (variant === 'compact') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          title={hasSelfKey ? 'Self API Key Active (BYOK) - Click to manage' : 'Configure Self Gemini API Key'}
          className={`px-2 py-1 text-[11px] font-mono border-[1.5px] border-[#111111] shadow-[1px_1px_0px_0px_#111111] flex items-center gap-1.5 transition-colors cursor-pointer ${
            hasSelfKey
              ? 'bg-emerald-50 text-emerald-900 font-bold hover:bg-emerald-100'
              : 'bg-white text-stone-700 hover:bg-stone-100 font-semibold'
          } ${className}`}
        >
          <Key className={`w-3 h-3 ${hasSelfKey ? 'text-emerald-700' : 'text-[#1A42D9]'}`} />
          <span>{hasSelfKey ? 'Self Key ✓' : (label || 'Self Key')}</span>
        </button>
        <SelfApiKeyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  if (variant === 'pill') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          title={hasSelfKey ? 'Self API Key Active (BYOK) - Click to manage' : 'Configure Self Gemini API Key'}
          className={`px-2.5 py-1 text-xs font-mono rounded-full border flex items-center gap-1.5 transition-all cursor-pointer ${
            hasSelfKey
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold hover:bg-emerald-100 shadow-2xs'
              : 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200'
          } ${className}`}
        >
          <Key className={`w-3 h-3 ${hasSelfKey ? 'text-emerald-600' : 'text-[#1A42D9]'}`} />
          <span>{defaultLabel}</span>
        </button>
        <SelfApiKeyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  if (variant === 'dark') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          title={hasSelfKey ? 'Self API Key Active (BYOK) - Click to manage' : 'Configure Self Gemini API Key'}
          className={`px-2.5 py-1 text-[11px] font-mono border border-stone-700 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
            hasSelfKey
              ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 font-bold'
              : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
          } ${className}`}
        >
          <Key className={`w-3 h-3 ${hasSelfKey ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span>{defaultLabel}</span>
        </button>
        <SelfApiKeyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        title={hasSelfKey ? 'Self API Key Active (BYOK) - Click to manage' : 'Configure Self Gemini API Key'}
        className={`px-2.5 py-1.5 rounded-none border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] text-xs font-mono font-bold flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer ${
          hasSelfKey
            ? 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
            : 'bg-white text-stone-800 hover:bg-stone-100'
        } ${className}`}
      >
        <Key className={`w-3.5 h-3.5 ${hasSelfKey ? 'text-emerald-700' : 'text-[#1A42D9]'}`} />
        <span>{defaultLabel}</span>
      </button>
      <SelfApiKeyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
