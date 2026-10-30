"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Send, Truck, ArrowUpRight } from "lucide-react";
import { useContact } from "@/hooks/useContact";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";
import { PageHero, STORE, whatsappLink } from "@/components/InfoPage";
import { formatRs } from "@/utils/shipping";
import { useShippingRules } from "@/hooks/useShipping";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  message: z.string().trim().min(5, "Message must be at least 5 characters"),
});

type Form = z.infer<typeof schema>;

const CHANNELS = [
  {
    title: "WhatsApp",
    description: "The quickest way to reach our team",
    href: whatsappLink(),
    label: STORE.phone,
    isWhatsApp: true,
  },
  {
    title: "Email Us",
    description: "Send us an email anytime",
    href: "mailto:bambotiaa@gmail.com",
    label: "bambotiaa@gmail.com",
    isWhatsApp: false,
  },
];

export default function Contact() {
  const rules = useShippingRules();
  const { submitContactQuery, isContactMutationLoading } = useContact();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    const res = await submitContactQuery(data);
    if (res?.success) reset();
  };

  return (
    <main className="min-h-screen font-sans text-[var(--color-foreground)] bg-[var(--color-background)]">
      <PageHero
        icon={<Mail size={14} />}
        eyebrow="Get in touch"
        title="We would love to hear from you"
        subtitle="Questions about a piece, an order or delivery? Send us a message and our team will help you."
      />

      <section className="relative overflow-hidden ">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background: "radial-gradient(ellipse at 0% 30%, color-mix(in oklab, var(--color-accent) 10%, transparent), transparent 55%)",
          }}
        />

        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-5">
          {/* Contact Channels & Info */}
          <div className="space-y-4 lg:col-span-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]">Contact details</p>
              <h2 className="mt-1   text-2xl font-bold">Let us help you</h2>
              <p className="mt-1 text-xs sm:text-sm text-[var(--color-muted-foreground)]">Choose whichever way is easiest for you to get in touch.</p>
            </div>

            {CHANNELS.map((ch) => (
              <a
                key={ch.title}
                href={ch.href}
                target={ch.isWhatsApp ? "_blank" : undefined}
                rel={ch.isWhatsApp ? "noopener noreferrer" : undefined}
                className="group flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 transition-all hover:border-[var(--color-accent)]/50 hover:shadow-md"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                  {ch.isWhatsApp ? (
                    <Image src="/whatsapp.svg" alt="WhatsApp" width={22} height={22} className="shrink-0" />
                  ) : (
                    <Mail size={20} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm sm:text-base">{ch.title}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">{ch.label}</p>
                </div>
                <ArrowUpRight size={17} className="shrink-0 text-[var(--color-muted-foreground)] group-hover:text-[var(--color-accent)]" />
              </a>
            ))}

            {/* Delivery Info Box */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                  <Truck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Delivery across Pakistan</h3>
                  <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
                    PKR {rules.deliveryCharge} delivery, free on orders of PKR {formatRs(rules.freeShippingAbove)} or more.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-xl sm:p-8 lg:col-span-3"
          >
            <div className="border-b border-[var(--color-border)] pb-3">
              <h2 className="  text-xl sm:text-2xl font-bold">Send us a message</h2>
              <p className="mt-1 text-xs sm:text-sm text-[var(--color-muted-foreground)]">Fill in the details below and we will get back to you.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput label="Your name" {...register("name")} error={errors.name?.message} placeholder="Enter Your Name" required />
              <FormInput label="Email address" type="email" {...register("email")} error={errors.email?.message} placeholder="Enter Your Email" required />
            </div>

            <FormInput label="How can we help?" isTextArea placeholder="Enter Your Queries / Bulk Orders" rows={5} {...register("message")} error={errors.message?.message} required />

            <Button type="submit" disabled={isContactMutationLoading} className="w-full !py-3 font-bold uppercase tracking-wider">
              <span className="inline-flex items-center justify-center gap-2">
                <Send size={15} />
                {isContactMutationLoading ? "Sending message..." : "Send message"}
              </span>
            </Button>

            <p className="text-center text-[11px] text-[var(--color-muted-foreground)]">Your details will only be used to respond to your enquiry.</p>
          </form>
        </div>
      </section>
    </main>
  );
}