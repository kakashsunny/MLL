import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  BrainCircuit, 
  Lightbulb, 
  Bug, 
  MessageSquareCode, 
  Flame, 
  Compass, 
  Terminal, 
  RotateCcw,
  Bot,
  Key
} from 'lucide-react';
import { askAITutor, getCustomGeminiKey, setCustomGeminiKey } from '../../services/geminiService';
import { cleanPlainText, parseFormattedBlocks } from '../../utils/textFormatter';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: string;
}

export const ForgeAITutor: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<string>('teach');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init_1',
      role: 'assistant',
      content: cleanPlainText(`Welcome! I am Forge AI, your interactive Machine Learning and Python coding mentor.

Unlike standard chatbots that simply generate static answers, my mission is to build genuine intuition in your mind through first-principles questioning, geometric analogies, and guided inquiry.

Say hello, ask any ML/math question, or paste Python code to get started!`)
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Custom API Key modal state
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>(getCustomGeminiKey());
  const [keySavedMsg, setKeySavedMsg] = useState<string>('');

  const modes = [
    { id: 'teach', label: '🧠 Socratic Teach', desc: 'Guided inquiry step-by-step' },
    { id: 'hint', label: '🎯 Hint Mode', desc: 'Gentle nudges without spoiling' },
    { id: 'example', label: '🧪 Real Example', desc: 'Production physics analogies' },
    { id: 'explain', label: '🔍 Geometric Intuition', desc: 'Visual mathematical breakdown' },
    { id: 'debug', label: '💻 Audit Code', desc: 'Dimensional tensor analysis' },
    { id: 'interview', label: '🎤 Bar Raiser Drill', desc: 'FAANG technical interrogation' },
    { id: 'challenge', label: '🔥 Edge Case Challenge', desc: 'Subtle failure modes' },
  ];

  const starters = [
    'Why does L1 regularization cause sparsity while L2 does not?',
    'Explain Self-Attention using a physical dinner party conversation analogy',
    'Why do deep networks suffer from vanishing gradients in sigmoid activations?',
    'How do I decide between XGBoost and a Deep Neural Network on tabular data?',
    'What is the practical difference between Data Drift and Concept Drift in production?'
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputVal;
    if (!textToSend.trim() || isLoading) return;

    const cleanInput = textToSend.trim();
    const userMsg: Message = {
      id: String(Date.now()),
      role: 'user',
      content: cleanInput,
      mode: selectedMode
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputVal('');
    setIsLoading(true);

    try {
      const modeObj = modes.find(m => m.id === selectedMode);
      const isGreeting = /^(hi|hello|hey|greetings|hola|yo|good (morning|afternoon|evening))\b/i.test(cleanInput.toLowerCase());

      const res = await askAITutor(
        cleanInput,
        isGreeting ? 'Greeting' : 'Machine Learning & Python Systems',
        `Current Mode: ${modeObj?.label}. 
IMPORTANT: If the user greeted you, greet them warmly in return and ask how you can help. If they ask about syntax, ML theory, or code, provide crisp intuition. STRICT RULE: Do not use # or ## or ### headers. Do not use ** for bold. Use plain text section headers in UPPERCASE.`,
        selectedMode,
        messages.map(m => ({ role: m.role, content: m.content }))
      );

      const aiMsg: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: cleanPlainText(res),
        mode: selectedMode
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: cleanPlainText(`Hello! I'm active and listening. What algorithm, syntax pattern, or concept would you like to investigate?`)
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'reset_init',
        role: 'assistant',
        content: `Dialogue reset. Which machine learning concept or mathematical structure shall we dissect next?`
      }
    ]);
  };

  return (
    <div id="forge_ai_tutor_view" className="p-6 sm:p-10 max-w-5xl mx-auto h-[calc(100vh-5rem)] flex flex-col space-y-6 select-none bg-[#F7F5EF] text-[#111111]">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E2D9] pb-6 shrink-0">
        <div>
          <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1A42D9]" />
            <span>Socratic Pedagogy • Gemini AI Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
            Forge AI — Socratic ML Mentor
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Intuition-first interactive reasoning engine designed to sharpen mathematical defenses.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="tutor_key_config_btn"
            onClick={() => {
              setTempApiKey(getCustomGeminiKey());
              setShowKeyModal(true);
            }}
            className="px-3 py-1.5 rounded bg-white hover:bg-stone-50 border border-[#E5E2D9] text-xs font-mono text-stone-700 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Key className="w-3.5 h-3.5 text-[#1A42D9]" />
            <span>{getCustomGeminiKey() ? 'Custom Key Active' : 'API Key'}</span>
          </button>

          <button
            onClick={handleResetChat}
            className="px-3.5 py-1.5 rounded bg-white hover:bg-stone-50 border border-[#E5E2D9] text-xs font-mono text-stone-700 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
            <span>New Session</span>
          </button>
        </div>
      </div>

      {/* 2. Mode Selector Ribbon */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 max-w-full">
        {modes.map(m => (
          <button
            key={m.id}
            id={`tutor_mode_${m.id}`}
            onClick={() => setSelectedMode(m.id)}
            className={`px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap transition-all border ${
              selectedMode === m.id
                ? 'bg-[#111111] text-white border-[#111111] font-bold shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-50 border-[#E5E2D9]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* 3. Messages Log */}
      <div className="flex-1 overflow-y-auto p-6 rounded-xl bg-white border border-[#E5E2D9] space-y-4 shadow-xs">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#1A42D9]/10 border border-[#1A42D9]/20 text-[#1A42D9] flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl p-5 rounded-xl text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#111111] text-white rounded-br-none'
                  : 'bg-[#FAF8F2] border border-[#E5E2D9] text-stone-800 rounded-bl-none'
              }`}
            >
              {msg.mode && (
                <div className="text-[10px] font-mono uppercase tracking-wider mb-2 font-bold text-[#1A42D9]">
                  Pedagogy: {modes.find(m => m.id === msg.mode)?.label}
                </div>
              )}
              
              {msg.role === 'user' ? (
                <div className="text-xs sm:text-sm text-white font-medium whitespace-pre-wrap leading-relaxed select-text">
                  {msg.content}
                </div>
              ) : (
                <div className="space-y-3 font-sans select-text">
                  {parseFormattedBlocks(msg.content).map((block, idx) => {
                    if (block.type === 'heading') {
                      return (
                        <div key={idx} className="font-mono text-xs uppercase font-bold tracking-wider text-[#1A42D9] pt-1 border-b border-[#E5E2D9] pb-1">
                          {block.content}
                        </div>
                      );
                    }
                    if (block.type === 'bullet') {
                      return (
                        <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm pl-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1A42D9] mt-2 shrink-0" />
                          <span className="text-stone-700">{block.content}</span>
                        </div>
                      );
                    }
                    if (block.type === 'label_value') {
                      return (
                        <div key={idx} className="p-2 rounded bg-white/70 border border-[#E5E2D9] text-xs">
                          <span className="font-mono font-bold text-[#111111]">{block.label}: </span>
                          <span className="text-stone-700">{block.value}</span>
                        </div>
                      );
                    }
                    if (block.type === 'code') {
                      return (
                        <div key={idx} className="rounded-lg bg-[#111111] text-[#22C55E] p-3 font-mono text-xs overflow-x-auto border border-stone-800">
                          <div className="text-[10px] text-stone-400 mb-1 uppercase font-bold tracking-widest">{block.codeLang || 'PYTHON'}</div>
                          <pre>{block.content}</pre>
                        </div>
                      );
                    }
                    return (
                      <p key={idx} className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                        {block.content}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1A42D9]/10 border border-[#1A42D9]/20 text-[#1A42D9] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F2] border border-[#E5E2D9] text-xs text-stone-600 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1A42D9] animate-pulse" />
              <span>Forge AI is constructing Socratic inquiry...</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Suggested Starters */}
      {messages.length <= 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 text-xs">
          <span className="text-[10px] font-mono text-stone-400 uppercase font-bold whitespace-nowrap">Try:</span>
          {starters.map((starter, i) => (
            <button
              key={i}
              onClick={() => handleSend(starter)}
              className="px-3 py-1.5 rounded bg-white hover:bg-stone-50 text-stone-700 hover:text-[#111111] border border-[#E5E2D9] whitespace-nowrap text-xs transition-colors font-mono shadow-xs"
            >
              {starter}
            </button>
          ))}
        </div>
      )}

      {/* 5. Input Bar */}
      <div className="p-2 rounded-xl bg-white border border-[#E5E2D9] flex items-center gap-2 shrink-0 shadow-xs">
        <input
          id="forge_ai_input"
          type="text"
          placeholder="Ask a question, paste code to debug, or request an interview problem..."
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-[#111111] placeholder:text-stone-400 focus:outline-none font-mono"
        />
        <button
          id="forge_ai_send_btn"
          disabled={isLoading || !inputVal.trim()}
          onClick={() => handleSend()}
          className="px-5 py-2 rounded bg-[#111111] hover:bg-[#1A42D9] disabled:opacity-40 text-white font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6. Custom API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#111111] shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#1A42D9]" />
                <h3 className="font-extrabold text-base text-[#111111]">Gemini API Key</h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-stone-400 hover:text-[#111111] font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              If you have your own Google Gemini API key, you can paste it below. It will be stored locally in your browser so you get direct dynamic responses without waiting for gateway recovery.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-stone-700">API Key</label>
              <input
                type="password"
                value={tempApiKey}
                onChange={e => setTempApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 bg-[#FAF8F2] border border-[#111111] font-mono text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#1A42D9]"
              />
            </div>

            {keySavedMsg && (
              <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2">
                {keySavedMsg}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setTempApiKey('');
                  setCustomGeminiKey('');
                  setKeySavedMsg('✓ Reset to platform gateway.');
                  setTimeout(() => {
                    setKeySavedMsg('');
                    setShowKeyModal(false);
                  }, 1000);
                }}
                className="text-xs font-mono text-stone-500 hover:text-red-600 underline"
              >
                Clear Key
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-1.5 text-xs font-mono border border-stone-300 text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setCustomGeminiKey(tempApiKey);
                    setKeySavedMsg(tempApiKey.trim() ? '✓ Custom key saved and active!' : '✓ Reset to platform gateway.');
                    setTimeout(() => {
                      setKeySavedMsg('');
                      setShowKeyModal(false);
                    }, 1000);
                  }}
                  className="px-4 py-1.5 text-xs font-mono font-bold bg-[#111111] text-white hover:bg-[#1A42D9] transition-colors"
                >
                  Save Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
