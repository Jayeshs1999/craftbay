"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { CustomRequest, Bid } from "@/types";
import toast from "react-hot-toast";
import {
  Tag, Calendar, Banknote, Clock, MessageSquare,
  RefreshCw, ChevronDown, ChevronUp, Send, CheckCircle,
  XCircle, Pencil, Trash2, Loader2, X, Phone,
  ShoppingBag,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(d: string) {
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 3_600_000);
  if (h < 1)  return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function buyerOf(req: CustomRequest) {
  return typeof req.buyer === "object" ? req.buyer : null;
}

// ─── Place / Edit Bid Modal ────────────────────────────────────────────────────

function BidModal({
  req, existing, onClose, onSaved,
}: {
  req: CustomRequest;
  existing: Bid | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [price,        setPrice]        = useState(existing ? String(existing.price)        : "");
  const [deliveryDays, setDeliveryDays] = useState(existing ? String(existing.deliveryDays) : "");
  const [note,         setNote]         = useState(existing?.note || "");
  const [loading,      setLoading]      = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!price || !deliveryDays) { toast.error("Price and delivery days are required"); return; }
    if (Number(price) < 1)        { toast.error("Price must be at least ₹1"); return; }
    if (Number(deliveryDays) < 1) { toast.error("Delivery days must be at least 1"); return; }

    setLoading(true);
    try {
      if (existing) {
        await api.put(`/custom-requests/${req._id}/bids/mine`, {
          price: Number(price), deliveryDays: Number(deliveryDays), note,
        });
        toast.success("Bid updated!");
      } else {
        await api.post(`/custom-requests/${req._id}/bids`, {
          price: Number(price), deliveryDays: Number(deliveryDays), note,
        });
        toast.success("Bid placed! The buyer will be notified.");
      }
      onSaved();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to save bid");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">{existing ? "Update Your Bid" : "Place a Bid"}</h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[280px]">"{req.title}"</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-lg"><X size={16} /></button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {/* Request summary */}
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-1 border border-gray-200">
            <p><strong>Category:</strong> {req.category}</p>
            {req.budget && <p><strong>Buyer's budget hint:</strong> Up to ₹{Number(req.budget).toLocaleString("en-IN")}</p>}
            {req.deadline && <p><strong>Needed by:</strong> {fmtDate(req.deadline)}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Your Price (₹) <span className="text-red-500">*</span></label>
              <input type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Delivery Days <span className="text-red-500">*</span></label>
              <input type="number" min="1" value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)}
                placeholder="e.g. 7"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Your Note to Buyer <span className="text-gray-400">(optional but recommended)</span>
            </label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1000}
              placeholder="Describe your experience with this type of work, material you'll use, what makes your craft special, etc."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 resize-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
            <p className="text-[11px] text-gray-400 mt-1 text-right">{note.length}/1000</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 text-xs text-blue-800">
            💡 <strong>Tip:</strong> Buyers see all bids sorted by price. A helpful note explaining your skills gives you a big advantage over just a number!
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-emerald-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                       : <><Send size={14} /> {existing ? "Update Bid" : "Place Bid"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Single Request Card (seller view) ────────────────────────────────────────

function SellerRequestCard({
  req, onBidSaved, onWithdraw,
}: {
  req: CustomRequest;
  onBidSaved: () => void;
  onWithdraw: (requestId: string) => void;
}) {
  const [expanded,    setExpanded]   = useState(false);
  const [showModal,   setShowModal]  = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const myBid       = req.myBid || null;
  const buyer       = buyerOf(req);
  const isCancelled = req.status === "cancelled";
  const isClosed    = req.status !== "open";

  async function withdraw() {
    if (!confirm("Withdraw your bid? This cannot be undone.")) return;
    setWithdrawing(true);
    try {
      await api.delete(`/custom-requests/${req._id}/bids/mine`);
      toast.success("Bid withdrawn");
      onWithdraw(String(req._id));
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to withdraw bid");
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <>
      <div className={`bg-white rounded-2xl border overflow-hidden transition-all ${
        isCancelled                 ? "border-red-200 bg-red-50/30 opacity-80"
        : myBid?.status === "accepted" ? "border-emerald-300 ring-2 ring-emerald-500/20"
        : isClosed                  ? "border-gray-200 opacity-75"
        : myBid                     ? "border-blue-200"
        : "border-gray-200 hover:border-gray-300"
      }`}>
        <div className="p-5">
          {/* Top row */}
          <div className="flex items-start gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {/* Status pill */}
                {isCancelled ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-600 flex items-center gap-1">
                    <XCircle size={10} /> Buyer Cancelled
                  </span>
                ) : myBid?.status === "accepted" ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    <CheckCircle size={10} /> Bid Accepted!
                  </span>
                ) : myBid?.status === "rejected" ? (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">Not Selected</span>
                ) : myBid ? (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                    <Send size={9} /> Bid Placed
                  </span>
                ) : isClosed ? (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">Closed</span>
                ) : (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Open</span>
                )}
                <span className="text-[11px] text-gray-400 flex items-center gap-1"><Clock size={10} /> {timeAgo(req.createdAt)}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 leading-snug">{req.title}</h3>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs text-gray-500 flex items-center gap-1"><Tag size={11} /> {req.category}</span>
                {req.budget && <span className="text-xs text-gray-500 flex items-center gap-1"><Banknote size={11} /> Budget ₹{Number(req.budget).toLocaleString("en-IN")}</span>}
                {req.deadline && <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={11} /> By {fmtDate(req.deadline)}</span>}
                {buyer && <span className="text-xs text-gray-400">by <strong className="text-gray-600">{buyer.name}</strong></span>}
              </div>
            </div>

            {/* My bid summary */}
            {myBid && (
              <div className={`text-right shrink-0 rounded-xl px-3 py-2 border ${
                myBid.status === "accepted" ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"
              }`}>
                <p className="text-base font-extrabold text-gray-900">₹{Number(myBid.price).toLocaleString("en-IN")}</p>
                <p className="text-[11px] text-gray-500">{myBid.deliveryDays}d delivery</p>
              </div>
            )}

            {!myBid && !isClosed && (
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-800">{req.bids.length} bid{req.bids.length !== 1 ? "s" : ""}</p>
                <p className="text-[11px] text-gray-400">so far</p>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed">{req.description}</p>

          {/* Cancelled notice */}
          {isCancelled && myBid && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3.5">
              <p className="text-xs font-bold text-red-700 flex items-center gap-1.5 mb-1">
                <XCircle size={13} /> Request cancelled by buyer
              </p>
              <p className="text-[11px] text-red-600 leading-relaxed">
                Your bid of <strong>₹{Number(myBid.price).toLocaleString("en-IN")}</strong> has been voided. No action needed.
              </p>
            </div>
          )}

          {/* Accepted — show buyer contact so seller can reach out */}
          {!isCancelled && myBid?.status === "accepted" && (
            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-2">
              <p className="text-xs font-bold text-emerald-700">🎉 Your bid was accepted!</p>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Contact the buyer to confirm delivery location and get started.
              </p>
              {req.buyerPhone && (
                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                  <a href={`tel:${req.buyerPhone.replace(/\D/g, "")}`}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors">
                    <Phone size={11} /> {req.buyerPhone}
                  </a>
                  <a href={`https://wa.me/${req.buyerPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                    💬 WhatsApp Buyer
                  </a>
                </div>
              )}
              {buyer?.name && (
                <p className="text-[11px] text-gray-500 pt-0.5">Buyer: <strong className="text-gray-700">{buyer.name}</strong></p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <button onClick={() => setExpanded((x) => !x)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {expanded ? "Hide Details" : "View Full Request"}
            </button>

            {!isCancelled && !isClosed && !myBid && (
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors">
                <Send size={12} /> Place Bid
              </button>
            )}

            {!isCancelled && !isClosed && myBid?.status === "pending" && (
              <>
                <button onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                  <Pencil size={12} /> Edit Bid
                </button>
                <button onClick={withdraw} disabled={withdrawing}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  {withdrawing ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  Withdraw
                </button>
              </>
            )}
          </div>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-3">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Full Description</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{req.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-1.5">
                <p className="font-bold text-gray-500 uppercase tracking-widest text-[10px]">Details</p>
                <p><span className="text-gray-400">Category:</span> <span className="font-semibold text-gray-700">{req.category}</span></p>
                {req.budget && <p><span className="text-gray-400">Budget:</span> <span className="font-semibold text-emerald-700">₹{Number(req.budget).toLocaleString("en-IN")}</span></p>}
                {req.deadline && <p><span className="text-gray-400">Deadline:</span> <span className="font-semibold text-gray-700">{fmtDate(req.deadline)}</span></p>}
                <p><span className="text-gray-400">Posted:</span> <span className="font-semibold text-gray-700">{timeAgo(req.createdAt)}</span></p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-1.5">
                <p className="font-bold text-gray-500 uppercase tracking-widest text-[10px]">Competition</p>
                <p className="text-2xl font-extrabold text-gray-900">{req.bids.length}</p>
                <p className="text-gray-400">bid{req.bids.length !== 1 ? "s" : ""} placed so far</p>
                {req.bids.length > 0 && (
                  <p className="text-gray-400">
                    Lowest: <span className="font-semibold text-emerald-700">
                      ₹{Math.min(...req.bids.map((b) => b.price)).toLocaleString("en-IN")}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {myBid && (
              <div className={`rounded-xl border p-3.5 text-xs ${
                myBid.status === "accepted" ? "bg-emerald-50 border-emerald-200"
                : myBid.status === "rejected" ? "bg-gray-50 border-gray-200"
                : "bg-blue-50 border-blue-200"
              }`}>
                <p className="font-bold text-gray-700 mb-2">Your Bid</p>
                <div className="flex gap-4 flex-wrap">
                  <p><span className="text-gray-400">Price:</span> <strong>₹{Number(myBid.price).toLocaleString("en-IN")}</strong></p>
                  <p><span className="text-gray-400">Delivery:</span> <strong>{myBid.deliveryDays} days</strong></p>
                  <p><span className="text-gray-400">Status:</span> <strong className="capitalize">{myBid.status}</strong></p>
                </div>
                {myBid.note && <p className="mt-2 text-gray-600 italic">"{myBid.note}"</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <BidModal
          req={req}
          existing={myBid && myBid.status === "pending" ? myBid : null}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); onBidSaved(); }}
        />
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ViewMode = "open" | "mybids";

export default function SellerCustomRequestsPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();

  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [fetching, setFetching] = useState(false);
  const [view,     setView]     = useState<ViewMode>("open");

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login?redirect=/seller/custom-requests"); return; }
    if (!authLoading && user && !user.isSeller) { router.replace("/become-seller"); }
  }, [user, authLoading, router]);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    try {
      const { data } = await api.get("/custom-requests/my/seller", {
        params: { mine: view === "mybids" ? "true" : "false" },
      });
      setRequests(data.requests);
    } catch { toast.error("Failed to load requests"); }
    finally { setFetching(false); }
  }, [user, view]);

  useEffect(() => {
    if (user?.isSeller) fetchRequests();
  }, [user, fetchRequests]);

  function handleWithdraw(requestId: string) {
    setRequests((prev) =>
      prev.map((r) =>
        String(r._id) === requestId
          ? { ...r, myBid: null }
          : r
      )
    );
  }

  if (authLoading || !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        {[1,2,3].map((i) => <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  const myBidsCount   = requests.filter((r) => r.myBid).length;
  const openCount     = requests.filter((r) => r.status === "open" && !r.myBid).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Custom Requests</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Browse what buyers want made — place bids and win custom orders
        </p>
      </div>

      {/* How it works (collapsed tip) */}
      <div className="mb-5 bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-2xl px-5 py-4">
        <p className="text-xs font-bold text-gray-700 mb-2">How bidding works</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          {[
            { n: "1", t: "Browse Requests", d: "See what buyers want" },
            { n: "2", t: "Place Your Bid",  d: "Set your price + timeline" },
            { n: "3", t: "Buyer Reviews",    d: "Buyer picks the best bid" },
            { n: "4", t: "Direct Delivery",  d: "Discuss & deliver on WhatsApp" },
          ].map((s) => (
            <div key={s.n} className="text-center">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mx-auto mb-1">{s.n}</div>
              <p className="text-[11px] font-semibold text-gray-700">{s.t}</p>
              <p className="text-[10px] text-gray-400">{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setView("open")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            view === "open" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}>
          <ShoppingBag size={14} /> Open Requests
          {openCount > 0 && (
            <span className={`ml-1 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${view === "open" ? "bg-white text-gray-900" : "bg-emerald-600 text-white"}`}>
              {openCount}
            </span>
          )}
        </button>
        <button onClick={() => setView("mybids")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            view === "mybids" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}>
          <Send size={14} /> My Bids
          {myBidsCount > 0 && (
            <span className={`ml-1 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${view === "mybids" ? "bg-white text-gray-900" : "bg-blue-600 text-white"}`}>
              {myBidsCount}
            </span>
          )}
        </button>
        <button onClick={fetchRequests} className="ml-auto p-2 text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <RefreshCw size={13} className={fetching ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Content */}
      {fetching ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-400">
          <MessageSquare size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="text-base font-semibold text-gray-600">
            {view === "open" ? "No open requests right now" : "You haven't placed any bids yet"}
          </p>
          <p className="text-sm mt-1">
            {view === "open"
              ? "New buyer requests will appear here. Check back soon!"
              : "Browse open requests and place your first bid to win a custom order!"}
          </p>
          {view === "mybids" && (
            <button onClick={() => setView("open")}
              className="mt-4 bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors">
              Browse Open Requests
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <SellerRequestCard
              key={String(r._id)}
              req={r}
              onBidSaved={fetchRequests}
              onWithdraw={handleWithdraw}
            />
          ))}
        </div>
      )}
    </div>
  );
}
