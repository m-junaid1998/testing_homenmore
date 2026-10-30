"use client";

import React, { useMemo, useState, useCallback, useRef } from "react";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, CheckSquare, Square, X, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProduct } from "../../hooks/useProduct";
import { useCategory } from "../../hooks/useCategory";
import { usePaginationParams } from "../../hooks/Pagination/usePaginationParams";
import { Pagination } from "../../components/Pagination";
import { debounce, validateEmptyObject, calculateDiscount } from "../../utils/helper";
import { Modal } from "../../components/Modal";
import { toast } from "../../utils/toast";

const productSchema = z.object({
  name: z.string().min(1, "Name required"),
  categoryname: z.string().min(1, "Category required"),
  subCategory: z.string().optional().default(""),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  regularPrice: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0),
  description: z.string().min(1, "Description required"),
  isPublished: z.boolean().default(true),
  isBestSeller: z.boolean().default(false),
});

const DEFAULT_FORM_VALUES = {
  name: "", categoryname: "", subCategory: "", stock: 0,
  regularPrice: 0, salePrice: 0, description: "", isPublished: true, isBestSeller: false,
};

const MAX_IMAGES = 6;
const inputStyle = "w-full bg-[var(--color-card-bg)] border border-[var(--color-border)] focus:border-[var(--gold)] text-xs sm:text-sm text-[var(--color-text-dark)] rounded-md px-3 py-2.5 sm:py-3 outline-none font-sans font-semibold transition-all placeholder:text-[var(--color-muted)] disabled:opacity-50 disabled:cursor-not-allowed";
const labelStyle = "block text-[11px] sm:text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-1 font-sans required";

