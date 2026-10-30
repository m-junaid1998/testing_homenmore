"use client";

// Small bridge so components written against react-router (`<Link to>`, `useNavigate`,
// `useLocation`) work unchanged on the Next.js app router.
import NextLink from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to?: string;
  href?: string;
  children?: ReactNode;
};

export function Link({ to, href, children, ...rest }: LinkProps) {
  return (
    <NextLink href={to ?? href ?? "/"} {...rest}>
      {children}
    </NextLink>
  );
}

export const NavLink = Link;

export function useNavigate() {
  const router = useRouter();
  return (to: string | number, opts?: { replace?: boolean }) => {
    if (typeof to === "number") return router.back();
    return opts?.replace ? router.replace(to) : router.push(to);
  };
}

export function useLocation() {
  const pathname = usePathname();
  const search = useSearchParams();
  return { pathname, search: search?.toString() ? `?${search.toString()}` : "" };
}
