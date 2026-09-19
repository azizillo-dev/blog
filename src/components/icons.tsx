import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number, props: SVGProps<SVGSVGElement>) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
  ...props,
});

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/* ---------- UI ikonlar ---------- */
export const SunIcon = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size, p)} {...stroke}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const MoonIcon = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size, p)} {...stroke}>
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" />
  </svg>
);

export const ArrowUpIcon = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size, p)} {...stroke}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

export const ArrowLeftIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size, p)} {...stroke}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const ChevronDownIcon = ({ size = 16, ...p }: IconProps) => (
  <svg {...base(size, p)} {...stroke}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const LockIcon = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size, p)} {...stroke}>
    <rect x="4" y="10" width="16" height="11" rx="2.5" />
    <path d="M8 10V7a4 4 0 1 1 8 0v3" />
  </svg>
);

export const ExternalIcon = ({ size = 16, ...p }: IconProps) => (
  <svg {...base(size, p)} {...stroke}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
);

/* ---------- Ijtimoiy tarmoqlar ---------- */
const brand: Record<string, (p: IconProps) => React.ReactElement> = {
  telegram: ({ size = 20, ...p }) => (
    <svg {...base(size, p)} fill="currentColor">
      <path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.3 13l-4.8-1.5c-1-.3-1-1 .2-1.5L20.6 2.8c.9-.3 1.6.2 1.3 1.5z" />
    </svg>
  ),
  github: ({ size = 20, ...p }) => (
    <svg {...base(size, p)} fill="currentColor">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1.1.9 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
    </svg>
  ),
  linkedin: ({ size = 20, ...p }) => (
    <svg {...base(size, p)} fill="currentColor">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21H9z" />
    </svg>
  ),
  youtube: ({ size = 20, ...p }) => (
    <svg {...base(size, p)} fill="currentColor">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6z" />
    </svg>
  ),
  instagram: ({ size = 20, ...p }) => (
    <svg {...base(size, p)} {...stroke}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  ),
  x: ({ size = 20, ...p }) => (
    <svg {...base(size, p)} fill="currentColor">
      <path d="M18.9 1.2h3.7l-8 9.2L24 22.8h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9zm-1.3 19.4h2L6.5 3.2H4.3z" />
    </svg>
  ),
  facebook: ({ size = 20, ...p }) => (
    <svg {...base(size, p)} fill="currentColor">
      <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
    </svg>
  ),
  leetcode: ({ size = 20, ...p }) => (
    <svg {...base(size, p)} {...stroke}>
      <path d="M14.5 3 6 11.5a2 2 0 0 0 0 2.8l4.2 4.2a2 2 0 0 0 2.8 0L15.5 16M9 12h11M14.5 3l3 3" />
    </svg>
  ),
  email: ({ size = 20, ...p }) => (
    <svg {...base(size, p)} {...stroke}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </svg>
  ),
  website: ({ size = 20, ...p }) => (
    <svg {...base(size, p)} {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  ),
};

export function SocialIcon({ platform, ...props }: IconProps & { platform: string }) {
  const Icon = brand[platform] ?? brand.website;
  return <Icon {...props} />;
}

/** Brend rangi — footer plitkalarida hover uchun. */
export const BRAND_COLOR: Record<string, string> = {
  telegram: "#229ED9",
  github: "var(--fg)", // brend rangi qora/oq — theme'ga moslashadi
  linkedin: "#0A66C2",
  youtube: "#FF0033",
  instagram: "#E1306C",
  x: "var(--fg)",
  facebook: "#1877F2",
  leetcode: "#FFA116",
  email: "#5b4cf0",
  website: "#5b4cf0",
};
