import { useState, useEffect, useCallback } from "react";
import { verifyAPI, participantsAPI, blockchainAPI } from "../services/api";
import { useToast } from "../components/shared/Toast";
import PageHeader from "../components/shared/PageHeader";
import PageContainer from "../components/shared/PageContainer";
import EmptyState from "../components/shared/EmptyState";
import Dropdown from "../components/shared/Dropdown";
import { Link } from "react-router-dom";
import { getRoleFromToken, getUserIdFromToken } from "../utils/auth";

const DOC_TYPE_LABELS = {
  birth_certificate: "Birth Certificate",
  id_card: "ID Card",
  passport: "Passport",
  affidavit: "Affidavit",
  property_deed: "Property Deed",
};

const DOC_TYPE_COLORS = {
  birth_certificate: {
    badge:
      "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  },
  id_card: {
    badge: "bg-pink-100 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300",
  },
  passport: {
    badge: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  affidavit: {
    badge:
      "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  property_deed: {
    badge:
      "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
};

function HashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}
function FileTextIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

const LABEL_CONFIG = {
  "Exact Match": {
    color: "green",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    desc:             "Document matches a blockchain block exactly.",
  },
  "Partial Match": {
    color: "amber",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    desc:             "Document partially matches a blockchain block.",
  },
  Mismatch: {
    color: "red",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    desc:             "Document does not match any blockchain block.",
  },
  Unrelated: {
    color: "blue",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    desc:             "Document is unrelated to any blockchain block.",
  },
  Fabricated: {
    color: "red",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    desc: "Document appears fabricated or forged.",
  },
  Uncertain: {
    color: "gray",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    desc: "Unable to determine match status.",
  },
};

const colorMap = {
  green: { light: "bg-green-50 dark:bg-green-500/10", main: "text-green-600 dark:text-green-400", border: "border-green-200 dark:border-green-500/20" },
  amber: { light: "bg-amber-50 dark:bg-amber-500/10", main: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/20" },
  red: { light: "bg-red-50 dark:bg-red-500/10", main: "text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-500/20" },
  blue: { light: "bg-blue-50 dark:bg-blue-500/10", main: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-500/20" },
  gray: { light: "bg-gray-50 dark:bg-gray-500/10", main: "text-gray-600 dark:text-gray-400", border: "border-gray-200 dark:border-gray-500/20" },
};

function VerificationResultCard({ result, labelConfig }) {
  const score = parseFloat((result.prediction_score * 100).toFixed(1));
  const colors = colorMap[labelConfig.color] || colorMap.gray;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.light} ${colors.main}`}>
          {labelConfig.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight">
            {result.prediction_label}
          </h3>
          <p className="text-xs text-gray-400">{labelConfig.desc}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-lg text-xs font-semibold ${result.status === "completed" ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"}`}
        >
          {result.status}
        </span>
      </div>
      <hr className="mb-5 border-gray-200 dark:border-gray-700" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Score", value: `${score}%` },
          { label: "Label", value: result.prediction_label },
          { label: "Status", value: result.status },
        ].map((item) => (
          <div
            key={item.label}
            className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50"
          >
            <p className="text-xs font-semibold text-gray-400 uppercase">
              {item.label}
            </p>
            {item.label === "Score" ? (
              <p className="font-bold text-xl text-gray-800 dark:text-gray-100 font-mono mt-1">
                {item.value}
              </p>
            ) : item.label === "Label" ? (
              <span
                className="mt-1 inline-block px-3 py-1 rounded-lg text-xs font-semibold"
                style={{ backgroundColor: colors.light, color: colors.main }}
              >
                {item.value}
              </span>
            ) : (
              <span
                className={`mt-1 inline-block px-3 py-1 rounded-lg text-xs font-semibold ${result.status === "completed" ? "bg-green-100 dark:bg-green-500/10 text-green-600" : "bg-gray-100 dark:bg-gray-700 text-gray-600"}`}
              >
                {item.value}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase">
            Confidence Score
          </p>
          <p className="text-xs font-bold text-gray-600 dark:text-gray-300 font-mono">
            {score}%
          </p>
        </div>
        <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-600 ${result.prediction_score > 0.8 ? 'bg-emerald-500' : result.prediction_score > 0.5 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      {result.result_text && (
        <div className="mb-5">
          <p className="text-xs font-bold mb-3 text-gray-800 dark:text-gray-100">
            Analysis Summary
          </p>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
              {result.result_text}
            </p>
          </div>
        </div>
      )}
      {result.matched_entries && result.matched_entries.length > 0 && (
        <div>
          <p className="text-sm font-bold mb-3 text-gray-800 dark:text-gray-100">
            Matched Blockchain Entries ({result.matched_blocks.length})
          </p>
          <hr className="mb-3 border-gray-200 dark:border-gray-700" />
          <div className="flex flex-col gap-3">
            {result.matched_entries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Block ID
                    </p>
                    <p className="text-sm font-mono mt-1 text-gray-700 dark:text-gray-200">
                      {entry.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                       Transaction Type
                     </p>
                     <div className="mt-1.5">
                       <span className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-600">
                         {entry.transaction_type}
                       </span>
                     </div>
                  </div>
                  {entry.transaction_data_preview && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase">
                       Content
                     </p>
                       <div className="mt-1.5 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                         <p className="text-sm font-mono text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                           {entry.transaction_data_preview}...
                         </p>
                       </div>
                    </div>
                  )}
                  {entry.image_url && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase">
                       Blockchain Transaction
                       </p>
                       <div className="mt-1.5">
                         <img
                           src={entry.image_url}
                           alt="Blockchain Transaction"
                           className="h-32 w-auto rounded-lg border border-gray-200 dark:border-gray-700 object-cover"
                         />
                       </div>
                    </div>
                  )}
                  {entry.block_hash && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase">
                       Block Hash
                     </p>
                       <div className="mt-1.5 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                         <p className="text-xs font-mono text-gray-700 dark:text-gray-200 break-all">
                           {entry.block_hash}
                         </p>
                       </div>
                    </div>
                  )}
                  {entry.created_at && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase">
                        Created
                      </p>
                      <p className="text-sm mt-0.5 text-gray-700 dark:text-gray-200">
                        {new Date(entry.created_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Verify() {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploadMode, setUploadMode] = useState("text");
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [participants, setParticipants] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [blockLoading, setBlockLoading] = useState(false);
  const { toast } = useToast();

  const handleImageError = () => setImagePreview("");

  const saveResult = (res) => {
    const entry = { ...res, _ts: new Date().toISOString() };
    const updated = [entry, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem("verify_history", JSON.stringify(updated));
  };

  const loadParticipants = useCallback(async () => {
    try {
      const res = await participantsAPI.list();
      setParticipants(res.data || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadBlocks = useCallback(async () => {
    setBlockLoading(true);
    try {
      const res = await blockchainAPI.list();
      setBlocks(res.data || []);
    } catch (e) {
      console.error(e);
    }
    setBlockLoading(false);
  }, []);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("verify_history");
  };

  useEffect(() => {
    const role = getRoleFromToken();
    setIsAdmin(role === "admin");
    setCurrentUserId(getUserIdFromToken());
    loadParticipants();
    loadBlocks();
    const saved = localStorage.getItem("verify_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
  }, [loadParticipants, loadBlocks]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);
    try {
      const payload = {
        participant_id: isAdmin
          ? selectedParticipant || undefined
          : currentUserId || undefined,
        ...(uploadMode === "text"
          ? { input_text: text }
          : { image_url: imageUrl }),
      };
      const res = await verifyAPI.run(payload);
      setResult(res.data);
      saveResult(res.data);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast({
        message: typeof detail === "string" ? detail : JSON.stringify(detail),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const labelConfig = result
    ? LABEL_CONFIG[result.prediction_label] || LABEL_CONFIG["Uncertain"]
    : null;
  return (
    <PageContainer>
      <PageHeader
        title="AI Verification"
        subtitle="Verify transaction authenticity against blockchain blocks using AI"
        breadcrumbs={[{ label: "Verify" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 h-full">
          <form onSubmit={handleVerify} className="flex flex-col gap-5">
            {isAdmin ? (
              <div>
                  <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Participant (optional)
                  </label>
                  <Dropdown
                    value={selectedParticipant}
                    onChange={(val) => setSelectedParticipant(val)}
                    placeholder="All participants"
                    options={participants.map((p) => ({ value: p.id, label: p.full_name }))}
                  />
              </div>
            ) : (
              <input type="hidden" value={currentUserId || ""} />
            )}
            <div>
              <label className="block font-semibold text-xs mb-2 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Upload Mode
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMode("text")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${uploadMode === "text" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300" : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300"}`}
                >
                  Text Document
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("image")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${uploadMode === "image" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300" : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300"}`}
                >
                  Image URL
                </button>
              </div>
            </div>
            {uploadMode === "text" ? (
              <div>
                <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Document text to verify
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  required={uploadMode === "text"}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm resize-none"
                  placeholder="Paste document text here for verification..."
                />
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Image URL to verify
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required={uploadMode === "image"}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm"
                  placeholder="https://example.com/image.jpg"
                />
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-auto rounded-xl border border-gray-200 dark:border-gray-600 object-cover"
                      onError={handleImageError}
                    />
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1.5">
                 Features will be extracted using facebook/dinov2-small and
                 compared against blockchain blocks.
                </p>
              </div>
            )}
            <div className="flex gap-3 flex-col sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Run Verification"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setText("");
                  setImageUrl("");
                  setImagePreview("");
                  setResult(null);
                  setSelectedParticipant("");
                  setUploadMode("text");
                }}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="h-full">
          {result && labelConfig ? (
            <VerificationResultCard result={result} labelConfig={labelConfig} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center h-full text-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-300 dark:text-gray-600 mb-4"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 text-lg">
                Ready to Verify
              </h3>
              <p className="text-sm text-gray-400 max-w-[400px]">
                Enter transaction text or an image URL in the form and select an
                optional participant to run AI verification against the blockchain.
              </p>
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 animate-[fadeIn_0.5s_ease_0.2s_forwards] opacity-0">
          <div className="flex items-center gap-2 mb-5">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-indigo-500"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            <h3 className="font-bold">Recent Verifications</h3>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
              {history.length}
            </span>
            <button
              onClick={clearHistory}
              className="ml-auto text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-col gap-0">
            {history.map((h, i) => {
              const cfg =
                LABEL_CONFIG[h.prediction_label] || LABEL_CONFIG["Uncertain"];
              const colors = colorMap[cfg.color] || colorMap.gray;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 py-3 ${i < history.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""}`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: colors.light,
                      color: colors.main,
                    }}
                  >
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {h.prediction_label}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${h.status === "completed" ? "bg-green-100 dark:bg-green-500/10 text-green-600" : "bg-gray-100 dark:bg-gray-700 text-gray-600"}`}
                      >
                        {h.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Score: {(h.prediction_score * 100).toFixed(1)}% | ID:{" "}
                      {h.id}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 ml-auto flex-shrink-0">
                    {new Date(h._ts).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
