"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { GoogleButton } from "@/components/GoogleButton";

const schema = z
  .object({
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").max(72, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof schema>;

export default function Signup({ googleClientId }: { googleClientId?: string }) {
  const router = useRouter();
  const { registerUser, isAuthLoading } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (formData: SignupForm) => {
    const registerPayload = { firstname: formData.firstname, lastname: formData.lastname, email: formData.email, password: formData.password };
    await registerUser(registerPayload, {
      onSuccess: () => {
        reset();
        router.push("/");
      },
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-background)] font-sans">
      <section className="w-full max-w-md p-6 rounded-3xl bg-[var(--color-card)] border-2 border-[var(--color-accent)] shadow-2xl space-y-4">
        <header className="flex flex-col items-center text-center space-y-1">
          <div className="relative w-48 h-20">
            <Image
              src="/logo.avif"
              alt="Bambotia Logo"
              fill
              priority
              sizes="(max-width: 640px) 112px, 176px"
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold font-display text-[var(--color-foreground)] tracking-wide">
            Create Account
          </h1>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Join Bambotia to start shopping exclusive items
          </p>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3"
          noValidate
        >
          <div className="grid grid-cols-2 gap-2">
            <FormInput
              label="First Name"
              type="text"
              required
              placeholder="Moosa"
              {...register("firstname")}
              error={errors.firstname?.message}
              leftIcon={
                <User className="w-4 h-4 text-[var(--color-muted-foreground)]" />
              }
            />
            <FormInput
              label="Last Name"
              type="text"
              required
              placeholder="Imran"
              {...register("lastname")}
              error={errors.lastname?.message}
              leftIcon={
                <User className="w-4 h-4 text-[var(--color-muted-foreground)]" />
              }
            />
          </div>
          <FormInput
            label="Email Address"
            type="email"
            required
            placeholder="name@gmail.com"
            {...register("email")}
            error={errors.email?.message}
            leftIcon={
              <Mail className="w-4 h-4 text-[var(--color-muted-foreground)]" />
            }
          />
          <FormInput
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            {...register("password")}
            error={errors.password?.message}
            leftIcon={
              <Lock className="w-4 h-4 text-[var(--color-muted-foreground)]" />
            }
          />
          <FormInput
            label="Confirm Password"
            type="password"
            required
            placeholder="••••••••"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
            leftIcon={
              <Lock className="w-4 h-4 text-[var(--color-muted-foreground)]" />
            }
          />

          <Button
            type="submit"
            disabled={isAuthLoading}
            className="w-full !py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-[var(--color-gold)] hover:brightness-110 text-[#08100d] disabled:opacity-50 cursor-pointer transition-all shadow-md mt-1"
          >
            <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
              {isAuthLoading ? "Creating Account..." : "Sign Up"}
              {!isAuthLoading && <ArrowRight className="w-4 h-4 shrink-0" />}
            </span>
          </Button>
        </form>

        <GoogleButton clientId={googleClientId} />

        <footer className="text-center text-xs text-[var(--color-muted-foreground)] pt-2 border-t border-[var(--color-border)]/50">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-[var(--color-accent)] hover:underline transition-all"
          >
            Sign in
          </Link>
        </footer>
      </section>
    </main>
  );
}