"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/utils/toast";
import { Star, MessageSquare, User, Tag, Trash2, X, ImagePlus, ChevronLeft, ChevronRight } from "lucide-react";
import { FormInput } from "../components/FormInput";
import { Button } from "../components/Button";
import { Pagination } from "../components/Pagination";
import { useReview } from "../hooks/useReview";
import { usePaginationParams } from "../hooks/Pagination/usePaginationParams";
import { validateEmptyObject } from "../utils/helper";
const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a star rating").max(5),
  name: z.string().optional(),
  title: z.string().optional(),
  comment: z.string().min(1, "Review comment is required"),
});
type ReviewForm = z.infer<typeof reviewSchema>;
const MAX_PHOTOS = 4, MAX_MB = 5;
const FILLED = "text-[var(--color-accent)] fill-[var(--color-accent)]";
const EMPTY = "text-[var(--color-muted-foreground)]";
const MUTED = "text-[var(--color-muted-foreground)]";
const LABEL = `text-xs font-bold ${MUTED} uppercase tracking-wider block mb-1`;
const ERR = "text-[10px] font-bold text-red-500 mt-1";
const INPUT = "!bg-[var(--color-card)] !border-[var(--color-border)] text-[var(--color-foreground)]";
const FIELDS = [{ name: "name", label: "Your Name", icon: User }, { name: "title", label: "Review Title (Optional)", icon: Tag }] as const;
const Stars = ({ value }: { value: number }) => (
  <div className="flex gap-1">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`w-3.5 h-3.5 ${s <= value ? FILLED : EMPTY}`} />)}</div>
);
export const CustomerReviews: React.FC<{ productId: string }> = ({ productId }) => {
  const authUser = useSelector((state: any) => state.auth?.user);
  const isAdmin = authUser?.role === "admin";
  const fullName = [authUser?.firstname, authUser?.lastname].filter(Boolean).join(" ");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [viewer, setViewer] = useState<{ photos: string[]; index: number } | null>(null);
  const touchX = useRef(0);
  const { params, setPage } = usePaginationParams({ pageSize: 5, currentPage: 1 });
  const { reviews = [], reviewsCount, isLoadingReviews, isReviewMutationLoading, createReview, deleteReviewByUser, deleteReviewByAdmin } = useReview(productId);
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema), defaultValues: { rating: 0, name: fullName, title: "", comment: "" },
  });
  const count = reviewsCount || 0;
  const currentPage = params.currentPage || 1;
  const pageSize = params.pageSize || 5;
  const totalPages = Math.ceil(reviews.length / pageSize);
  const paginatedReviews = reviews.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const avg = count ? reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / count : 0;
  const previews = useMemo(() => photos.map((f) => URL.createObjectURL(f)), [photos]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);
  const viewerOpen = viewer !== null;
  const move = useCallback((d: number) => setViewer((v) => v && { ...v, index: (v.index + d + v.photos.length) % v.photos.length }), []);
  useEffect(() => {
    if (!viewerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => (e.key === "Escape" ? setViewer(null) : e.key === "ArrowRight" ? move(1) : e.key === "ArrowLeft" && move(-1));
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [viewerOpen, move]);
  const addPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    e.target.value = ""; 
    if (photos.length + files.length > MAX_PHOTOS) return void toast.error(`Maximum ${MAX_PHOTOS} photos allowed per review.`);
    if (files.some((f) => f.size > MAX_MB * 1024 * 1024)) return void toast.error(`Each photo must be under ${MAX_MB} MB.`);
    setPhotos((p) => [...p, ...files]);
  };
  const onSubmit = async (data: ReviewForm) => {
    const payload = { ...data, name: data.name?.trim() || fullName || "Guest User", ...(photos.length > 0 && { photos }) };
    const res = await createReview(productId, validateEmptyObject(payload));
    if (res?.success) { reset(); setPhotos([]); setIsFormOpen(false); setHoverRating(0); setPage(1); }
  };
  const handleDelete = (reviewId: string) => (isAdmin ? deleteReviewByAdmin(reviewId) : deleteReviewByUser(reviewId));
  return (
    <div className="w-full py-6 font-sans antialiased text-[var(--color-foreground)] space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-1">Customer Reviews</h2>
          <div className={`flex flex-wrap items-center gap-2 text-xs ${MUTED}`}>
            <Stars value={Math.round(avg)} />
            <span className="font-bold text-[var(--color-foreground)]">{avg.toFixed(1)} out of 5</span>
            <span>({count} reviews)</span>
          </div>
        </div>
        <Button
          onClick={() => setIsFormOpen((prev) => !prev)}
          className="w-full sm:w-auto !py-2.5 !px-5 text-xs font-bold uppercase tracking-wider rounded-xl border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primary-foreground)] transition-all"
        >
          {isFormOpen ? "Cancel" : "Write a review"}
        </Button>
      </div>
      <div className="space-y-2 max-w-lg">
        {[5, 4, 3, 2, 1].map((s) => [s, reviews.filter((r: any) => r.rating === s).length]).map(([s, n]) => (
          <div key={s} className={`flex items-center gap-2 sm:gap-3 text-xs font-medium ${MUTED}`}>
            <span className="w-10 shrink-0">{s} star</span>
            <div className="flex-1 h-2 bg-[var(--color-background)] rounded-full overflow-hidden border border-[var(--color-border)]"><div className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-300" style={{ width: `${count ? (n / count) * 100 : 0}%` }} /></div>
            <span className="w-4 text-right font-bold text-[var(--color-foreground)]">{n}</span>
          </div>
        ))}
      </div>
      {isFormOpen && (
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 rounded-3xl bg-[var(--color-card)] border border-[var(--color-border)] shadow-xl space-y-4">
          <h3 className="text-base sm:text-lg font-extrabold tracking-tight">Share your experience</h3>
          <div>
            <label className={LABEL}>Your Rating</label>
            <Controller name="rating" control={control} render={({ field }) => (
              <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" aria-label={`${s} star`} onClick={() => field.onChange(s)} onMouseEnter={() => setHoverRating(s)} className="cursor-pointer transition-colors p-0.5">
                    <Star className={`w-6 h-6 ${s <= (hoverRating || field.value) ? FILLED : EMPTY}`} />
                  </button>
                ))}
              </div>
            )} />
            {errors.rating && <p className={ERR}>{errors.rating.message}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FIELDS.map(({ name, label, icon: Icon }) => (
              <FormInput key={name} label={label} placeholder={name === "name" ? "Enter Your Name" : "e.g. Excellent Product!"} {...register(name)} error={errors[name]?.message} leftIcon={<Icon className={`w-4 h-4 ${MUTED}`} />} className={INPUT} />
            ))}
          </div>
          <div>
            <label className={LABEL}>Comment</label>
            <div className="relative">
              <textarea rows={3} placeholder="Tell us what you loved..." {...register("comment")} className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)] resize-y" />
              <MessageSquare className={`w-4 h-4 ${MUTED} absolute left-3 top-3`} />
            </div>
            {errors.comment && <p className={ERR}>{errors.comment.message}</p>}
          </div>
          <div>
            <label className={LABEL}>Photos (Optional, max {MAX_PHOTOS})</label>
            <div className="flex flex-wrap items-center gap-3">
              {previews.map((src, i) => (
                <div key={src} className="relative h-16 w-16 rounded-xl overflow-hidden border border-[var(--color-border)]">
                  <img src={src} alt={`Selected photo ${i + 1}`} className="h-full w-full object-cover" />
                  <button type="button" aria-label="Remove photo" onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white cursor-pointer"><X className="h-3 w-3" /></button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-primary)] transition-colors">
                  <ImagePlus className={`h-5 w-5 ${MUTED}`} />
                  <span className={`mt-0.5 text-[9px] font-medium ${MUTED}`}>Add</span>
                  <input type="file" accept="image/*" multiple onChange={addPhotos} className="hidden" />
                </label>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isReviewMutationLoading} className="w-full sm:w-auto !py-3 !px-6 text-xs font-bold rounded-xl bg-[var(--color-primary)] hover:brightness-110 text-[var(--color-primary-foreground)] disabled:opacity-50 cursor-pointer">
              {isReviewMutationLoading ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      )}
      {isLoadingReviews ? (
        <div className={`py-8 text-center text-xs ${MUTED}`}>Loading reviews...</div>
      ) : paginatedReviews.length === 0 ? (
        <div className={`py-8 text-center text-xs ${MUTED} border-t border-[var(--color-border)]`}>No reviews yet. Be the first to write one!</div>
      ) : (
        <div className="divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
          {paginatedReviews.map((rev: any) => {
            const id = rev._id || rev.id;
            const isOwner = Boolean(rev.isMine); // the server tells us which reviews are ours (it never sends user / guest ids)
            const initials = (rev.name || "Guest User").split(" ").filter(Boolean).map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
            const date = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : rev.date;
            return (
              <div key={id} className="py-4 sm:py-5 flex gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-xs font-bold shrink-0">{initials}</div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex justify-between items-baseline gap-2">
                    <h4 className="text-xs font-bold truncate">{rev.name || "Guest User"}</h4>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-medium ${MUTED}`}>{date}</span>
                      {(isOwner || isAdmin) && <button onClick={() => handleDelete(id)} className="text-red-500 hover:text-red-700 transition-colors p-1 cursor-pointer" title="Delete Review" aria-label="Delete review"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                  </div>
                  <Stars value={rev.rating} />
                  {rev.title && <h5 className="text-xs font-bold">{rev.title}</h5>}
                  <p className={`text-xs ${MUTED} leading-relaxed whitespace-pre-line`}>{rev.comment}</p>
                  {rev.photos?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {rev.photos.map((src: string, i: number) => (
                        <button key={src} onClick={() => setViewer({ photos: rev.photos, index: i })} aria-label={`Open review photo ${i + 1}`} className="cursor-zoom-in">
                          <img src={src} alt="" className="h-14 w-14 rounded-lg border border-[var(--color-border)] object-cover hover:opacity-90 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {totalPages > 1 && <div className="mt-6 flex justify-center"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} /></div>}
      {viewer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" onClick={() => setViewer(null)}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 50) move(dx < 0 ? 1 : -1); }}
        >
          <button aria-label="Close" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white cursor-pointer"><X className="h-5 w-5" /></button>
          {viewer.photos.length > 1 && [-1, 1].map((d) => (
            <button key={d} aria-label={d < 0 ? "Previous photo" : "Next photo"} onClick={(e) => { e.stopPropagation(); move(d); }} className={`absolute ${d < 0 ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white cursor-pointer`}>
              {d < 0 ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          ))}
          <img src={viewer.photos[viewer.index]} alt="Review photo" onClick={(e) => e.stopPropagation()} className="max-h-full max-w-full rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
};