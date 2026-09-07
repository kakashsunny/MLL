import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, fetchSystemAuditLogs, recordSystemAuditLog } from '../../services/firebase';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Cpu, 
  Users, 
  Activity, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Sparkles, 
  Terminal,
  Send,
  Sliders,
  Database
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const AdminAuthorizationPanel: React.FC = () => {
  const { user, profile, role, permissions, changeRole, openAuthModal } = useAuth();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Gemini API Diagnostic & Testing State
  const [geminiModel, setGeminiModel] = useState<'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-3.8-flash'>('gemini-3.8-flash');
  const [geminiPrompt, setGeminiPrompt] = useState('Compare L1 vs L2 regularization in terms of sparsity and optimization geometry.');
  const [geminiResponse, setGeminiResponse] = useState<string>('');
  const [geminiTesting, setGeminiTesting] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<{ hasKey: boolean; service: string } | null>(null);

  // Load audit logs on mount
  const loadLogs = async () => {
    setLoadingLogs(true);
    const logs = await fetchSystemAuditLogs();
    setAuditLogs(logs);
    setLoadingLogs(false);
  };

  useEffect(() => {
    loadLogs();
    // Check Gemini server health
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setGeminiStatus({ hasKey: data.hasGeminiKey, service: data.service });
      })
      .catch(() => {
        setGeminiStatus({ hasKey: false, service: 'Offline fallback' });
      });
  }, []);

  const handleTestGemini = async () => {
    if (!permissions.canRunGeminiPro && geminiModel === 'gemini-2.5-pro') {
      alert('Your current role (Student) is not authorized for Gemini 2.5 Pro. Switch to Researcher or Admin.');
      return;
    }

    setGeminiTesting(true);
    setGeminiResponse('');

    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': role,
          'x-user-id': user?.uid || 'anonymous'
        },
        body: JSON.stringify({
          prompt: geminiPrompt,
          model: geminiModel,
          systemInstruction: 'You are an advanced ML Research Scientist responding with precision, mathematical depth, and clear structure.'
        })
      });

      const data = await res.json();
      setGeminiResponse(data.text || data.reply || 'No response generated.');

      if (user) {
        recordSystemAuditLog(
          user.uid, 
          user.email || 'user', 
          role, 
          'GEMINI_QUERY', 
          `Executed query on model: ${geminiModel}`
        );
        loadLogs();
      }
    } catch (err: any) {
      setGeminiResponse(`Error connecting to Gemini API route: ${err.message}`);
    } finally {
      setGeminiTesting(false);
    }
  };

  // If role is Student, show Access Denied / Authorization barrier
  if (!permissions.canAccessAdminPanel) {
    return (
      <div className="flex-1 p-6 sm:p-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-mono font-bold text-stone-900 mb-2">
          403 Forbidden: Administrative Authorization Required
        </h2>
        <p className="text-sm text-stone-600 mb-6 leading-relaxed">
          Your current authenticated role is <span className="font-mono font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-800">{role.toUpperCase()}</span>. 
          The Administration & Security Audit Center requires elevated <span className="font-mono font-bold text-stone-800">ADMIN</span> privileges.
        </p>

        <div className="p-4 bg-white border border-[#E5E2D9] rounded-xl shadow-sm text-left w-full mb-6 text-xs font-mono">
          <div className="text-stone-500 mb-2 font-bold uppercase tracking-wider">Active Role Permission Policy:</div>
          <ul className="space-y-1.5 text-stone-700">
            <li className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" /> Admin Security Console: Denied
            </li>
            <li className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" /> Audit Log Ingestion & Inspection: Denied
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Interactive Learning Curriculum: Authorized
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => changeRole('admin')}
            className="px-4 py-2 bg-[#1A42D9] hover:bg-[#1535B0] text-white rounded-lg text-xs font-mono font-bold transition-colors shadow-sm"
          >
            ⚡ Elevate to Admin (Testing Override)
          </button>
          <button
            onClick={() => openAuthModal('login')}
            className="px-4 py-2 bg-white hover:bg-stone-50 border border-[#E0DCCF] text-stone-700 rounded-lg text-xs font-mono font-medium transition-colors"
          >
            Switch Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="admin_authorization_panel" className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-7xl mx-auto select-text">
      {/* Page Header */}
      <div className="bg-white border border-[#E5E2D9] rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE7DD] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A42D9]/10 border border-[#1A42D9]/20 flex items-center justify-center text-[#1A42D9]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-mono text-stone-900 flex items-center gap-2">
                <span>Security & Authorization Center</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold uppercase">
                  RBAC Active
                </span>
              </h1>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                Firebase Firestore ABAC Rules • Auth State Enforcement • Gemini API Routing
              </p>
            </div>
          </div>

          {/* Quick Role Switcher */}
          <div className="flex items-center gap-2 bg-[#FAF9F5] p-1.5 rounded-xl border border-[#E5E2D9]">
            <span className="text-[11px] font-mono text-stone-500 px-2 font-semibold">Active Role:</span>
            {(['student', 'researcher', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => changeRole(r)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold capitalize transition-all ${
                  role === r
                    ? 'bg-[#1A42D9] text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Identity & Token Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#FAF9F5] border border-[#EFECE3] rounded-xl">
            <span className="text-[10px] text-stone-400 block uppercase font-bold">Authenticated UID</span>
            <span className="font-bold text-stone-900 truncate block mt-0.5">
              {user?.uid || profile?.id || 'demo_anonymous'}
            </span>
          </div>
          <div className="p-3 bg-[#FAF9F5] border border-[#EFECE3] rounded-xl">
            <span className="text-[10px] text-stone-400 block uppercase font-bold">User Email</span>
            <span className="font-bold text-stone-900 truncate block mt-0.5">
              {user?.email || profile?.email || 'unauthenticated@neuraforge.ai'}
            </span>
          </div>
          <div className="p-3 bg-[#FAF9F5] border border-[#EFECE3] rounded-xl">
            <span className="text-[10px] text-stone-400 block uppercase font-bold">Firebase Auth Provider</span>
            <span className="font-bold text-[#1A42D9] block mt-0.5">
              {user?.isAnonymous ? 'Firebase Anonymous' : user?.providerData[0]?.providerId || 'Email / Password'}
            </span>
          </div>
          <div className="p-3 bg-[#FAF9F5] border border-[#EFECE3] rounded-xl">
            <span className="text-[10px] text-stone-400 block uppercase font-bold">Server Gemini Gateway</span>
            <span className={`font-bold block mt-0.5 ${geminiStatus?.hasKey ? 'text-emerald-700' : 'text-amber-700'}`}>
              {geminiStatus?.hasKey ? '● Connected (API Key Active)' : '○ Server Fallback Engine'}
            </span>
          </div>
        </div>
      </div>

      {/* RBAC Permission Matrix & Gemini Live Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. RBAC Permission Matrix Card */}
        <div className="bg-white border border-[#E5E2D9] rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE7DD] mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#1A42D9]" />
                <h2 className="text-sm font-mono font-bold text-stone-900 uppercase tracking-wider">
                  Role-Based Access Control (RBAC) Matrix
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-[#1A42D9] border border-blue-200 font-bold">
                Zero-Trust ABAC
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF9F5] border border-[#EFECE3]">
                <span className="text-stone-700">Access Admin Console (`canAccessAdminPanel`)</span>
                {permissions.canAccessAdminPanel ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-bold"><CheckCircle2 className="w-4 h-4" /> Granted</span>
                ) : (
                  <span className="flex items-center gap-1 text-stone-400 font-medium"><XCircle className="w-4 h-4" /> Denied</span>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF9F5] border border-[#EFECE3]">
                <span className="text-stone-700">Gemini 2.5 Pro Model Access (`canRunGeminiPro`)</span>
                {permissions.canRunGeminiPro ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-bold"><CheckCircle2 className="w-4 h-4" /> Granted</span>
                ) : (
                  <span className="flex items-center gap-1 text-stone-400 font-medium"><XCircle className="w-4 h-4" /> Denied</span>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF9F5] border border-[#EFECE3]">
                <span className="text-stone-700">Deploy Serving Pipelines (`canDeployModels`)</span>
                {permissions.canDeployModels ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-bold"><CheckCircle2 className="w-4 h-4" /> Granted</span>
                ) : (
                  <span className="flex items-center gap-1 text-stone-400 font-medium"><XCircle className="w-4 h-4" /> Denied</span>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF9F5] border border-[#EFECE3]">
                <span className="text-stone-700">System Security Audit Log Ingestion (`canAuditSystem`)</span>
                {permissions.canAuditSystem ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-bold"><CheckCircle2 className="w-4 h-4" /> Granted</span>
                ) : (
                  <span className="flex items-center gap-1 text-stone-400 font-medium"><XCircle className="w-4 h-4" /> Denied</span>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF9F5] border border-[#EFECE3]">
                <span className="text-stone-700">Jupyter .ipynb & Python Script Exports (`canExportNotebooks`)</span>
                {permissions.canExportNotebooks ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-bold"><CheckCircle2 className="w-4 h-4" /> Granted</span>
                ) : (
                  <span className="flex items-center gap-1 text-stone-400 font-medium"><XCircle className="w-4 h-4" /> Denied</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#EAE7DD] flex items-center justify-between text-[11px] font-mono text-stone-500">
            <span>Enforced via <code className="text-[#1A42D9]">firestore.rules</code> and Express middleware</span>
            <button
              onClick={() => openAuthModal('login')}
              className="text-[#1A42D9] font-bold hover:underline"
            >
              Sign into another account →
            </button>
          </div>
        </div>

        {/* 2. Server-Side Gemini API Live Testing Console */}
        <div className="bg-white border border-[#E5E2D9] rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE7DD] mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-mono font-bold text-stone-900 uppercase tracking-wider">
                  Gemini API Gateway Tester
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value as any)}
                  className="text-xs font-mono bg-[#FAF9F5] border border-[#E0DCCF] rounded-lg px-2 py-1 text-stone-800 focus:outline-none"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Default Fast)</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (High Reasoning)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1">
                  Research Prompt (Proxied via `/api/gemini/generate`):
                </label>
                <textarea
                  value={geminiPrompt}
                  onChange={(e) => setGeminiPrompt(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-[#E5E2D9] text-xs font-mono bg-[#FAF9F5] focus:bg-white focus:outline-none focus:border-[#1A42D9] resize-none"
                />
              </div>

              <button
                onClick={handleTestGemini}
                disabled={geminiTesting}
                className="w-full py-2 bg-[#1A42D9] hover:bg-[#1535B0] disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                {geminiTesting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Executing Inference via Gemini Gateway...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Execute Inference Request ({geminiModel})</span>
                  </>
                )}
              </button>

              {/* Response Output Box */}
              {geminiResponse && (
                <div className="mt-3 p-3 rounded-xl bg-[#FAF9F5] border border-[#E0DCCF] max-h-48 overflow-y-auto text-xs font-mono text-stone-800">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-stone-200 text-[10px] text-stone-400">
                    <span>Inference Output</span>
                    <span className="text-emerald-700 font-bold">200 OK</span>
                  </div>
                  <div className="prose prose-stone text-xs leading-relaxed">
                    <ReactMarkdown>{geminiResponse}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#EAE7DD] flex items-center justify-between text-[10px] font-mono text-stone-400">
            <span>Powered by official Google GenAI SDK (`@google/genai`)</span>
            <span>Zero Client-Side Key Exposure</span>
          </div>
        </div>
      </div>

      {/* 3. Firestore Audit Logs Stream */}
      <div className="bg-white border border-[#E5E2D9] rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE7DD] mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-mono font-bold text-stone-900 uppercase tracking-wider">
              Firestore System Security & Audit Log Stream (`audit_logs`)
            </h2>
          </div>
          <button
            onClick={loadLogs}
            disabled={loadingLogs}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium border border-[#E0DCCF] bg-[#FAF9F5] hover:bg-stone-100 text-stone-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
            <span>Refresh Logs</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {auditLogs.length === 0 ? (
            <div className="text-center py-8 text-stone-400 font-mono text-xs">
              No audit logs captured in this session yet. Trigger actions like authentication, prompt runs, or role overrides to generate tamper-evident audit records.
            </div>
          ) : (
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#EAE7DD] text-[10px] uppercase text-stone-400">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Actor UID</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE1]">
                {auditLogs.slice(0, 8).map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-stone-50">
                    <td className="py-2.5 text-stone-500 text-[11px]">
                      {new Date(log.timestamp || Date.now()).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-800 border border-stone-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 text-stone-600 text-[11px] truncate max-w-[120px]">
                      {log.actorId}
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.actorRole === 'admin' 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                          : 'bg-blue-50 text-[#1A42D9] border border-blue-200'
                      }`}>
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="py-2.5 text-stone-700 text-[11px]">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
