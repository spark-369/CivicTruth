import { useState, useEffect, useCallback } from "react";
import { participantsAPI, blockchainAPI } from "../services/api";
import { useConfirm } from "../components/shared/ConfirmDialog";
import { useToast } from "../components/shared/Toast";
import PageHeader from "../components/shared/PageHeader";
import PageContainer from "../components/shared/PageContainer";
import EmptyState from "../components/shared/EmptyState";
import Dropdown from "../components/shared/Dropdown";
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
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-500/20",
    badge:
      "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
    dot: "bg-indigo-500",
  },
  id_card: {
    bg: "bg-pink-50 dark:bg-pink-500/10",
    text: "text-pink-600 dark:text-pink-400",
    border: "border-pink-200 dark:border-pink-500/20",
    badge: "bg-pink-100 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300",
    dot: "bg-pink-500",
  },
  passport: {
    bg: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-500/20",
    badge: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  affidavit: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-500/20",
    badge:
      "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  property_deed: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-500/20",
    badge:
      "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
};

function StorageIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}
function ShieldCheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11.5 14.5 16 9" />
    </svg>
  );
}
function DeleteIcon() {
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
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
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
function CloudUploadIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}
function EditIcon() {
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
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
function XIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function Blockchain() {
  const [participants, setParticipants] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [transactionType, setTransactionType] = useState("birth_certificate");
  const [transactionData, setTransactionData] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploadMode, setUploadMode] = useState("text");
  const [blocks, setBlocks] = useState([]);
  const [chainStatus, setChainStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [editingBlock, setEditingBlock] = useState(null);
  const [editTransactionType, setEditTransactionType] = useState("");
  const [editTransactionData, setEditTransactionData] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editUploadMode, setEditUploadMode] = useState("text");
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    const role = getRoleFromToken();
    setIsAdmin(role === "admin");
    setCurrentUserId(getUserIdFromToken());
    loadData();
  }, []);

  useEffect(() => {
    if (imageUrl) {
      setImagePreview(imageUrl);
    } else {
      setImagePreview("");
    }
  }, [imageUrl]);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [pRes, bRes, eRes] = await Promise.all([
        participantsAPI.list(),
        blockchainAPI.verifyChain().catch(() => ({ data: null })),
        blockchainAPI.list().catch(() => ({ data: [] })),
      ]);
      setParticipants(pRes.data || []);
      setChainStatus(bRes.data);
      setBlocks(eRes.data || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load blockchain data. Please try again.");
    }
    setLoading(false);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const participantId = isAdmin ? selectedParticipant : currentUserId;
    if (!participantId) {
      toast({ message: "Please select a participant", severity: "error" });
      return;
    }
    if (uploadMode === "text" && !transactionData.trim()) {
      toast({ message: "Please enter transaction data", severity: "error" });
      return;
    }
    if (uploadMode === "image" && !imageUrl.trim()) {
      toast({ message: "Please enter an image URL", severity: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        participant_id: participantId,
        transaction_type: transactionType,
        ...(uploadMode === "text" ? { transaction_data: transactionData } : {}),
        ...(uploadMode === "image" ? { image_url: imageUrl } : {}),
      };
      const res = await blockchainAPI.create(payload);
      toast({
        message: `Block created successfully. Block hash: ${res.data.block_hash?.slice(0, 24)}...`,
        severity: "success",
      });
      setTransactionData("");
      setSelectedParticipant("");
      setImageUrl("");
      setImagePreview("");
      setUploadMode("text");
      loadData();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast({
        message: typeof detail === "string" ? detail : JSON.stringify(detail),
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async (id) => {
    try {
      await blockchainAPI.remove(id);
      toast({
        message: "Block deleted successfully",
        severity: "success",
      });
      loadData();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast({
        message: typeof detail === "string" ? detail : JSON.stringify(detail),
        severity: "error",
      });
    }
  };

  const handleDeleteClick = (id) => {
    confirm({
      title: "Delete Block",
      content:
        "Are you sure you want to delete this block? This action breaks the immutable blockchain.",
      confirmLabel: "Delete",
      confirmColor: "error",
    }).then((result) => {
      if (result) confirmDelete(id);
    });
  };

  const handleEditClick = (block) => {
    setEditingBlock(block);
    setEditTransactionType(block.transaction_type);
    setEditTransactionData(block.transaction_data);
    setEditImageUrl(block.image_url || "");
    setEditUploadMode(block.image_url ? "image" : "text");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingBlock) return;
    setUpdating(true);
    try {
      await blockchainAPI.update(editingBlock.id, {
        transaction_type: editTransactionType,
        transaction_data: editTransactionData,
        image_url: editImageUrl || undefined,
      });
      toast({
        message: "Block updated successfully",
        severity: "success",
      });
      setEditingBlock(null);
      loadData();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast({
        message: typeof detail === "string" ? detail : JSON.stringify(detail),
        severity: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const checkChain = async () => {
    try {
      const res = await blockchainAPI.verifyChain();
      setChainStatus(res.data);
      toast({ message: "Chain verification completed", severity: "success" });
    } catch (e) {
      console.error(e);
    }
  };

  const filteredBlocks = blocks.filter((block) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      block.participant_name?.toLowerCase().includes(term) ||
      block.transaction_type?.toLowerCase().includes(term) ||
      block.block_hash?.toLowerCase().includes(term)
    );
  });

  const validChainPercent = chainStatus?.valid ? 100 : chainStatus ? 0 : null;
  const totalBlocks = blocks.length;

  const getDocTypeBadge = (documentType) => {
    const cfg =
      DOC_TYPE_COLORS[documentType] || DOC_TYPE_COLORS.birth_certificate;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.badge}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${cfg.dot}`}
        />
        {DOC_TYPE_LABELS[documentType] || documentType}
      </span>
    );
  };

  return (
    <PageContainer>
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <PageHeader
        title="Blockchain"
        subtitle="Create and manage immutable blocks on the blockchain"
        breadcrumbs={[{ label: "Blockchain" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CloudUploadIcon />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">
                Create Block
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Hash and append transactions to the immutable blockchain
              </p>
            </div>
          </div>
          {loading ? (
            <div className="flex flex-col gap-5">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
          ) : (
            <form
              id="blockchain-form"
              onSubmit={handleCreate}
              className="flex flex-col gap-5"
            >
              {isAdmin ? (
                <div>
                  <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Participant
                  </label>
                  <Dropdown
                    value={selectedParticipant}
                    onChange={(val) => setSelectedParticipant(val)}
                    placeholder="Select a participant"
                    options={participants.map((p) => ({ value: p.id, label: p.full_name }))}
                  />
                </div>
              ) : (
                <input type="hidden" value={currentUserId || ""} />
              )}
              <div>
                  <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Transaction Type
                  </label>
                  <Dropdown
                    value={transactionType}
                    onChange={(val) => setTransactionType(val)}
                    options={Object.entries(DOC_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
                  />
              </div>
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
                    Transaction Data
                  </label>
                  <textarea
                    value={transactionData}
                    onChange={(e) => setTransactionData(e.target.value)}
                    rows={4}
                    required={uploadMode === "text"}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm resize-none"
                    placeholder="Enter transaction data..."
                  />
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Data is hashed and appended to the immutable blockchain
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required={uploadMode === "image"}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                  {imagePreview && (
                    <div className="mt-3 relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 w-auto rounded-xl border border-gray-200 dark:border-gray-600 object-cover"
                        onError={() => setImagePreview("")}
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <ImageIcon />
                    Features will be extracted using facebook/dinov2-small
                  </p>
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <StorageIcon />
                )}
                {submitting ? "Creating Block..." : "                      Create Transaction"}
              </button>
            </form>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${chainStatus?.valid ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : chainStatus ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400" : "bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}
            >
              <ShieldCheckIcon />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">
                Chain Integrity
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {chainStatus
                  ? chainStatus.valid
                    ? "Chain is secure"
                    : "Chain compromised"
                  : "Not verified"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col gap-3">
              <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {chainStatus && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Integrity
                    </span>
                    <span
                      className={`text-xs font-bold font-mono ${chainStatus.valid ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {validChainPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${chainStatus.valid ? "bg-emerald-500" : "bg-red-500"}`}
                      style={{ width: `${validChainPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">
                        Blocks checked:{" "}
                        <span className="font-mono font-semibold text-gray-600 dark:text-gray-300">
                          {chainStatus.blocks_checked}
                        </span>
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full ${chainStatus.valid ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"} animate-pulse`}
                    />
                  </div>
                </div>
              )}
              <button
                onClick={checkChain}
                className="w-full py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-semibold flex items-center justify-center gap-2 mb-4 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              >
                {chainStatus?.valid ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ) : (
                  <ShieldCheckIcon />
                )}
                Verify Chain
              </button>

              {chainStatus?.details && chainStatus.details.length > 0 && (
                <div className="flex-1 overflow-y-auto max-h-[320px]">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Chain Blocks
                  </p>
                  <div className="flex flex-col gap-2">
                    {chainStatus.details.map((block) => (
                      <div
                        key={block.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${block.valid ? "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700" : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${block.valid ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600" : "bg-red-100 dark:bg-red-500/10 text-red-600"}`}
                        >
                          {block.index}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">
                            Block {block.index}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono truncate">
                            Hash: {block.block_hash?.slice(0, 16)}...
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${block.content_ok ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600" : "bg-red-100 dark:bg-red-500/10 text-red-600"}`}
                          >
                            Content {block.content_ok ? "OK" : "BAD"}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${block.record_ok ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600" : "bg-red-100 dark:bg-red-500/10 text-red-600"}`}
                          >
                            Record {block.record_ok ? "OK" : "BAD"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <StorageIcon />
            </div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">
              Recent Entries
            </h3>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-500/20">
              {totalBlocks}
            </span>
          </div>
          <div className="relative flex-shrink-0">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SearchIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="                               Search participants, types, or hashes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                               aria-label="Search blockchain entries"
              className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:border-indigo-500 focus:border-2 outline-none transition-all w-full sm:w-64"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50">
                   {["Participant", "Transaction Type", "Block Hash", "Created", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="font-semibold text-xs text-gray-400 uppercase tracking-wider py-3.5 px-4 text-left whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr
                      key={i}
                      className="border-t border-gray-100 dark:border-gray-700/50"
                    >
                      <td className="py-3.5 px-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-24" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-40" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredBlocks.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                       <EmptyState
                       title="No blocks found"
                       description={
                         searchTerm
                           ? "Try adjusting your search term"
                           : "Start by creating your first block"
                       }
                       actionLabel="Create Block"
                       actionPath="#blockchain-form"
                     />
                    </td>
                  </tr>
                ) : (
                  filteredBlocks.map((e) => (
                    <tr
                      key={e.id}
                      className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                             {e.participant_name?.[0]?.toUpperCase() || (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0">
                             <p className="font-semibold text-sm truncate">
                               {e.participant_name || e.participant_id}
                             </p>
                             <p className="text-xs text-gray-400 font-mono truncate">
                               ID: {e.participant_id}
                             </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {getDocTypeBadge(e.transaction_type)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <HashIcon />
                           <span className="font-mono text-xs">
                             {e.block_hash?.slice(0, 24)}...
                           </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(e.created_at).toLocaleString()}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {e.image_features && (
                            <span
                              className="p-2 rounded-lg text-indigo-400"
                              title="Has image features"
                            >
                              <ImageIcon />
                            </span>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleEditClick(e)}
                              className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                              aria-label="Edit entry"
                            >
                              <EditIcon />
                            </button>
                          )}
                           {(isAdmin || e.participant_id === currentUserId) && (
                            <button
                              onClick={() => handleDeleteClick(e.id)}
                              className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              aria-label="Delete entry"
                            >
                              <DeleteIcon />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingBlock && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="blockchain-modal-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                <h3
                id="blockchain-modal-title"
                className="font-bold text-gray-800 dark:text-gray-100 text-base"
              >
                Edit Block
              </h3>
              <button
                onClick={() => setEditingBlock(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <XIcon />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 flex flex-col gap-4">
              <div>
                  <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Transaction Type
                  </label>
                  <Dropdown
                    value={editTransactionType}
                    onChange={(val) => setEditTransactionType(val)}
                    options={Object.entries(DOC_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
                  />
              </div>
              <div>
                <label className="block font-semibold text-xs mb-2 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Upload Mode
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditUploadMode("text")}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${editUploadMode === "text" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300" : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300"}`}
                  >
                    Text Document
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditUploadMode("image")}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${editUploadMode === "image" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300" : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300"}`}
                  >
                    Image URL
                  </button>
                </div>
              </div>
              {editUploadMode === "text" ? (
                <div>
                  <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Transaction Data
                  </label>
                  <textarea
                    value={editTransactionData}
                    onChange={(e) => setEditTransactionData(e.target.value)}
                    rows={4}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm resize-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    required={editUploadMode === "image"}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                  {editImageUrl && (
                    <div className="mt-3">
                      <img
                        src={editImageUrl}
                        alt="Preview"
                        className="h-32 w-auto rounded-xl border border-gray-200 dark:border-gray-600 object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingBlock(null)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-semibold hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
