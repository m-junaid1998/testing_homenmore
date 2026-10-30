"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { GoogleButton } from "@/components/GoogleButton";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof schema>;

export default function Login({ googleClientId }: { googleClientId?: string }) {
  const router = useRouter();
  const { loginUser, isAuthLoading } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (
    formData: LoginForm,
    e?: React.BaseSyntheticEvent,
  ) => {
    e?.preventDefault();
    await loginUser(formData, {
      onSuccess: (res) => {
        reset();
        router.push(res?.role === "admin" ? "/admin" : "/");
      },
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-background)] font-sans">
      <section className="w-full max-w-md p-8 rounded-3xl bg-[var(--color-card)] border-2 border-[var(--color-accent)] shadow-2xl space-y-6">
        {/* Header Section */}
        <header className="flex flex-col items-center text-center space-y-2">
          {/* Logo Container (Fixed Size & Relative Positioning) */}
          <div className="relative w-48 h-20 mb-1">
            <Image
              src="/logo.avif"
              alt="Bambotia Logo"
              fill
              priority
              sizes="(max-width: 640px) 112px, 176px"
              className="object-contain"
            />
          </div>

          <h1 className="text-3xl font-bold font-display text-[var(--color-foreground)] tracking-wide">
            Sign In
          </h1>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Enter your credentials to access your Bambotia account
          </p>
        </header>

        {/* Form Section */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
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

          <Button
            type="submit"
            disabled={isAuthLoading}
            className="w-full !py-3 text-xs font-bold uppercase tracking-wider rounded-xl bg-[var(--color-gold)] hover:brightness-110 text-[#08100d] disabled:opacity-50 cursor-pointer transition-all shadow-md mt-2"
          >
            <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
              {isAuthLoading ? "Signing In..." : "Sign In"}
              {!isAuthLoading && <ArrowRight className="w-4 h-4 shrink-0" />}
            </span>
          </Button>
        </form>

        <GoogleButton clientId={googleClientId} />

        {/* Footer Section */}
        <footer className="text-center text-xs text-[var(--color-muted-foreground)] pt-2 border-t border-[var(--color-border)]/50">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-[var(--color-accent)] hover:underline transition-all"
          >
            Sign up
          </Link>
        </footer>
      </section>
    </main>
  );
}
