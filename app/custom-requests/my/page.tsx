"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { CustomRequest, Bid } from "@/types";
import toast from "react-hot-toast";
import {
  PlusCircle, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle,
  Banknote, Calendar, Tag, MessageSquare, Users, Eye, Phone, Mail,
  Loader2, AlertTriangle, RefreshCw, Star, X, ImagePlus, Trash2,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Jewellery", "Clothing & Embroidery", "Home Decor", "Pottery & Ceramics",
  "Painting & Art", "Woodwork", "Leatherwork", "Candles & Soaps",
  "Bags & Accessories", "Toys & Dolls", "Paper Craft", "Other",
];

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  open:      { label: "Open — Accepting Bids", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  closed:    { label: "Closed — Bid Accepted",  color: "bg-blue-100 text-blue-700",     icon: CheckCircle },
  completed: { label: "Completed",              color: "bg-purple-100 text-purple-700", icon: Star },
  cancelled: { label: "Cancelled",              color: "bg-gray-100 text-gray-500",     icon: XCircle },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function timeAgo(d: string) {
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 3_600_000);
  if (h < 1)  return "just now";
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}
function sellerOf(bid: Bid) {
  return typeof bid.seller === "object" ? bid.seller : null;
}

// ─── Post Request Modal ───────────────────────────────────────────────────────

const MAX_IMAGES = 3;

