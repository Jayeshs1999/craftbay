"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Upload, X, Plus } from "lucide-react";

const CATEGORIES = [
  "Jewellery","Home Decor","Clothing","Pottery","Paintings",
  "Candles","Bags","Skincare","Toys","Stationery","Food","Other",
];

export default function NewProductPage() {
  const user   = useAuthStore((s) => s.user);
  const router = useRouter();

  const [form, setForm] = useState({
    name: "", description: "", shortDesc: "",
    price: "", comparePrice: "", stock: "", sku: "",
    category: "", subCategory: "", tags: "",
    weight: "", freeShipping: false, shippingCharge: "",
  });
  const [images,   setImages]   = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const t = e.target as HTMLInputElement;
    setForm((f) => ({ ...f, [t.name]: t.type === "checkbox" ? t.checked : t.value }));
  }

  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 6) { setError("Max 6 images"); return; }
    setImages((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
    e.target.value = "";
  }

  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (images.length === 0) { setError("Please add at least one image"); return; }
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      images.forEach((img) => fd.append("images", img));
      await api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
      router.push("/seller");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <a href="/seller" className="inline-flex items-center gap-1 text-sm text-[#78716c] hover:text-[#c05621] transition-colors mb-5 group">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
        Back to Dashboard
      </a>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#1c1917]">Add New Product</h1>
        <p className="text-[#78716c] text-sm">List your handmade creation for buyers to discover</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Images */}
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6">
          <h2 className="font-bold text-[#1c1917] mb-1">Product Images *</h2>
          <p className="text-xs text-[#78716c] mb-4">Add up to 6 images. First image will be the main photo.</p>
          <div className="flex flex-wrap gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#e7e5e4]">
                <img src={src} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-[#c05621] text-white text-[10px] text-center py-0.5">
                    Main
                  </span>
                )}
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow">
                  <X size={10} />
                </button>
              </div>
            ))}
            {previews.length < 6 && (
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-[#e7e5e4] flex flex-col items-center justify-center cursor-pointer hover:border-[#c05621] hover:bg-[#fef3e8] transition-all text-[#78716c] hover:text-[#c05621]">
                <Upload size={20} className="mb-1" />
                <span className="text-xs">Add photo</span>
                <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6 space-y-4">
          <h2 className="font-bold text-[#1c1917]">Basic Information</h2>
          <Input
            label="Product Name *" name="name" value={form.name} onChange={handleChange}
            placeholder="e.g. Hand-painted Terracotta Vase" required />
          <div>
            <label className="text-sm font-medium text-[#1c1917] block mb-1">Description *</label>
            <textarea
              name="description" value={form.description} onChange={handleChange} rows={4} required
              placeholder="Describe your product -- materials, dimensions, how it was made, care instructions..."
              className="w-full rounded-xl border border-[#e7e5e4] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#c05621] resize-none" />
          </div>
          <Input
            label="Short Description" name="shortDesc" value={form.shortDesc} onChange={handleChange}
            placeholder="One-line tagline shown on the product card" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#1c1917] block mb-1">Category *</label>
              <select
                name="category" value={form.category} onChange={handleChange} required
                className="w-full rounded-xl border border-[#e7e5e4] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#c05621]">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input
              label="Sub-category" name="subCategory" value={form.subCategory}
              onChange={handleChange} placeholder="e.g. Earrings" />
          </div>
          <Input
            label="Tags" name="tags" value={form.tags} onChange={handleChange}
            placeholder="handmade, pottery, gift -- comma separated"
            helpText="Add tags to help buyers find your product" />
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6 space-y-4">
          <h2 className="font-bold text-[#1c1917]">Pricing &amp; Inventory</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Price (Rs.) *" name="price" type="number" min="1" value={form.price} onChange={handleChange} placeholder="499" required />
            <Input label="Compare Price (Rs.)" name="comparePrice" type="number" value={form.comparePrice} onChange={handleChange} placeholder="699" helpText="Crossed-out price" />
            <Input label="Stock *" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="10" required />
          </div>
          <Input label="SKU" name="sku" value={form.sku} onChange={handleChange} placeholder="Optional product code" />
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6 space-y-4">
          <h2 className="font-bold text-[#1c1917]">Shipping</h2>
          <Input
            label="Weight (grams)" name="weight" type="number" value={form.weight}
            onChange={handleChange} placeholder="200"
            helpText="Used to calculate platform delivery charge" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox" name="freeShipping"
              checked={form.freeShipping as unknown as boolean}
              onChange={handleChange} className="accent-[#c05621] w-4 h-4" />
            <span className="text-sm text-[#1c1917]">Offer free shipping on this product</span>
          </label>
          {!form.freeShipping && (
            <Input
              label="Your Shipping Charge (Rs.)" name="shippingCharge" type="number"
              value={form.shippingCharge} onChange={handleChange}
              placeholder="0 = use platform calculation" />
          )}
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading} size="lg">
            <Plus size={16} /> Publish Product
          </Button>
        </div>
      </form>
    </div>
  );
}