import type { SVGProps } from "react";

// Every icon takes `size` (px, default 18) so `<TruckIcon size={16} />` and plain `<TruckIcon />`
// both render at a sane size. Without it an <svg> falls back to filling its container.
type IconProps = Omit<SVGProps<SVGSVGElement>, "width" | "height"> & { size?: number | string };

const Svg = ({ size = 18, children, ...rest }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

export const FacebookIcon = (p: IconProps) => <Svg {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></Svg>;
export const InstagramIcon = (p: IconProps) => <Svg {...p}><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></Svg>;
export const MapPinIcon = (p: IconProps) => <Svg {...p}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></Svg>;
export const PhoneIcon = (p: IconProps) => <Svg {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></Svg>;
export const TruckIcon = (p: IconProps) => <Svg {...p}><path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></Svg>;
export const CloseIcon = (p: IconProps) => <Svg {...p}><path d="M18 6 6 18M6 6l12 12" /></Svg>;
export const SparklesIcon = (p: IconProps) => <Svg {...p}><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /><path d="M19 17v4M17 19h4" /></Svg>;
export const WhatsAppIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 21l1.65-4.9A9 9 0 1 1 8 19.4z" />
    <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.3-1.9-1-.9.7a3 3 0 0 1-1.6-1.6l.7-.9-1-1.9z" />
  </Svg>
);
