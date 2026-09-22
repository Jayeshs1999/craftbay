"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Upload, X, Settings2 } from "lucide-react";
import toast from "react-hot-toast";
import FieldLabel from "@/components/FieldLabel";

const CATEGORIES = [
  "Jewellery","Home Decor","Clothing","Pottery","Paintings",
  "Candles","Bags","Skincare","Toys","Stationery","Food","Other",
];

interface ExistingImage {
  url: string;
  publicId: string;
  isMain: boolean;
}

export default function EditProductPage() {
  const user   = useAuthStore((s) => s.user);
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id     = params.id;

  const [form, setForm] = useState({
    name: "", description: "", shortDesc: "",
    price: "", comparePrice: "", stock: "", sku: "",
    category: "", subCategory: "", tags: "",
    weight: "", freeShipping: false,
    isCustomizable: false,
    customizationDays: "",
    customizationNote: "",
  });

  // Existing (server) images that are still kept
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  // New image files the seller is adding
  const [newImages,   setNewImages]   = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [fetching, setFetching] = useState(true);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await api.get(`/products/${id}/edit`);
        setExistingImages(data.images || []);
        setForm({
          name:              data.name         || "",
          description:       data.description  || "",
          shortDesc:         data.shortDesc    || "",
          price:             String(data.price ?? ""),
          comparePrice:      data.comparePrice != null ? String(data.comparePrice) : "",
          stock:             String(data.stock ?? ""),
          sku:               data.sku          || "",
          category:          data.category     || "",
          subCategory:       data.subCategory  || "",
          tags:              Array.isArray(data.tags) ? data.tags.join(", ") : (data.tags || ""),
          weight:            data.weight != null ? String(data.weight) : "",
          freeShipping:      Boolean(data.freeShipping),
          isCustomizable:    Boolean(data.isCustomizable),
          customizationDays: data.customizationDays ? String(data.customizationDays) : "",
          customizationNote: data.customizationNote || "",
        });
      } catch {
        toast.error("Failed to load product");
        router.push("/seller");
      } finally {
        setFetching(false);
      }
    })();
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const t = e.target as HTMLInputElement;
    setForm((f) => ({ ...f, [t.name]: t.type === "checkbox" ? t.checked : t.value }));
  }

  function handleNewImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const total = existingImages.length + newImages.length + files.length;
    if (total > 6) { toast.error("Max 6 images total"); return; }
    setNewImages((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setNewPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
    e.target.value = "";
  }

  async function removeExistingImage(img: ExistingImage) {
    const remaining = existingImages.filter((i) => i.publicId !== img.publicId);
    if (remaining.length === 0 && newImages.length === 0) {
      toast.error("Product must have at least one image");
      return;
    }
    try {
      await api.delete(`/products/${id}/image`, { data: { publicId: img.publicId } });
      setExistingImages(remaining);
    } catch {
      toast.error("Failed to remove image");
    }
  }

  function removeNewImage(i: number) {
    setNewImages((prev) => prev.filter((_, idx) => idx !== i));
    setNewPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (existingImages.length === 0 && newImages.length === 0) {
      toast.error("Product must have at least one image");
      return;
    }
    if (form.isCustomizable && (!form.customizationDays || Number(form.customizationDays) < 1)) {
      toast.error("Please enter how many days you need to complete the customization");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      newImages.forEach((img) => fd.append("images", img));
      await api.put(`/products/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Product updated!");
      router.push("/seller");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  const totalImages = existingImages.length + newImages.length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <a href="/seller" className="inline-flex items-center gap-1 text-sm text-[#78716c] hover:text-[#059669] transition-colors mb-5 group">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
        Back to Dashboard
      </a>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#1c1917]">Edit Product</h1>
        <p className="text-[#78716c] text-sm">Update your product details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Images */}
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6">
          <h2 className="font-bold text-[#1c1917] mb-1">Product Images *</h2>
          <p className="text-xs text-[#78716c] mb-4">Up to 6 images. First image is the main photo.</p>
          <div className="flex flex-wrap gap-3">
            {/* Existing images */}
            {existingImages.map((img, i) => (
              <div key={img.publicId} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#e7e5e4]">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                {img.isMain && (
                  <span className="absolute bottom-0 left-0 right-0 bg-[#059669] text-white text-[10px] text-center py-0.5">
                    Main
                  </span>
                )}
                <button type="button" onClick={() => removeExistingImage(img)}
                  className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow">
                  <X size={10} />
                </button>
              </div>
            ))}
            {/* New images being added */}
            {newPreviews.map((src, i) => (
              <div key={`new-${i}`} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#e7e5e4]">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-[10px] text-center py-0.5">
                  New
                </span>
                <button type="button" onClick={() => removeNewImage(i)}
                  className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow">
                  <X size={10} />
                </button>
              </div>
            ))}
            {totalImages < 6 && (
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-[#e7e5e4] flex flex-col items-center justify-center cursor-pointer hover:border-[#059669] hover:bg-[#ecfdf5] transition-all text-[#78716c] hover:text-[#059669]">
                <Upload size={20} className="mb-1" />
                <span className="text-xs">Add photo</span>
                <input type="file" accept="image/*" multiple onChange={handleNewImages} className="hidden" />
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
            <FieldLabel required>Description</FieldLabel>
            <textarea
              name="description" value={form.description} onChange={handleChange} rows={4} required
              placeholder="Describe your product — materials, dimensions, how it was made, care instructions..."
              className="w-full rounded-xl border border-[#e7e5e4] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#059669] resize-none" />
          </div>
          <Input
            label="Short Description" name="shortDesc" value={form.shortDesc} onChange={handleChange}
            placeholder="One-line tagline shown on the product card" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Category</FieldLabel>
              <select
                name="category" value={form.category} onChange={handleChange} required
                className="w-full rounded-xl border border-[#e7e5e4] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#059669]">
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
            placeholder="handmade, pottery, gift — comma separated"
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

        {/* Customization */}
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Settings2 size={18} className="text-[#059669]" />
            <h2 className="font-bold text-[#1c1917]">Customization</h2>
          </div>
          <p className="text-xs text-[#78716c] -mt-2">
            Enable this if buyers can request personalised versions of this product.
          </p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox" name="isCustomizable"
              checked={form.isCustomizable as unknown as boolean}
              onChange={handleChange} className="accent-[#059669] w-4 h-4" />
            <span className="text-sm text-[#1c1917] font-medium">This product can be customised</span>
          </label>
          {form.isCustomizable && (
            <div className="space-y-4 pl-6 border-l-2 border-[#a7f3d0]">
              <Input
                label="Days needed to complete customisation *"
                name="customizationDays"
                type="number"
                min="1"
                value={form.customizationDays}
                onChange={handleChange}
                placeholder="e.g. 7"
                helpText="Buyers will see this as the estimated time to prepare their custom order"
                required={form.isCustomizable as unknown as boolean}
              />
              <div>
                <FieldLabel>Instructions for buyers</FieldLabel>
                <textarea
                  name="customizationNote"
                  value={form.customizationNote}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g. Please share the name to engrave, preferred colour, and any reference images."
                  className="w-full rounded-xl border border-[#e7e5e4] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#059669] resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6 space-y-4">
          <h2 className="font-bold text-[#1c1917]">Shipping</h2>
          <Input
            label="Weight (grams)" name="weight" type="number" value={form.weight}
            onChange={handleChange} placeholder="200"
            helpText="Shown on the product page. Optional." />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox" name="freeShipping"
              checked={form.freeShipping as unknown as boolean}
              onChange={handleChange} className="accent-[#059669] w-4 h-4" />
            <span className="text-sm text-[#1c1917]">Offer free shipping on this product</span>
          </label>
          {form.freeShipping && (
            <p className="text-xs text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl px-3 py-2">
              Buyers will see &quot;Free shipping&quot; on this product, overriding your shop-level delivery charge.
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading} size="lg">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
