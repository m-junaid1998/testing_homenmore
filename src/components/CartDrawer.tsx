"use client";

import React, { Fragment } from "react";
import { useNavigate } from "../lib/router-compat";
import { X, Trash2, Plus, Minus, Sparkles, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { toast } from "../utils/toast";
import { useShippingRules } from "../hooks/useShipping";

interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}


export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen = false, onClose = () => { } }) => {
  const navigate = useNavigate();
  const { cartItems, totalItemsCount, cartTotalAmount, addToCart, removeFromCart, isCartMutationLoading, isLoadingCart } = useCart(isOpen);
  const { freeShippingAbove: THRESHOLD, deliveryCharge: SHIPPING } = useShippingRules();
  const isFree = cartTotalAmount >= THRESHOLD;
  const remaining = THRESHOLD - cartTotalAmount;

  const handleQtyUpdate = async (item: any, delta: number) => {
    const pId = item.product?._id || item.product;
    const productName = item.product?.name || "Product";
    const stock = item.product?.stock ?? item.stock ?? Infinity;
    const newQty = item.qty + delta;
    if (delta > 0 && newQty > stock) {
      const itemLabel = stock === 1 ? "item" : "items";
      return toast.error(`Only ${stock} ${itemLabel} available in stock.`);
    }
    const variant = { size: item.size || undefined, color: item.color || undefined };
    if (newQty < 1) {
      return await removeFromCart(pId, productName, variant);
    }
    await addToCart(pId, newQty, true, variant);
  };

  if (!isOpen) return null;

  return (
    <Fragment>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all duration-300" onClick={onClose} />
      <aside className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[var(--color-bg-light)] text-[var(--color-text-dark)] z-50 flex flex-col justify-between shadow-2xl p-5 border-l border-[var(--color-border)]">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between pb-3.5 border-b border-[var(--color-border)] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-center shadow-xs">
                <ShoppingBag size={16} />
              </div>
              <div>
                <h2 className="text-base  font-bold text-[var(--color-primary)] leading-none">Your Cart</h2>
                <p className="text-[10px] font-bold text-[var(--color-muted)] mt-0.5">{totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-card-bg)] text-[var(--color-primary)] flex items-center justify-center cursor-pointer transition-colors">
              <X size={15} />
            </button>
          </div>
          {isLoadingCart ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[var(--color-muted)]">
              <Loader2 className="animate-spin text-[var(--gold)]" size={28} />
              <span className="text-xs font-semibold">Loading Cart...</span>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 space-y-4">
              <div className="w-20 h-20 rounded-full bg-[var(--color-card-bg)] border border-[var(--color-border)] flex items-center justify-center shadow-xs">
                <ShoppingBag size={32} className="text-[var(--gold)] stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg  font-bold text-[var(--color-text-dark)]">Your bag is empty</h3>
                <p className="text-xs text-[var(--color-muted)]">Add items to get started</p>
              </div>
              <button onClick={onClose} className="mt-2 w-full max-w-xs py-3 px-6 rounded-xl border border-[var(--color-border)] hover:border-[var(--gold)] hover:bg-[var(--color-card-bg)] text-[var(--gold)] font-bold text-xs uppercase tracking-widest transition-all cursor-pointer">
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="mt-4 p-3 bg-[var(--color-card-bg)] rounded-xl border border-[var(--color-border)] shadow-2xs shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-dark)] mb-2">
                  <Sparkles size={14} className="text-[var(--gold)] shrink-0 animate-pulse" />
                  {isFree ? <span className="text-[var(--color-success)] font-bold">You unlocked FREE Shipping! 🎉</span> : <span>You're <strong className="text-[var(--gold)] font-bold">PKR {remaining.toLocaleString()}</strong> away from free shipping</span>}
                </div>
                <div className="w-full bg-[var(--color-border)] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[var(--gold)] h-full transition-all duration-500 rounded-full" style={{ width: `${Math.min(100, (cartTotalAmount / THRESHOLD) * 100)}%` }} />
                </div>
              </div>
              <div className="mt-4 space-y-3 overflow-y-auto no-scrollbar pr-0.5 flex-1">
                {cartItems.map((item: any) => {
                  const p = item.product || {};
                  const pId = p._id || p;
                  return (
                    <div key={item._id || `${pId}-${item.size}-${item.color}`} className="flex items-center gap-3.5 bg-[var(--color-card-bg)] p-3.5 rounded-2xl border border-[var(--color-border)] hover:border-[var(--gold)] transition-all">
                      {/* Badi Image Size */}
                      <img src={p.images?.[0] || p.image || ""} alt={p.name} className="w-20 h-20 object-cover rounded-xl shrink-0 bg-[var(--color-card)] border border-[var(--color-border)]" />

                      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                        <div className="flex justify-between items-start gap-2">
                          {/* Badhe Fonts */}
                          <h3 className="text-sm  font-bold text-[var(--color-text-dark)] leading-snug line-clamp-1">{p.name}</h3>
                          <button disabled={isCartMutationLoading} onClick={() => removeFromCart(pId, item.product?.name, { size: item.size || undefined, color: item.color || undefined })} className="cursor-pointer rounded-lg bg-red-500 p-2 text-white transition-all duration-200 hover:scale-110 hover:bg-red-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <p className="text-sm font-extrabold text-[var(--color-success)] mt-0.5">PKR {(item.price ?? p.salePrice ?? p.regularPrice ?? 0).toLocaleString()}</p>
                        {(item.size || item.color) && (
                          <p className="text-[11px] text-[var(--color-muted)] mt-0.5">
                            {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {(item.sizeUnavailable || item.colorUnavailable) && (
                          <p className="text-[11px] text-[var(--color-danger)] mt-0.5">This option is no longer available. Please remove it.</p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <div className="inline-flex items-center border border-[var(--color-border)] rounded-full bg-[var(--color-bg-light)] px-2.5 py-1 shadow-2xs">
                            <button disabled={isCartMutationLoading} onClick={() => handleQtyUpdate(item, -1)} className="text-[var(--color-muted)] hover:text-[var(--color-primary)] p-0.5 cursor-pointer disabled:opacity-40">
                              <Minus size={13} />
                            </button>
                            <span className="text-xs font-bold px-3 text-[var(--color-primary)]">{item.qty}</span>
                            <button disabled={isCartMutationLoading} onClick={() => handleQtyUpdate(item, 1)} className="text-[var(--color-muted)] hover:text-[var(--color-primary)] p-0.5 cursor-pointer disabled:opacity-40">
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="pt-3 border-t border-[var(--color-border)] space-y-2 shrink-0">
            <div className="space-y-1 text-xs text-[var(--color-muted)] bg-[var(--color-card-bg)] p-2.5 rounded-xl border border-[var(--color-border)]">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-bold text-[var(--color-text-dark)]">PKR {cartTotalAmount.toLocaleString()}</span></div>
              <div className="flex justify-between items-center">
                <span>Delivery</span>
                <span className={isFree ? "bg-[var(--color-success)]/10 text-[var(--color-success)] font-bold text-[10px] px-2 py-0.5 rounded-full" : "font-bold text-[var(--color-text-dark)]"}>{isFree ? "FREE" : `PKR ${SHIPPING}`}</span>
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">EST. TOTAL</span>
              <span className="text-lg font-black text-[var(--gold)]">PKR {(cartTotalAmount + (isFree ? 0 : SHIPPING)).toLocaleString()}</span>
            </div>
            <button onClick={() => { onClose(); navigate("/checkout"); }} className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-foreground)] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 group">
              <span>Proceed to Checkout</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={onClose} className="w-full text-center text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-primary)] cursor-pointer block">Continue Shopping</button>
          </div>
        )}
      </aside>
    </Fragment>
  );
};