export const AdminProducts: React.FC = () => {
  const { params, setPage, handleSearch } = usePaginationParams({ pageSize: 10, fields: "full" });
  const { products, pagination, createProduct, updateProduct, deleteProduct, togglePublishStatus, isProductMutationLoading } = useProduct(params);
  const { categories } = useCategory({ isAllRecord: true });

  const [state, setState] = useState({
    selectedIds: [] as string[],
    isFormModalOpen: false,
    editingProduct: null as any,
    deletingProduct: null as any,
    existingImages: [] as string[],
    newFiles: [] as File[],
    filePreviews: [] as string[],
    selectedColors: [] as { name: string; hex: string }[],
    colorInput: "",
    pickerHex: "#22c55e",
  });

  const colorInputRef = useRef<HTMLInputElement>(null);
  const [sizes, setSizes] = useState<{ label: string; regularPrice: string; salePrice: string }[]>([]);

  const updateSize = (i: number, patch: Partial<{ label: string; regularPrice: string; salePrice: string }>) =>
    setSizes((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const { register, handleSubmit, watch, reset } = useForm({ resolver: zodResolver(productSchema), defaultValues: DEFAULT_FORM_VALUES });
  const [regPrice, salePrice, selectedCat] = watch(["regularPrice", "salePrice", "categoryname"]);
  const discount = useMemo(() => calculateDiscount(regPrice as string | number, salePrice as string | number), 
  [regPrice, salePrice]);
  const subCategories = useMemo(() => categories.find((c: any) => c._id === selectedCat)?.subCategories || [], [categories, selectedCat]);
  const debouncedSearch = useMemo(() => debounce((val: string) => handleSearch(val), 400), [handleSearch]);

  const cleanupPreviews = useCallback(() => state.filePreviews.forEach((url) => URL.revokeObjectURL(url)), [state.filePreviews]);

  const openFormModal = (product?: any) => {
    cleanupPreviews();
    reset(product ? {
      name: product.name,
      categoryname: typeof product.categoryname === "object" ? product.categoryname._id : product.categoryname,
      subCategory: product.subCategory && product.subCategory !== "None" ? product.subCategory : "",
      stock: Math.max(0, product.stock ?? 0),
      regularPrice: product.regularPrice,
      salePrice: product.salePrice,
      description: product.description || "",
      isPublished: product.isPublished !== false,
      isBestSeller: !!product.isBestSeller,
    } : DEFAULT_FORM_VALUES);

    setSizes((product?.sizes || []).map((s: any) => ({ label: s.label, regularPrice: String(s.regularPrice), salePrice: String(s.salePrice) })));
    const formattedColors = Array.isArray(product?.colors) ? product.colors.map((c: any) => typeof c === "string" ? { name: c, hex: "" } : c) : [];

    setState((prev) => ({
      ...prev, isFormModalOpen: true, editingProduct: product || null, existingImages: product?.images || [],
      newFiles: [], filePreviews: [], selectedColors: formattedColors, colorInput: "", pickerHex: "#22c55e",
    }));
  };

  const closeFormModal = () => {
    cleanupPreviews();
    setState((prev) => ({ ...prev, isFormModalOpen: false, editingProduct: null, newFiles: [], filePreviews: [], selectedColors: [], colorInput: "" }));
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, pickerHex: e.target.value }));
    setTimeout(() => colorInputRef.current?.focus(), 100);
  };

  const handleAddColor = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && "key" in e && e.key !== "Enter") return;
    if (e) e.preventDefault();
    const nameToUse = state.colorInput.trim();
    if (!nameToUse) return toast.error("Please enter a name for the color");
    if (state.selectedColors.some((c) => c.name.toLowerCase() === nameToUse.toLowerCase())) return toast.error("This color name is already added");

    setState((prev) => ({
      ...prev,
      selectedColors: [...prev.selectedColors, { name: nameToUse, hex: prev.pickerHex }],
      colorInput: "",
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const availableSlots = MAX_IMAGES - (state.existingImages.length + state.newFiles.length);
    const files = Array.from(e.target.files).slice(0, availableSlots);
    setState((prev) => ({
      ...prev,
      newFiles: [...prev.newFiles, ...files],
      filePreviews: [...prev.filePreviews, ...files.map((f) => URL.createObjectURL(f))],
    }));
  };

  const onSubmit = async (data: any) => {
    validateEmptyObject({ name: data.name, categoryname: data.categoryname, description: data.description });
    const cleanSizes = sizes.filter((s) => s.label.trim()).map((s) => ({ label: s.label.trim(), regularPrice: Number(s.regularPrice) || 0, salePrice: Number(s.salePrice) || 0 }));
    
    // Clean payload: existingImages sent as JSON string, newFiles sent as File array
    const payloadData = {
      ...data,
      stock: Math.max(0, Number(data.stock) || 0),
      colors: state.selectedColors.map((c) => c.name),
      colorSwatches: state.selectedColors,
      sizes: cleanSizes,
      existingImages: JSON.stringify(state.existingImages),
      images: state.newFiles,
    };

    const res = state.editingProduct ? await updateProduct(state.editingProduct._id, payloadData) : await createProduct(payloadData);
    if (res?.success) closeFormModal();
  };

  const handleDeleteConfirm = async () => {
    if (!state.deletingProduct) return;
    const res = await deleteProduct(state.deletingProduct._id);
    if (res?.success) setState((prev) => ({ ...prev, deletingProduct: null }));
  };

  const isAllSel = products.length > 0 && products.every((p: any) => state.selectedIds.includes(p._id));
  const totalImages = state.existingImages.length + state.newFiles.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-sans font-extrabold tracking-wider uppercase text-[var(--color-text-dark)]">PRODUCT MANAGEMENT</h1>
          <p className="text-xs md:text-sm text-[var(--color-muted)] mt-1 font-sans">
            Manage catalog details (Total: <span className="font-bold text-[var(--gold)]">{pagination?.totalCount || 0}</span>)
          </p>
        </div>
        <button onClick={() => openFormModal()} className="bg-[var(--gold)] hover:opacity-90 text-white text-xs md:text-sm font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-xs font-sans cursor-pointer">
          <Plus className="w-4 h-4 text-white" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
        <input onChange={(e) => debouncedSearch(e.target.value)} placeholder="Search for inventory products..." className="w-full bg-[var(--color-card-bg)] border border-[var(--color-border)] focus:border-[var(--gold)] text-sm rounded-xl pl-12 pr-4 py-3.5 outline-none font-sans text-[var(--color-text-dark)] placeholder:text-[var(--color-muted)] transition-colors" />
      </div>

      {/* Bulk Toolbar */}
      <div className="flex justify-between items-center bg-[var(--color-card-bg)] border border-[var(--color-border)] px-5 py-3.5 rounded-xl">
        <button onClick={() => setState((prev) => ({ ...prev, selectedIds: isAllSel ? [] : products.map((p: any) => p._id) }))} className="flex items-center gap-2.5 text-xs md:text-sm font-bold uppercase text-[var(--color-text-dark)] hover:text-[var(--gold)] font-sans cursor-pointer">
          {isAllSel ? <CheckSquare className="w-4 h-4 text-[var(--gold)]" /> : <Square className="w-4 h-4 text-[var(--color-muted)]" />} Select All ({products.length})
        </button>
        <button disabled={!state.selectedIds.length} onClick={() => togglePublishStatus(state.selectedIds).then(() => setState((prev) => ({ ...prev, selectedIds: [] })))} className={`text-xs font-bold uppercase px-4 py-2 rounded-lg font-sans transition-all ${state.selectedIds.length ? "bg-[var(--gold)] text-[var(--color-primary-foreground)] hover:opacity-90 cursor-pointer" : "bg-[var(--color-bg-light)] text-[var(--color-muted)] border border-[var(--color-border)] cursor-not-allowed opacity-70"}`}>
          Publish / Draft
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p: any) => (
          <div key={p._id} className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="relative aspect-square bg-[var(--color-bg-light)]">
              <img src={p.images?.[0] || "/placeholder.png"} className={`w-full h-full object-cover ${!p.isPublished && "grayscale opacity-75"}`} alt={p.name} />
              <button onClick={() => setState((prev) => ({ ...prev, selectedIds: prev.selectedIds.includes(p._id) ? prev.selectedIds.filter((i) => i !== p._id) : [...prev.selectedIds, p._id] }))} className="absolute top-2 right-2 p-1 bg-black/50 backdrop-blur-xs text-white rounded-md cursor-pointer">
                {state.selectedIds.includes(p._id) ? <CheckSquare className="w-4 h-4 text-[var(--gold)]" /> : <Square className="w-4 h-4" />}
              </button>
            </div>
            <div className="p-4 space-y-2 font-sans">
              <span className="text-xs font-bold uppercase text-[var(--gold)] block tracking-wider">{p.categoryname?.categoryname || p.categoryname}</span>
              <h2 className="font-bold text-base text-[var(--color-text-dark)] line-clamp-1">{p.name}</h2>
              <p className="text-sm font-bold text-[var(--color-text-dark)]">PKR. {p.salePrice} <span className="line-through text-[var(--color-muted)] text-xs font-normal">PKR. {p.regularPrice}</span></p>
              <div className="pt-2 border-t border-[var(--color-border)] flex justify-between items-center text-xs">
                <span className="text-[var(--color-success)] font-bold">{p.stock} In Stock</span>
                <div className="flex gap-2.5 text-[var(--color-muted)] items-center">
                  <button onClick={() => togglePublishStatus(p._id)} className="p-1 cursor-pointer hover:text-[var(--gold)]">{p.isPublished ? <Eye className="w-4 h-4 text-[var(--gold)]" /> : <EyeOff className="w-4 h-4 text-[var(--color-muted)]" />}</button>
                  <button onClick={() => openFormModal(p)} className="p-1 hover:text-[var(--gold)] cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setState((prev) => ({ ...prev, deletingProduct: p }))} className="p-1 hover:text-rose-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pagination?.totalPages > 1 && (
        <div className="pt-4 flex justify-center"><Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={setPage} /></div>
      )}

      {/* Form Modal */}
      {state.isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
          <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto p-4 sm:p-6 space-y-3 no-scrollbar text-[var(--color-text-dark)] shadow-2xl">
            <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-2.5">
              <h2 className="font-bold text-xl sm:text-2xl">{state.editingProduct ? "Edit Product" : "Add Product"}</h2>
              <button onClick={closeFormModal} className="text-[var(--color-muted)] hover:text-[var(--color-text-dark)] p-1 cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className={labelStyle}>Product Images (Max 6)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {state.existingImages.map((src, i) => (
                    <div key={`ext-${i}`} className="relative w-12 h-12 border border-[var(--color-border)] rounded-md overflow-hidden">
                      <img src={src} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={() => setState((p) => ({ ...p, existingImages: p.existingImages.filter((_, idx) => idx !== i) }))} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 cursor-pointer"><X size={10} /></button>
                    </div>
                  ))}
                  {state.filePreviews.map((src, i) => (
                    <div key={`new-${i}`} className="relative w-12 h-12 border border-[var(--gold)] rounded-md overflow-hidden">
                      <img src={src} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={() => setState((p) => ({ ...p, newFiles: p.newFiles.filter((_, idx) => idx !== i), filePreviews: p.filePreviews.filter((_, idx) => idx !== i) }))} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 cursor-pointer"><X size={10} /></button>
                    </div>
                  ))}
                </div>
                {totalImages < MAX_IMAGES && (
                  <label className="border border-dashed border-[var(--color-border)] hover:border-[var(--gold)] rounded-lg p-2.5 text-center bg-[var(--color-bg-light)] flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <Upload size={16} className="text-[var(--gold)] mb-0.5" />
                    <span className="text-[10px] font-bold text-[var(--gold)] uppercase">Upload ({totalImages}/{MAX_IMAGES})</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
              <div><label className={labelStyle}>Product Name</label><input className={inputStyle} {...register("name")} /></div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelStyle}>Category</label>
                  <select className={inputStyle} {...register("categoryname")}>
                    <option value="">Select Category</option>
                    {categories.map((c: any) => <option key={c._id} value={c._id}>{c.categoryname}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>Sub-Category</label>
                  <select className={inputStyle} disabled={!subCategories.length} {...register("subCategory")}>
                    <option value="">Select Sub-Category</option>
                    {subCategories.map((s: string) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div><label className={labelStyle}>Stock</label><input type="number" min={0} className={inputStyle} {...register("stock")} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className={`${labelStyle} before:content-['Reg_price'] sm:before:content-['Regular_Price']`}/><input type="number" min={0} className={inputStyle} {...register("regularPrice")} /></div>
                <div><label className={labelStyle}>Sale Price</label><input type="number" min={0} className={inputStyle} {...register("salePrice")} /></div>
                <div><label className={labelStyle}>Discount</label><div className={`${inputStyle} flex items-center font-bold text-[var(--gold)]`}>{discount}</div></div>
              </div>
              <div>
                <label className={labelStyle}>Available Colors</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {state.selectedColors.map((color, idx) => (
                    <span key={idx} className="bg-[var(--color-bg-light)] text-[var(--color-text-dark)] border border-[var(--color-border)] text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full border border-[var(--color-border)] shrink-0" style={{ backgroundColor: color.hex || color.name.toLowerCase() }} />
                      {color.name}
                      <X size={12} className="cursor-pointer hover:text-red-500 ml-1" onClick={() => setState((p) => ({ ...p, selectedColors: p.selectedColors.filter((_, i) => i !== idx) }))} />
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" value={state.pickerHex} onChange={handlePickerChange} className="w-10 h-10 rounded-md border border-[var(--color-border)] cursor-pointer p-1 bg-[var(--color-card-bg)] shrink-0" title="Pick color" />
                  <input ref={colorInputRef} type="text" value={state.colorInput} onChange={(e) => setState((p) => ({ ...p, colorInput: e.target.value }))} onKeyDown={handleAddColor} placeholder="Type color name & press Add" className={inputStyle} />
                  <button type="button" onClick={handleAddColor} className="bg-[var(--gold)] hover:opacity-90 text-white text-xs font-bold px-4 py-2.5 rounded-md shrink-0 cursor-pointer">Add</button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between"><label className={labelStyle}>Sizes &amp; prices</label><button type="button" onClick={() => setSizes((p) => [...p, { label: "", regularPrice: "", salePrice: "" }])} className="text-[11px] font-bold uppercase text-[var(--gold)] cursor-pointer">+ Add size</button></div>
                {sizes.length > 0 && <p className="text-[10px] text-[var(--color-muted)]">With sizes, the product price is the cheapest size and the price fields above are ignored.</p>}
                {sizes.map((sz, i) => (
                  <div key={i} className="grid grid-cols-[1.2fr_1fr_1fr_auto] gap-2 items-center">
                    <input className={inputStyle} placeholder="Label (e.g. Small)" value={sz.label} onChange={(e) => updateSize(i, { label: e.target.value })} />
                    <input type="number" min={0} className={inputStyle} placeholder="Regular" value={sz.regularPrice} onChange={(e) => updateSize(i, { regularPrice: e.target.value })} />
                    <input type="number" min={0} className={inputStyle} placeholder="Sale" value={sz.salePrice} onChange={(e) => updateSize(i, { salePrice: e.target.value })} />
                    <button type="button" aria-label="Remove size" onClick={() => setSizes((p) => p.filter((_, idx) => idx !== i))} className="text-[var(--color-danger)] cursor-pointer"><X size={14} /></button>
                  </div>
                ))}
              </div>
              <div><label className={labelStyle}>Description</label><textarea rows={2} className={inputStyle} {...register("description")} /></div>
              <div className="flex items-center justify-between bg-[var(--color-bg-light)] p-3 rounded-lg border border-[var(--color-border)]"><span className="text-xs font-bold uppercase text-[var(--color-text-dark)]">Published</span><input type="checkbox" className="w-4 h-4 cursor-pointer" {...register("isPublished")} /></div>
              <div className="flex items-center justify-between bg-[var(--color-bg-light)] p-3 rounded-lg border border-[var(--color-border)]"><span className="text-xs font-bold uppercase text-[var(--color-text-dark)]">Best seller (shown on home page)</span><input type="checkbox" className="w-4 h-4 cursor-pointer" {...register("isBestSeller")} /></div>
              <button type="submit" disabled={isProductMutationLoading} className="w-full bg-[var(--gold)] hover:opacity-90 text-white text-xs font-bold uppercase py-3 rounded-lg transition-all cursor-pointer">
                {isProductMutationLoading ? "Saving..." : state.editingProduct ? "Update Product" : "Add Product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <Modal isOpen={Boolean(state.deletingProduct)} onClose={() => setState((prev) => ({ ...prev, deletingProduct: null }))} onConfirm={handleDeleteConfirm} title="Delete Product" variant="danger" confirmText="Delete" cancelText="Cancel" isLoading={isProductMutationLoading} description={<span className="text-[var(--color-muted)]">Are you sure you want to delete <strong className="text-[var(--color-text-dark)]">{state.deletingProduct?.name}</strong>?</span>} />
    </div>
  );
};

export default AdminProducts;