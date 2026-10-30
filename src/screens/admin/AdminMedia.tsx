"use client";
import { useState, useMemo, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, Upload, Filter, Film, Layers, HardDrive, X, FileText, Eye } from "lucide-react";
import { Button } from "../../components/Button";
import { FormInput } from "../../components/FormInput";
import { FormSelect, type SelectOption } from "../../components/FormSelect";
import { Modal } from "../../components/Modal";
import { TableSkeleton } from "../../components/TableSkeleton";
import { useMedia } from "../../hooks/useMedia";
import { usePaginationParams } from "../../hooks/Pagination/usePaginationParams";
import { validateEmptyObject } from "../../utils/helper";
import { embedUrl } from "../../utils/embed";
import type { MediaItem } from "../../utils/types";

const mediaSchema = z
  .object({
    key: z.string().min(1, "Please enter or select Target Section Key").transform((v) => v.toLowerCase().trim()),
    url: z.string().trim().optional(),
    files: z.custom<FileList>().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.url) {
      if (!embedUrl(v.url)) ctx.addIssue({ code: "custom", path: ["url"], message: "Use a full Instagram, Facebook or TikTok video link" });
    } else if (!v.files?.length) {
      ctx.addIssue({ code: "custom", path: ["files"], message: "Select a file or paste a video link" });
    }
  });

type MediaFormValues = z.infer<typeof mediaSchema>;

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "");

const DEFAULT_KEYS = ["hero", "carousel", "bestselling", "toprated", "reels"];

const AssetCard = ({ item, onDelete }: { item: MediaItem; onDelete: (item: MediaItem) => void }) => (
  <article className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] overflow-hidden transition hover:border-[var(--gold)] hover:shadow-md cursor-pointer">
    <div className="aspect-[4/3] w-full bg-[var(--color-primary)] relative overflow-hidden">
      {item.mediaType === "video" ? (
        <div className="relative w-full h-full">
          {embedUrl(item.mediaUrl) ? (
            <div className="grid h-full w-full place-items-center px-3 text-center text-[11px] font-semibold text-white/90 break-all">{item.mediaUrl}</div>
          ) : (
            <video src={`${item.mediaUrl}#t=0.001`} preload="metadata" playsInline muted className="w-full h-full object-cover" />
          )}
          <Film className="absolute top-3 right-3 w-4 h-4 text-white/80" />
        </div>
      ) : ( <img src={item.mediaUrl} alt={item.key} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /> )}
      <span className="absolute top-1.5 left-1 gap-2 px-2 py-1 rounded-lg text-[9px] font-mono font-bold bg-[var(--greeer)]/90 text-white border border-[var(--gold)]/30 backdrop-blur-md z-10">
        #{capitalize(item.key)}
      </span>
      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 z-10">
        <button type="button" onClick={(e) => { e.stopPropagation(); if (item.mediaUrl) window.open(item.mediaUrl, "_blank", "noopener,noreferrer")}}
         aria-label="Click to view" className="p-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-md cursor-pointer flex items-center justify-center" >
        <Eye className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={(e) => {  e.stopPropagation();  onDelete(item)}} aria-label="Delete asset"
        className="p-1.5 rounded-xl bg-[var(--color-danger)] text-white hover:opacity-90 transition shadow-md cursor-pointer flex items-center justify-center" >
        <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <div className="p-3.5 border-t border-[var(--color-border)]">
      <div className="flex items-center justify-between text-[10px] text-[var(--color-muted)]">
        {item.createdAt && (<time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString("en-GB")}</time>)}
        <span className="uppercase font-mono text-[9px] font-semibold text-[var(--color-success)]">{item.mediaType}</span>
      </div>
    </div>
  </article>
);

