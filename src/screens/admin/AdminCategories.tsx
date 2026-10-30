"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderPlus, Plus, Search, Edit2, Trash2, ChevronRight, ChevronDown, Layers, Check, X } from "lucide-react";
import { FormInput } from "../../components/FormInput";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { useCategory } from "../../hooks/useCategory";
import { usePaginationParams } from "../../hooks/Pagination/usePaginationParams";
import { debounce } from "../../utils/helper";

const catSchema = z.object({ categoryname: z.string().min(1, "Category Name is required") });
type CatForm = z.infer<typeof catSchema>;

const AdminCategories = () => {
  const { params, handleSearch } = usePaginationParams({ isAllRecord: true });
  const { categories, isLoadingCategories, createCategory, updateCategory, deleteCategory, addSubCategory, updateSubCategory, removeSubCategory, isCategoryMutationLoading } = useCategory({ ...params, sortOn: params.sortOn as "categoryname" | "order" | "createdAt" | undefined });
  const [ui, setUi] = useState({ openId: null as string | null, editCat: null as { id: string; name: string } | null, subInputs: {} as Record<string, string>, subErrors: {} as Record<string, string>, editSub: null as { catId: string; oldName: string; newName: string } | null, modal: { isOpen: false, title: "", desc: null as React.ReactNode, onConfirm: () => {} } });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CatForm>({ resolver: zodResolver(catSchema) });
  const closeModal = () => setUi((p) => ({ ...p, modal: { ...p.modal, isOpen: false } }));
  const onDebouncedSearch = debounce((val: string) => handleSearch(val), 500);

  const onSave = async (data: CatForm) => {
    if ((ui.editCat ? await updateCategory(ui.editCat.id, data.categoryname) : await createCategory({ categoryname: data.categoryname, subCategories: [] }))?.success) { reset(); setUi((p) => ({ ...p, editCat: null })); }
  };

  const handleAddSub = async (id: string) => {
    const name = ui.subInputs[id]?.trim();
    if (!name) return setUi((p) => ({ ...p, subErrors: { ...p.subErrors, [id]: "Sub category name is required" } }));
    if ((await addSubCategory(id, name))?.success) setUi((p) => ({ ...p, subInputs: { ...p.subInputs, [id]: "" }, subErrors: { ...p.subErrors, [id]: "" } }));
  };

  const handleUpdateSub = async (id: string, oldName: string, newName: string) => {
    if (newName.trim() && (await updateSubCategory(id, { oldSubCategoryName: oldName, newSubCategoryName: newName }))?.success) setUi((p) => ({ ...p, editSub: null }));
  };

  return (
    <div className="space-y-6">
      <Modal isOpen={ui.modal.isOpen} onClose={closeModal} onConfirm={ui.modal.onConfirm} title={ui.modal.title} description={ui.modal.desc} variant="danger" />
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-[var(--color-card-bg)] p-5 rounded-2xl border border-[var(--color-border)] shadow-xs">
        <div>
          <h1 className="text-base font-bold uppercase tracking-wider text-[var(--color-text-dark)] font-sans">Category Management</h1>
          <p className="text-xs text-[var(--color-muted)] font-sans">Manage main & sub categories</p>
        </div>
        <div className="w-full sm:w-72">
          <FormInput placeholder="Search..." onChange={(e) => onDebouncedSearch(e.target.value)} leftIcon={<Search className="w-4 h-4 text-[var(--color-muted)]" />} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        <div className="bg-[var(--color-card-bg)] p-5 rounded-2xl border border-[var(--color-border)] shadow-xs space-y-4 h-fit">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-[var(--color-text-dark)] font-sans">
            <FolderPlus className="w-4 h-4 text-[var(--gold)]" />{ui.editCat ? "Edit Category" : "Add Category"}
          </div>
          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <FormInput label="Category Name" placeholder="e.g. Jewellery" {...register("categoryname")} error={errors.categoryname?.message} />
            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="sm" disabled={isCategoryMutationLoading} className="flex-1 bg-[var(--gold)] text-[var(--color-primary-foreground)] hover:opacity-90">{ui.editCat ? "Update" : "Create"}</Button>
              {ui.editCat && <Button type="button" variant="outline" size="sm" onClick={() => { setUi((p) => ({ ...p, editCat: null })); reset(); }}>Cancel</Button>}
            </div>
          </form>
        </div>
        <div className="lg:col-span-2 space-y-3 font-sans">
          {isLoadingCategories ? <p className="text-xs text-[var(--color-muted)] p-4 font-sans">Loading categories...</p> : categories.map((cat: any) => (
            <div key={cat._id} className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] shadow-xs overflow-hidden">
              <div className="p-4 flex justify-between items-center hover:bg-[var(--color-bg-light)] transition-colors">
                <button onClick={() => setUi((p) => ({ ...p, openId: p.openId === cat._id ? null : cat._id }))} className="flex items-center gap-3 font-bold text-xs uppercase cursor-pointer text-[var(--color-text-dark)]">
                  {ui.openId === cat._id ? <ChevronDown className="w-4 h-4 text-[var(--gold)]" /> : <ChevronRight className="w-4 h-4 text-[var(--color-muted)]" />}
                  <span>{cat.categoryname}</span><span className="text-[10px] text-[var(--color-muted)] lowercase font-normal">({cat.subCategories?.length || 0} sub)</span>
                </button>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="sm" className="!p-1.5 text-[var(--color-muted)] hover:text-[var(--gold)]" onClick={() => { setUi((p) => ({ ...p, editCat: { id: cat._id, name: cat.categoryname } })); setValue("categoryname", cat.categoryname); }}><Edit2 className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="!p-1.5 text-rose-500 hover:text-rose-600" onClick={() => setUi((p) => ({ ...p, modal: { isOpen: true, title: "Delete Category", desc: <span className="text-[var(--color-muted)]">Delete <strong className="text-[var(--color-text-dark)]">{cat.categoryname}</strong>?</span>, onConfirm: () => deleteCategory(cat._id).then(closeModal) } }))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              {ui.openId === cat._id && (
                <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-light)] space-y-3">
                  <div className="flex gap-2 items-start">
                    <FormInput placeholder="Add subcategory..." value={ui.subInputs[cat._id] || ""} error={ui.subErrors[cat._id]} onChange={(e) => setUi((p) => ({ ...p, subInputs: { ...p.subInputs, [cat._id]: e.target.value }, subErrors: { ...p.subErrors, [cat._id]: "" } }))} containerClassName="flex-1" />
                    <Button variant="secondary" className="h-[42px] bg-[var(--gold)] text-[var(--color-primary-foreground)] hover:opacity-90 cursor-pointer" size="sm" onClick={() => handleAddSub(cat._id)} leftIcon={<Plus className="w-3.5 h-3.5" />}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {cat.subCategories?.map((sub: string) => (
                      <div key={sub} className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-full text-xs font-medium text-[var(--color-text-dark)]">
                        <Layers className="w-3 h-3 text-[var(--gold)] shrink-0" />
                        {ui.editSub?.catId === cat._id && ui.editSub?.oldName === sub ? (
                          <div className="flex items-center gap-1">
                            <input autoFocus value={ui.editSub.newName} onChange={(e) => setUi((p) => ({ ...p, editSub: { ...p.editSub!, newName: e.target.value } }))} className="w-20 px-1 border border-[var(--gold)] bg-[var(--color-card-bg)] text-[var(--color-text-dark)] rounded text-xs outline-none" />
                            <button onClick={() => handleUpdateSub(cat._id, sub, ui.editSub!.newName)} className="text-[var(--color-success)] hover:text-emerald-600 cursor-pointer"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setUi((p) => ({ ...p, editSub: null }))} className="text-[var(--color-muted)] hover:text-[var(--color-text-dark)] cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <><span>{sub}</span><div className="flex items-center gap-2 ml-1 border-l border-[var(--color-border)] pl-1.5">
                            <button onClick={() => setUi((p) => ({ ...p, editSub: { catId: cat._id, oldName: sub, newName: sub } }))} className="text-[var(--color-muted)] hover:text-[var(--gold)] cursor-pointer"><Edit2 className="w-3 h-3" /></button>
                            <button onClick={() => setUi((p) => ({ ...p, modal: { isOpen: true, title: "Delete Subcategory", desc: <span className="text-[var(--color-muted)]">Delete <strong className="text-[var(--color-text-dark)]">{sub}</strong>?</span>, onConfirm: () => removeSubCategory(cat._id, sub).then(closeModal) } }))} className="text-[var(--color-muted)] hover:text-rose-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div></>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;