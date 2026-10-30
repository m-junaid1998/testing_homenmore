"use client";
import React, { useActionState } from "react";
import { X } from "lucide-react";
import { FormSelect, type SelectOption } from "../../components/FormSelect";
import { Button } from "../../components/Button";

export type ItemStatus = 
  | "Pending" 
  | "In Progress" 
  | "Resolved" 
  | "Confirmed" 
  | "Processing" 
  | "Shipped" 
  | "Delivered" 
  | "Cancelled";

export interface OrderItemLog {
  id: string;
  title: string;
  qty: number;
  unitPrice: number;
  image?: string;
}

export type ModalData =
  | {
      id: string; 
      type: "QUERY";
      title: string;
      subtitle: string;
      senderName: string;
      senderEmail: string;
      clientMessage: string;
      status: ItemStatus;
      statusOptions: SelectOption[];
      notes?: string;
      onSaveAction?: (formData: FormData) => Promise<void>;
    }
  | {
      id: string; 
      type: "ORDER";
      title: string;
      subtitle: string;
      status: ItemStatus;
      statusOptions: SelectOption[];
      customerName: string;
      phone: string;
      address: string;
      items: OrderItemLog[];
      subtotal: number;
      shippingFee: number | "FREE";
      grandTotal: number;
      onStatusChange?: (id: string, status: string) => void;
    };

const STYLES: Record<string, string> = {
  Pending: "bg-amber-950/60 text-amber-300 border-amber-700/50",
  "In Progress": "bg-blue-950/60 text-blue-300 border-blue-700/50",
  Confirmed: "bg-blue-950/60 text-blue-300 border-blue-700/50",
  Processing: "bg-purple-950/60 text-purple-300 border-purple-700/50",
  Shipped: "bg-indigo-950/60 text-indigo-300 border-indigo-700/50",
  Resolved: "bg-emerald-950/60 text-emerald-300 border-emerald-700/50",
  Delivered: "bg-emerald-950/60 text-emerald-300 border-emerald-700/50",
  Cancelled: "bg-rose-950/60 text-rose-300 border-rose-700/50",
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ModalData | null;
}

export const AdminDetailModal: React.FC<ModalProps> = ({ isOpen, onClose, data }) => {
  const [, formAction, isPending] = useActionState(async (_state: unknown, formData: FormData) => {
    if (data?.type === "QUERY" && data.onSaveAction) {
      await data.onSaveAction(formData);
      onClose();
    }
  }, null);

  if (!isOpen || !data) return null;

  if (data.type === "ORDER") {
    const statusStyle = STYLES[data.status] || "bg-zinc-800 text-zinc-300 border-zinc-700";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
        <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl bg-[var(--color-bg-light)] border border-[var(--color-border)] p-6 shadow-xl z-10 space-y-5 text-[var(--color-text-dark)]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-serif font-bold text-[var(--color-text-dark)]">{data.title}</h2>
              <p className="text-xs font-semibold text-[var(--color-muted)] mt-0.5">{data.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-text-dark)] hover:bg-[var(--color-card-bg)] cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-[var(--color-border)]">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold tracking-wider text-[var(--color-muted)] uppercase">Current Status</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${statusStyle}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {String(data.status).toUpperCase()}
              </span>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-extrabold tracking-wider text-[var(--color-muted)] uppercase">Update Pipeline</p>
              <FormSelect
                options={data.statusOptions}
                value={data.status}
                onChange={(e) => data.onStatusChange?.(data.id, e.target.value)}
                containerClassName="!w-40"
                className="!py-1.5 !text-xs !font-semibold border-[var(--gold)] !rounded-lg"
              />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-border)] space-y-1">
            <p className="text-[10px] font-extrabold text-[var(--color-muted)] uppercase tracking-wider">Delivery Details</p>
            <h3 className="text-sm font-bold text-[var(--color-text-dark)]">{data.customerName}</h3>
            <p className="text-xs font-semibold text-[var(--color-text-dark)] opacity-90">Phone: {data.phone}</p>
            <p className="text-xs font-semibold text-[var(--color-text-dark)] opacity-90">{data.address}</p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-extrabold text-[var(--color-muted)] uppercase tracking-wider">Items Log</p>
            <div className="divide-y divide-[var(--color-border)] border-t border-b border-[var(--color-border)]">
              {data.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover border border-[var(--color-border)] flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[var(--color-text-dark)] truncate">{item.title}</h4>
                    <p className="text-[11px] font-semibold text-[var(--color-muted)] mt-0.5">
                      Qty {item.qty} × PKR {item.unitPrice.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[var(--color-text-dark)] flex-shrink-0">
                    PKR {(item.qty * item.unitPrice).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-border)] space-y-2 text-xs">
            <div className="flex justify-between font-semibold text-[var(--color-text-dark)]">
              <span>Subtotal</span>
              <span className="font-bold text-[var(--color-text-dark)]">PKR {data.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center font-semibold text-[var(--color-text-dark)]">
              <span>Shipping Fee</span>
              {data.shippingFee === "FREE" ? (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950/60 text-emerald-300 rounded border border-emerald-700/50">
                  FREE
                </span>
              ) : (
                <span className="font-bold text-[var(--color-text-dark)]">PKR {data.shippingFee.toLocaleString()}</span>
              )}
            </div>
            <div className="flex justify-between items-center text-sm border-t border-[var(--color-border)] pt-2.5">
              <span className="font-bold text-[var(--color-text-dark)]">Grand Total</span>
              <span className="font-sans font-bold text-[var(--gold)] text-base">
                PKR {data.grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl bg-[var(--color-bg-light)] border border-[var(--color-border)] p-6 shadow-xl z-10 space-y-4 text-[var(--color-text-dark)]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-[var(--color-text-dark)]">{data.title}</h2>
            <p className="text-xs font-semibold text-[var(--color-muted)]">{data.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-text-dark)] hover:bg-[var(--color-card-bg)] cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form action={formAction} className="space-y-4">
          <div className="p-4 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-border)] space-y-1">
            <p className="text-[10px] font-extrabold text-[var(--color-muted)] uppercase">Sender Profile</p>
            <h3 className="text-sm font-bold text-[var(--color-text-dark)]">{data.senderName}</h3>
            <p className="text-xs text-[var(--gold)] font-bold">{data.senderEmail}</p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-border)] space-y-1">
            <p className="text-[10px] font-extrabold text-[var(--color-muted)] uppercase">Client Message</p>
            <p className="text-xs italic font-medium text-[var(--color-text-dark)] opacity-90">"{data.clientMessage}"</p>
          </div>

          <div className="border-t border-[var(--color-border)] pt-2 flex items-center justify-between">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border tracking-wide uppercase shadow-xs ${STYLES[data.status] || "bg-zinc-800 text-zinc-300 border-zinc-700"}`}>
              {data.status}
            </span>
            <FormSelect
              name="status"
              options={data.statusOptions}
              defaultValue={data.status}
              containerClassName="!w-40"
              className="!py-2 text-xs font-semibold border-[var(--gold)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--color-text-dark)]">Internal Admin Notes</label>
            <textarea
              name="adminNotes"
              rows={3}
              defaultValue={data.notes}
              className="w-full p-3 text-xs font-medium bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-xl outline-none resize-none focus:border-[var(--gold)] text-[var(--color-text-dark)]"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-foreground)] py-3 text-xs font-bold rounded-xl"
          >
            {isPending ? "Saving..." : "Save Query Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
};