function PostRequestModal({ onClose, onCreated }: { onClose: () => void; onCreated: (r: CustomRequest) => void }) {
  const { user } = useAuthStore();

  const [form, setForm] = useState({
    title: "", description: "", category: CATEGORIES[0],
    budget: "", deadline: "",
    phone: (user as any)?.phone || "",
  });
  const [images,   setImages]   = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading,  setLoading]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`Max ${MAX_IMAGES} reference images`);
      return;
    }
    const newFiles = files.slice(0, MAX_IMAGES - images.length);
    setImages((prev) => [...prev, ...newFiles]);
    newFiles.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((p) => [...p, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
    // reset input so same file can be re-added after removal
    e.target.value = "";
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    const digits = form.phone.replace(/\D/g, "");
    if (!digits) {
      toast.error("Your contact number is required");
      return;
    }
    if (digits.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title",       form.title.trim());
      fd.append("description", form.description.trim());
      fd.append("category",    form.category);
      fd.append("buyerPhone",  form.phone.trim());
      if (form.budget)   fd.append("budget",   form.budget);
      if (form.deadline) fd.append("deadline", form.deadline);
      images.forEach((img) => fd.append("images", img));

      const { data } = await api.post("/custom-requests", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Request posted! Sellers will be notified.");
      onCreated(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to post request");
    } finally {
      setLoading(false);
    }
  }

  return (
    /* Overlay — flex-col so inner dialog can scroll without pushing overlay */
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* ── Sticky header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Post a Custom Request</h2>
            <p className="text-xs text-gray-500 mt-0.5">Describe what you want — sellers will bid to make it for you</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form id="post-request-form" onSubmit={submit} className="space-y-4">

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Request Title <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Custom embroidered kurta for my wedding"
                maxLength={120}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-emerald-500">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Description — What exactly do you want? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                maxLength={3000}
                placeholder="Describe size, colour, material, design details, occasion, etc. The more detail, the better bids you'll receive."
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <p className="text-[11px] text-gray-400 mt-1 text-right">{form.description.length}/3000</p>
            </div>

            {/* Contact Number — mandatory, exactly 10 digits */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Your Contact Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">📞</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => {
                    // only keep digits, max 10
                    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
                    set("phone", cleaned);
                  }}
                  placeholder="9876543210"
                  maxLength={10}
                  className={
                    "w-full pl-9 border rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 " +
                    (form.phone.length > 0 && form.phone.length < 10
                      ? "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                      : form.phone.length === 10
                      ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                      : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20")
                  }
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[11px] text-gray-400">Shared with the seller only after you accept their bid</p>
                <p className={`text-[11px] font-semibold tabular-nums ${
                  form.phone.length === 10 ? "text-emerald-600" :
                  form.phone.length > 0    ? "text-red-500"     : "text-gray-400"
                }`}>{form.phone.length}/10</p>
              </div>
            </div>

            {/* Budget + Deadline */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Max Budget (₹) <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.budget}
                  onChange={(e) => set("budget", e.target.value)}
                  placeholder="e.g. 2000"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Needed By <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={form.deadline}
                  onChange={(e) => set("deadline", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Reference Images — optional */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Reference Images <span className="text-gray-400 font-normal">(optional — up to {MAX_IMAGES})</span>
              </label>
              <div className="flex items-start gap-2 flex-wrap">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0 group">
                    <img src={src} alt={`ref ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Trash2 size={14} className="text-white" />
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-emerald-600 transition-colors shrink-0">
                    <ImagePlus size={18} />
                    <span className="text-[10px] font-medium">Add photo</span>
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImages}
                  className="hidden"
                />
              </div>
              {images.length > 0 && (
                <p className="text-[11px] text-gray-400 mt-1.5">{images.length}/{MAX_IMAGES} photo{images.length !== 1 ? "s" : ""} added</p>
              )}
            </div>

            {/* Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 space-y-1">
              <p className="font-semibold mb-1">✨ Tips for getting great bids:</p>
              <p>• Add as much detail as possible — size, colour, occasion, style</p>
              <p>• Upload reference photos so sellers know exactly what you want</p>
              <p>• Setting a realistic budget gets faster, more serious bids</p>
            </div>

          </form>
        </div>

        {/* ── Sticky footer buttons ── */}
        <div className="px-6 pb-5 pt-3 border-t border-gray-100 shrink-0 flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            form="post-request-form"
            disabled={loading}
            className="flex-1 bg-emerald-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Posting…</> : <><PlusCircle size={15} /> Post Request</>}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Bid Card ─────────────────────────────────────────────────────────────────

function BidCard({
  bid, isAccepted, canAccept, onAccept, acceptingId,
}: {
  bid: Bid;
  isAccepted: boolean;
  canAccept: boolean;
  onAccept: (bidId: string) => void;
  acceptingId: string | null;
}) {
  const seller = sellerOf(bid);
  const shopName = seller?.sellerProfile?.shopName || seller?.name || "Seller";
  const initial  = shopName[0]?.toUpperCase();

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isAccepted
        ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-500/20"
        : bid.status === "rejected"
        ? "border-gray-200 bg-gray-50 opacity-50"
        : canAccept
        ? "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
        : "border-gray-200 bg-white"
    }`}>
      {/* Top row: avatar / name / price */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700 shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-800">{shopName}</p>
            {isAccepted && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                <CheckCircle size={10} /> Accepted
              </span>
            )}
            {bid.status === "rejected" && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">Not Selected</span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(bid.createdAt)}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-extrabold text-emerald-700">₹{Number(bid.price).toLocaleString("en-IN")}</p>
          <p className="text-xs text-gray-500">in {bid.deliveryDays} day{bid.deliveryDays !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {bid.note && (
        <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2.5 text-xs text-gray-700 leading-relaxed border border-gray-100">
          <p className="font-semibold text-gray-500 mb-1">Seller's note:</p>
          {bid.note}
        </div>
      )}

      {/* ── Seller contact — shown BEFORE accepting so buyer can call first ── */}
      {canAccept && bid.status === "pending" && !isAccepted && seller?.phone && (
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
          <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
            <Phone size={12} /> Call seller before accepting
          </p>
          <p className="text-[11px] text-blue-600 leading-relaxed">
            Confirm the seller can deliver to your location and discuss details before committing.
          </p>
          <div className="flex items-center gap-3 pt-0.5 flex-wrap">
            <a href={`tel:${seller.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
              <Phone size={11} /> {seller.phone}
            </a>
            <a href={`https://wa.me/${seller.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
              💬 WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* ── After acceptance: full contact details ── */}
      {isAccepted && seller?.phone && (
        <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1.5">
          <p className="text-xs font-bold text-emerald-700 mb-1">🤝 Seller Contact — Coordinate delivery</p>
          <div className="flex items-center gap-2 flex-wrap">
            <a href={`tel:${seller.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors">
              <Phone size={11} /> {seller.phone}
            </a>
            <a href={`https://wa.me/${seller.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
              💬 WhatsApp
            </a>
            {seller.email && (
              <a href={`mailto:${seller.email}`}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:underline border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                <Mail size={11} /> {seller.email}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Accept button — shown after seller's phone is visible */}
      {canAccept && bid.status === "pending" && !isAccepted && (
        <button
          onClick={() => onAccept(String(bid._id))}
          disabled={acceptingId === String(bid._id)}
          className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60">
          {acceptingId === String(bid._id)
            ? <><Loader2 size={13} className="animate-spin" /> Accepting…</>
            : <><CheckCircle size={13} /> Confirm &amp; Accept This Bid</>}
        </button>
      )}
    </div>
  );
}

// ─── Request Card ─────────────────────────────────────────────────────────────

function RequestCard({
  req, onAccept, acceptingId, onComplete, onCancel,
}: {
  req: CustomRequest;
  onAccept: (requestId: string, bidId: string) => void;
  acceptingId: string | null;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusMeta = STATUS_META[req.status] || STATUS_META.open;
  const StatusIcon = statusMeta.icon;
  const pendingBids = req.bids.filter((b) => b.status === "pending");
  const acceptedBid = req.bids.find((b) => b.status === "accepted");

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all ${
      req.status === "open" && req.bids.length > 0 ? "border-emerald-200" : "border-gray-200"
    }`}>
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${statusMeta.color}`}>
                <StatusIcon size={10} /> {statusMeta.label}
              </span>
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <Clock size={10} /> {timeAgo(req.createdAt)}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 leading-snug truncate">{req.title}</h3>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-xs text-gray-500 flex items-center gap-1"><Tag size={11} /> {req.category}</span>
              {req.budget && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Banknote size={11} /> Budget up to ₹{Number(req.budget).toLocaleString("en-IN")}
                </span>
              )}
              {req.deadline && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar size={11} /> Needed by {fmtDate(req.deadline)}
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-extrabold text-gray-900">{req.bids.length}</p>
            <p className="text-[11px] text-gray-500">bid{req.bids.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-3 line-clamp-2 leading-relaxed">{req.description}</p>

        {/* CTA banners */}
        {req.status === "open" && pendingBids.length > 0 && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800 font-medium">
              You have <strong>{pendingBids.length}</strong> bid{pendingBids.length !== 1 ? "s" : ""} waiting for your review. Expand to see them.
            </p>
          </div>
        )}

        {req.status === "closed" && acceptedBid && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <CheckCircle size={14} className="text-blue-600 shrink-0" />
            <p className="text-xs text-blue-800 font-medium">
              Bid accepted! Contact the seller below to coordinate delivery. Once received, mark as completed.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <button onClick={() => setExpanded((x) => !x)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? "Hide" : `View ${req.bids.length > 0 ? `${req.bids.length} Bid${req.bids.length !== 1 ? "s" : ""}` : "Details"}`}
          </button>

          {req.status === "closed" && (
            <button onClick={() => onComplete(String(req._id))}
              className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors">
              <Star size={13} /> Mark Completed
            </button>
          )}

          {req.status === "open" && (
            <button onClick={() => onCancel(String(req._id))}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              <XCircle size={13} /> Cancel Request
            </button>
          )}
        </div>
      </div>

      {/* Expanded — full description + bids */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-4">
          {/* Full description */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Full Description</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{req.description}</p>
          </div>

          {/* Bids */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              {req.bids.length === 0 ? "No bids yet" : `${req.bids.length} Bid${req.bids.length !== 1 ? "s" : ""} Received`}
            </p>

            {req.bids.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MessageSquare size={32} className="mx-auto mb-2 text-gray-200" />
                <p className="text-sm">No sellers have bid yet. Check back soon!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Sort: accepted first, then by price */}
                {[...req.bids]
                  .sort((a, b) => {
                    if (a.status === "accepted") return -1;
                    if (b.status === "accepted") return 1;
                    return a.price - b.price;
                  })
                  .map((bid) => (
                    <BidCard
                      key={String(bid._id)}
                      bid={bid}
                      isAccepted={bid.status === "accepted"}
                      canAccept={req.status === "open"}
                      onAccept={(bidId) => onAccept(String(req._id), bidId)}
                      acceptingId={acceptingId}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyCustomRequestsPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [requests, setRequests]   = useState<CustomRequest[]>([]);
  const [fetching, setFetching]   = useState(false);
  const [showPost, setShowPost]   = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "closed" | "completed" | "cancelled">("all");

  // Redirect sellers only — page is public for guests
  useEffect(() => {
    if (authLoading) return;
    if (user?.isSeller) { router.replace("/seller/custom-requests"); }
  }, [user, authLoading, router]);

  const fetchRequests = useCallback(async () => {
    setFetching(true);
    try {
      const { data } = await api.get("/custom-requests/my/buyer");
      setRequests(data.requests);
    } catch { toast.error("Failed to load requests"); }
    finally { setFetching(false); }
  }, []);

  // Only fetch when logged-in buyer is ready
  useEffect(() => {
    if (user && !user.isSeller) fetchRequests();
  }, [user, fetchRequests]);

  /** Handle "New Request" click — gate by auth here, not at page level */
  function handleNewRequest() {
    if (!user) {
      router.push("/login?redirect=/custom-requests/my");
      return;
    }
    setShowPost(true);
  }

  async function acceptBid(requestId: string, bidId: string) {
    if (!confirm("Accept this bid? The request will close and you will see the seller's contact details.")) return;
    setAcceptingId(bidId);
    try {
      await api.put(`/custom-requests/${requestId}/bids/${bidId}/accept`);
      toast.success("Bid accepted! Contact details unlocked.");
      await fetchRequests();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to accept bid");
    } finally {
      setAcceptingId(null);
    }
  }

  async function markComplete(id: string) {
    if (!confirm("Mark this request as completed?")) return;
    try {
      await api.put(`/custom-requests/${id}/complete`);
      toast.success("Marked as completed!");
      await fetchRequests();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to update");
    }
  }

  async function cancelRequest(id: string) {
    if (!confirm("Cancel this request? Sellers who bid will be notified.")) return;
    try {
      await api.put(`/custom-requests/${id}/cancel`);
      toast.success("Request cancelled");
      await fetchRequests();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to cancel");
    }
  }

  // Seller redirect in progress — show nothing
  if (!authLoading && user?.isSeller) return null;

  const isGuest   = !authLoading && !user;
  const displayed = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Custom Requests</h1>
            <p className="text-sm text-gray-500 mt-0.5">Post what you want — let sellers bid to make it for you</p>
          </div>
          <button
            onClick={handleNewRequest}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
            <PlusCircle size={16} /> New Request
          </button>
        </div>

        {/* How it works */}
        <div className="mt-4 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-2xl px-5 py-4">
          <p className="text-sm font-bold text-gray-800 mb-3">How it works</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { n: "1", t: "Post Request", d: "Describe what you want to get made" },
              { n: "2", t: "Sellers Bid",  d: "Sellers send their price & delivery estimate" },
              { n: "3", t: "Accept a Bid", d: "Pick the best bid — contact details unlock" },
              { n: "4", t: "Get Delivered",d: "Coordinate on WhatsApp & receive your item" },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center mx-auto mb-1.5">{s.n}</div>
                <p className="text-xs font-semibold text-gray-800">{s.t}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Guest CTA — shown instead of the list when not logged in */}
      {isGuest ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <MessageSquare size={48} className="mx-auto mb-3 text-emerald-200" />
          <p className="text-lg font-bold text-gray-900 mb-1">Post a Custom Order Request</p>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
            Describe what you want, set your budget, and let sellers bid to make it for you — completely free.
          </p>
          <button
            onClick={handleNewRequest}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors">
            <PlusCircle size={16} /> Post a Request — Login to Continue
          </button>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex gap-1.5 flex-wrap mb-5">
            {(["all","open","closed","completed","cancelled"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${
                  filter === f ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}>
                {f === "all" ? "All" : STATUS_META[f]?.label.split(" — ")[0] || f}
              </button>
            ))}
            <button onClick={fetchRequests} className="ml-auto p-1.5 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <RefreshCw size={13} className={fetching ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Content */}
          {fetching ? (
            <div className="space-y-4">
              {[1,2].map((i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-400">
              <MessageSquare size={48} className="mx-auto mb-3 text-gray-200" />
              <p className="text-base font-semibold text-gray-600">
                {filter === "all" ? "No custom requests yet" : `No ${filter} requests`}
              </p>
              <p className="text-sm mt-1 mb-5">
                {filter === "all" ? "Post your first request and let sellers bid to make it for you!" : ""}
              </p>
              {filter === "all" && (
                <button onClick={handleNewRequest}
                  className="bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors">
                  + Post First Request
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {displayed.map((r) => (
                <RequestCard
                  key={String(r._id)}
                  req={r}
                  onAccept={acceptBid}
                  acceptingId={acceptingId}
                  onComplete={markComplete}
                  onCancel={cancelRequest}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showPost && (
        <PostRequestModal
          onClose={() => setShowPost(false)}
          onCreated={(r) => {
            setRequests((prev) => [r, ...prev]);
            setShowPost(false);
          }}
        />
      )}
    </div>
  );
}