const AdminMedia = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { params, setPage } = usePaginationParams({ pageSize: 12 });
  const [selectedKey, setSelectedKey] = useState("ALL");
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; item: MediaItem | null }>({ isOpen: false, item: null });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<MediaFormValues>({
    resolver: zodResolver(mediaSchema),
    defaultValues: { key: "", url: "" },
  });

  const selectedFiles = watch("files");
  const selectedFormKey = watch("key");

  const { mediaList: allMediaList } = useMedia({ isAllRecord: true });
  const { mediaList, isLoadingMedia, uploadMedia, deleteMedia, isMediaMutationLoading } = useMedia({ ...params, key: selectedKey });

  // Extract all unique keys across the entire database
  const uniqueKeys = useMemo(() => {
    const fetchedKeys = (allMediaList?.map((i: MediaItem) => i.key?.toLowerCase()).filter(Boolean) as string[]) || [];
    return Array.from(new Set([...DEFAULT_KEYS, ...fetchedKeys]));
  }, [allMediaList]);

  const formKeyOptions = useMemo<SelectOption[]>(() => [
    ...uniqueKeys.map((k) => ({ label: capitalize(k), value: k }))
  ], [uniqueKeys]);

  const filterKeyOptions = useMemo<SelectOption[]>(() => [
    { label: "All Sections", value: "ALL" },
    ...uniqueKeys.map((k) => ({ label: capitalize(k), value: k })),
  ], [uniqueKeys]);

  const onFormSubmit = async (data: MediaFormValues) => {
    const payload = validateEmptyObject({
      key: data.key,
      url: data.url,
      media: data.url ? undefined : data.files?.[0],
    });

    const res = await uploadMedia(payload as any);

    if (res?.success) { 
      reset({ key: "", url: "" }); 
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteClick = useCallback((item: MediaItem) => setDeleteModal({ isOpen: true, item }), []);
  const filesList = useMemo(() => selectedFiles?.length ? Array.from(selectedFiles) : [], [selectedFiles]);

  const clearSelectedFiles = () => {
    setValue("files", undefined as any, { shouldValidate: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-[var(--color-text-dark)]">MEDIA WORKSPACE</h1>
          <p className="text-xs font-semibold text-[var(--gold)] mt-1">
            <span className="text-xs font-bold text-[var(--color-text-dark)] mt-1">{mediaList?.length || 0}</span> assets • {selectedKey === "ALL" ? "All Sections" : capitalize(selectedKey)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-[var(--color-card-bg)] px-2 py-2 rounded-xl border border-[var(--color-border)] w-full sm:w-auto">
          <Filter className="w-3 h-3 text-[var(--gold)] shrink-0 ml-0.5" />
          <p className="text-[11px] font-medium text-[var(--color-text-dark)] whitespace-nowrap select-none">Filter Section:</p>
          <FormSelect options={filterKeyOptions} value={selectedKey} onChange={(e) => { setSelectedKey(e.target.value); setPage(1); }} className="!py-1 !px-2 text-[11px] rounded-lg bg-[var(--color-bg-light)] font-medium border-none" containerClassName="w-full sm:w-36" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section aria-label="Upload Asset Form" className="lg:col-span-4 bg-[var(--color-card-bg)] rounded-3xl p-6 border border-[var(--color-border)] shadow-sm">
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <FormSelect 
              label="Target Section Key" 
              required 
              placeholder="Select Section Key" 
              options={formKeyOptions} 
              value={selectedFormKey || ""} 
              error={errors.key?.message} 
              onChange={(e) => setValue("key", e.target.value, { shouldValidate: true })} 
            />

            <FormInput label="Video link (optional)" placeholder="Instagram / Facebook / TikTok video URL" {...register("url")} error={errors.url?.message} />
            <p className="text-center text-[10px] font-bold uppercase text-[var(--color-muted)]">or upload a file</p>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">File Stream</label>
              <div className="relative border-2 border-dashed border-[var(--color-border)] hover:border-[var(--gold)] rounded-2xl p-6 text-center transition bg-[var(--color-bg-light)] group cursor-pointer">
                <Upload className="w-6 h-6 mx-auto text-[var(--gold)] mb-2 group-hover:-translate-y-1 transition" />
                <p className="text-xs font-bold text-[var(--color-text-dark)]">Drop media here or browse</p>
                <p className="text-[10px] text-[var(--color-muted)] mt-1">Images or Videos</p>
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  {...register("files")} 
                  ref={(e) => {
                    register("files").ref(e);
                    fileInputRef.current = e;
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>

              {filesList.length > 0 && (
                <div className="mt-3 p-2.5 rounded-xl bg-[var(--color-bg-light)] border border-[var(--color-border)] space-y-1.5">
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-1.5 px-0.5">
                    <span className="text-[11px] font-bold text-[var(--gold)]">✓ {filesList.length} file(s) selected</span>
                    <button type="button" onClick={clearSelectedFiles} className="p-1 text-gray-400 hover:text-red-500 rounded-md cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="max-h-24 overflow-y-auto space-y-1 pt-1">
                    {filesList.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[10px] text-[var(--color-text-dark)] font-medium bg-[var(--color-card-bg)] px-2 py-1 rounded-md border border-[var(--color-border)]">
                        <FileText className="w-3 h-3 text-[var(--gold)] shrink-0" />
                        <span className="truncate flex-1">{file.name}</span>
                        <span className="text-[9px] text-[var(--color-muted)] shrink-0">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {errors.files && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.files.message as string}</p>}
            </div>

            <Button type="submit" isLoading={isMediaMutationLoading} className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-md">
              Publish To Vault
            </Button>
          </form>
        </section>

        <section aria-label="Active Assets Gallery" className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--gold)]" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-dark)]">Active Vault Assets</h2>
            </div>
            <span className="text-[11px] font-semibold text-white uppercase">Key: <strong className="text-[var(--color-primary)]">{selectedKey === "ALL" ? "All" : capitalize(selectedKey)}</strong></span>
          </div>

          {isLoadingMedia ? <TableSkeleton rows={3} columns={3} /> : !mediaList?.length ? (
            <div className="p-16 text-center bg-[var(--color-card-bg)] rounded-3xl border border-dashed border-[var(--color-border)]">
              <HardDrive className="w-10 h-10 mx-auto text-[var(--color-muted)] mb-3" />
              <p className="text-xs font-bold text-[var(--color-text-dark)] uppercase">Vault Empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {mediaList.map((item: MediaItem) => <AssetCard key={item._id} item={item} onDelete={handleDeleteClick} />)}
            </div>
          )}
        </section>
      </div>

      <Modal 
        isOpen={deleteModal.isOpen}  
        onClose={() => setDeleteModal({ isOpen: false, item: null })} 
        onConfirm={async () => { 
          if (deleteModal.item) {
            await deleteMedia(deleteModal.item._id);
          } 
          setDeleteModal({ isOpen: false, item: null }); 
        }} 
        title="Delete Media Asset" 
        variant="danger" 
        confirmText="Yes, Delete" 
        cancelText="Cancel" 
        isLoading={isMediaMutationLoading} 
        description="Are you sure you want to delete this asset?" 
      />
    </main>
  );
};

export default AdminMedia;