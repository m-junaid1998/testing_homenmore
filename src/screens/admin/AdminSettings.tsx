"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector } from "react-redux";
import { Lock, ShieldCheck, Mail, UserCheck, Truck } from "lucide-react";
import { FormInput } from "../../components/FormInput";
import { Button } from "../../components/Button";
import { useAuth } from "../../hooks/useAuth";
import { useShippingSettings } from "../../hooks/useShipping";

const schema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters.").max(72, "Password is too long."),
  confirmPassword: z.string().min(1, "Please confirm your password."),
}).refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] });

type FormSchema = z.infer<typeof schema>;

const shippingSchema = z.object({
  deliveryCharge: z.number({ error: "Enter the delivery charge." }).int("Use a whole number.").min(0, "Cannot be negative."),
  freeShippingAbove: z.number({ error: "Enter the free-delivery amount." }).int("Use a whole number.").min(0, "Cannot be negative."),
});
type ShippingForm = z.infer<typeof shippingSchema>;

// Delivery charge and free-delivery amount. The server uses these numbers to price every order.
const DeliverySettings = () => {
  const { rules, saveShipping, isSaving } = useShippingSettings();
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema),
    values: { deliveryCharge: rules.deliveryCharge, freeShippingAbove: rules.freeShippingAbove },
  });

  return (
    <form onSubmit={handleSubmit(saveShipping)} className="p-6 rounded-2xl bg-[var(--color-card-bg)] border border-[var(--color-border)] shadow-sm space-y-4">
      <h2 className="text-base font-bold text-[var(--color-text-dark)] flex items-center gap-2"><Truck className="w-5 h-5 text-[var(--gold)]" /> Delivery</h2>
      <p className="text-xs text-[var(--color-muted)]">Customers pay the delivery charge unless their items total reaches the free-delivery amount. Set the free-delivery amount to 0 to make delivery always free.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[var(--color-border)]">
        <FormInput label="Delivery charge (PKR)" type="number" inputMode="numeric" min={0} {...register("deliveryCharge", { valueAsNumber: true })} error={errors.deliveryCharge?.message} className="!bg-[var(--color-card-bg)] !border-[var(--color-border)] text-[var(--color-text-dark)]" labelClassName="!text-[var(--color-text-dark)]" />
        <FormInput label="Free delivery on orders from (PKR)" type="number" inputMode="numeric" min={0} {...register("freeShippingAbove", { valueAsNumber: true })} error={errors.freeShippingAbove?.message} className="!bg-[var(--color-card-bg)] !border-[var(--color-border)] text-[var(--color-text-dark)]" labelClassName="!text-[var(--color-text-dark)]" />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSaving || !isDirty} className="!px-6 !py-2.5 text-xs font-bold rounded-xl bg-[var(--gold)] text-[var(--color-primary-foreground)]">{isSaving ? "Saving..." : "Save delivery settings"}</Button>
      </div>
    </form>
  );
};

const AdminSettings = () => {
  const user = useSelector((state: any) => state.auth.user);
  const { updatePassword, isAuthLoading } = useAuth();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormSchema>({ resolver: zodResolver(schema) });

  const onSubmit = async (d: FormSchema) => {
    const res = await updatePassword({ oldPassword: d.currentPassword, newPassword: d.newPassword });
    if (res?.success) reset();
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-[var(--color-card-bg)] border border-[var(--color-border)] shadow-sm">
        <h1 className="text-xl font-bold tracking-wider text-[var(--color-text-dark)] uppercase">Settings</h1>
        <p className="text-xs text-[var(--color-muted)] mt-0.5">Manage your admin profile and store preferences.</p>
      </div>

      <div className="p-6 rounded-2xl bg-[var(--color-card-bg)] border border-[var(--color-border)] shadow-sm space-y-4">
        <h2 className="text-base font-bold text-[var(--color-text-dark)] flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[var(--gold)]" /> Admin Account</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--color-border)]">
          {[{ Icon: Mail, label: "Email:", val: user?.email || "N/A" }, { Icon: UserCheck, label: "Role:", val: user?.role || "Admin", isgold: true }].map(({ Icon, label, val, isgold }) => (
            <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-[var(--color-card)]/5 border border-[var(--color-border)] text-xs">
              <Icon className="w-4 h-4 text-[var(--gold)] shrink-0" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[var(--color-muted)] uppercase">{label}</span>
                <span className={`font-semibold ${isgold ? "text-[var(--gold)] uppercase" : "text-[var(--color-text-dark)]"}`}>{val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DeliverySettings />

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 rounded-2xl bg-[var(--color-card-bg)] border border-[var(--color-border)] shadow-sm space-y-4">
        <h2 className="text-base font-bold text-[var(--color-text-dark)] flex items-center gap-2"><Lock className="w-5 h-5 text-[var(--gold)]" /> Change Password</h2>
        <div className="space-y-4 pt-2 border-t border-[var(--color-border)]">
          <FormInput label="Current Password" type="password" {...register("currentPassword")} error={errors.currentPassword?.message} placeholder="••••••••" className="!bg-[var(--color-card-bg)] !border-[var(--color-border)] text-[var(--color-text-dark)]" labelClassName="!text-[var(--color-text-dark)]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="New Password" type="password" {...register("newPassword")} error={errors.newPassword?.message} placeholder="••••••••" className="!bg-[var(--color-card-bg)] !border-[var(--color-border)] text-[var(--color-text-dark)]" labelClassName="!text-[var(--color-text-dark)]" />
            <FormInput label="Confirm New Password" type="password" {...register("confirmPassword")} error={errors.confirmPassword?.message} placeholder="••••••••" className="!bg-[var(--color-card-bg)] !border-[var(--color-border)] text-[var(--color-text-dark)]" labelClassName="!text-[var(--color-text-dark)]" />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isAuthLoading} className="!px-6 !py-2.5 text-xs font-bold rounded-xl bg-[var(--gold)] text-[var(--color-primary-foreground)]">{isAuthLoading ? "Updating..." : "Update Password"}</Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;