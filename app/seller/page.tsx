"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { Product, Order } from "@/types";
import { Package, ShoppingBag, Eye, TrendingUp, Plus, Trash2, Truck, CheckCircle } from "lucide-react";
import Button from "@/components/Button";
import { useRequireAuth } from "@/utils/useRequireAuth";

type Tab = "overview" | "products" | "orders";

export default function SellerDashboardPage() {
  const { user, isLoading } = useRequireAuth("/login");
  const router = useRouter();

  const [tab,      setTab]      = useState<Tab>("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [stats,    setStats]    = useState({ totalProducts: 0, activeProducts: 0, totalOrders: 0, pendingOrders: 0 });
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;                         // useRequireAuth handles redirect
    if (!user.isSeller) { router.push("/become-seller"); return; }
    loadData();
  }, [user, isLoading]);

  async function loadData() {
    setLoading(true);
    try {
      const [prRes, orRes] = await Promise.all([
        api.get("/products/my", { params: { limit: 50 } }),
        api.get("/orders/seller", { params: { limit: 50 } }),
      ]);
      setProducts(prRes.data.products);
      setOrders(orRes.data.orders);
      setStats({
        totalProducts:  prRes.data.total,
        activeProducts: prRes.data.products.filter((p: Product) => p.isActive).length,
        totalOrders:    orRes.data.total,
        pendingOrders:  orRes.data.orders.filter((o: Order) =>
          ["pending","confirmed","processing"].includes(o.orderStatus)).length,
      });
    } catch { } finally { setLoading(false); }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      await api.put("/products/" + id, { isActive: !current });
      setProducts((ps) => ps.map((p) => p._id === id ? { ...p, isActive: !current } : p));
    } catch { }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Remove this product?")) return;
    try {
      await api.delete("/products/" + id);
      setProducts((ps) => ps.filter((p) => p._id !== id));
    } catch { }
  }

  async function updateOrderStatus(id: string, status: string) {
    try {
      await api.put("/orders/" + id + "/status", { status });
      setOrders((os) => os.map((o) => o._id === id ? { ...o, orderStatus: status as any } : o));
    } catch { }
  }

  const STAT_CARDS = [
    { label: "Total Products",  value: stats.totalProducts,  icon: Package,     color: "text-[#059669] bg-[#ecfdf5]" },
    { label: "Active Listings", value: stats.activeProducts, icon: Eye,         color: "text-green-700 bg-green-50" },
    { label: "Total Orders",    value: stats.totalOrders,    icon: ShoppingBag, color: "text-blue-700 bg-blue-50" },
    { label: "Pending Orders",  value: stats.pendingOrders,  icon: TrendingUp,  color: "text-amber-700 bg-amber-50" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      <a href="/" className="inline-flex items-center gap-1 text-sm text-[#78716c] hover:text-[#059669] transition-colors mb-5 group">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
        Home
      </a>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1c1917]">Seller Dashboard</h1>
          <p className="text-[#78716c] text-sm">{user?.sellerProfile?.shopName}</p>
        </div>
        <Link href="/seller/new-product">
          <Button><Plus size={16} /> Add Product</Button>
        </Link>
      </div>

      {/* Tab nav */}
      <div className="flex border-b border-[#e7e5e4] mb-8">
        {(["overview","products","orders"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={"px-5 py-3 text-sm font-medium capitalize border-b-2 -mb-px transition-colors " +
              (tab === t ? "border-[#059669] text-[#059669]" : "border-transparent text-[#78716c] hover:text-[#1c1917]")}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* OVERVIEW */}
          {tab === "overview" && (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
                    <div className={"w-10 h-10 rounded-xl flex items-center justify-center mb-3 " + color}>
                      <Icon size={18} />
                    </div>
                    <p className="text-2xl font-extrabold text-[#1c1917]">{value}</p>
                    <p className="text-xs text-[#78716c] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#ecfdf5] rounded-2xl p-6 border border-[#fcd9b0]">
                <h3 className="font-bold text-[#1c1917] mb-3">Seller Tips</h3>
                <ul className="space-y-2 text-sm text-[#57534e]">
                  <li>Use clear, well-lit photos -- products with 4+ images sell 3x better</li>
                  <li>Write a detailed description with materials, size, and care instructions</li>
                  <li>Keep your stock count up-to-date to avoid failed orders</li>
                  <li>Respond to new orders within 24 hours to maintain a high seller rating</li>
                </ul>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {tab === "products" && (
            <div>
              {products.length === 0 ? (
                <div className="text-center py-16">
                  <Package size={48} className="text-[#e7e5e4] mx-auto mb-3" />
                  <p className="text-[#78716c] mb-4">No products yet</p>
                  <Link href="/seller/new-product"><Button>Add Your First Product</Button></Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => {
                    const img = product.images.find((i) => i.isMain)?.url || product.images[0]?.url;
                    return (
                      <div key={product._id} className="bg-white rounded-2xl border border-[#e7e5e4] p-4 flex gap-4 items-start">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f5f5f4] shrink-0">
                          {img && <img src={img} alt={product.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-[#1c1917] text-sm">{product.name}</p>
                              <p className="text-xs text-[#78716c]">{product.category} -- Stock: {product.stock}</p>
                            </div>
                            <span className={"text-xs px-2 py-0.5 rounded-full font-medium " +
                              (product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                              {product.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-bold text-[#059669]">Rs.{product.price.toLocaleString("en-IN")}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleActive(product._id, product.isActive)}
                                className="text-xs px-2.5 py-1 border border-[#e7e5e4] rounded-lg hover:bg-[#ecfdf5] text-[#78716c] transition-colors">
                                {product.isActive ? "Deactivate" : "Activate"}
                              </button>
                              <button className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-400 transition-colors"
                                onClick={() => deleteProduct(product._id)}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ORDERS */}
          {tab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag size={48} className="text-[#e7e5e4] mx-auto mb-3" />
                  <p className="text-[#78716c]">No orders yet</p>
                </div>
              ) : orders.map((order) => (
                <div key={order._id} className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-semibold text-sm text-[#1c1917]">#{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-[#78716c]">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-xs text-[#57534e] mt-1">
                        {(order.buyer as any)?.name} -- {order.shippingAddress.city}, {order.shippingAddress.state}
                      </p>
                    </div>
                    <span className="font-bold text-[#059669] text-sm">Rs.{order.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {order.items.map((item, i) => (
                      <span key={i} className="bg-[#f5f5f4] text-[#57534e] text-xs px-2.5 py-1 rounded-lg">
                        {item.name} x{item.quantity}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.orderStatus === "confirmed" && (
                      <button onClick={() => updateOrderStatus(order._id, "processing")}
                        className="flex items-center gap-1.5 text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-200 transition-colors">
                        <Package size={11} /> Mark Processing
                      </button>
                    )}
                    {order.orderStatus === "processing" && (
                      <button onClick={() => updateOrderStatus(order._id, "shipped")}
                        className="flex items-center gap-1.5 text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition-colors">
                        <Truck size={11} /> Mark Shipped
                      </button>
                    )}
                    {order.orderStatus === "shipped" && (
                      <button onClick={() => updateOrderStatus(order._id, "delivered")}
                        className="flex items-center gap-1.5 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors">
                        <CheckCircle size={11} /> Mark Delivered
                      </button>
                    )}
                    <span className={"text-xs px-2.5 py-1 rounded-lg font-medium capitalize " +
                      (order.orderStatus === "delivered" ? "bg-green-100 text-green-700" :
                       order.orderStatus === "cancelled" ? "bg-red-100 text-red-600" :
                       "bg-[#f5f5f4] text-[#57534e]")}>
                      {order.orderStatus.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}