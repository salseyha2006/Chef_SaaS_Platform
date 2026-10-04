const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const MailIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

export const LockIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="4" y="11" width="16" height="9" rx="3" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export const EyeIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.4-1" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
);

export const GlobeIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9S14.5 18.300 12 21c-2.500-2.700-3.800-5.700-3.800-9S9.500 5.700 12 3Z" />
  </svg>
);

export const AlertIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16.500v.01" />
  </svg>
);

export const ClockIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const ChefHatIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M7 14.500A4.500 4.500 0 0 1 8 5.600 4.500 4.500 0 0 1 16 5.600a4.500 4.500 0 0 1 1 8.900V19a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-4.500Z" />
    <path d="M7 16.500h10" />
  </svg>
);

export const GoogleIcon = (p) => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path fill="#4285F4" d="M23.500 12.270c0-.820-.070-1.600-.210-2.360H12v4.470h6.440a5.510 5.510 0 0 1-2.390 3.620v3h3.870c2.260-2.090 3.580-5.160 3.580-8.730Z" />
    <path fill="#34A853" d="M12 24c3.240 0 5.950-1.070 7.930-2.910l-3.870-3c-1.070.720-2.440 1.150-4.060 1.150-3.120 0-5.770-2.110-6.710-4.940H1.290v3.100A12 12 0 0 0 12 24Z" />
    <path fill="#FBBC05" d="M5.290 14.300A7.200 7.200 0 0 1 4.910 12c0-.800.140-1.570.380-2.300V6.600H1.290a12 12 0 0 0 0 10.800l4-3.100Z" />
    <path fill="#EA4335" d="M12 4.750c1.760 0 3.340.610 4.580 1.800l3.430-3.430C17.950 1.190 15.240 0 12 0A12 12 0 0 0 1.290 6.600l4 3.100C6.230 6.860 8.880 4.750 12 4.750Z" />
  </svg>
);

export const ArrowLeftIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const UserIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20a8 8 0 0 1 16 0" />
  </svg>
);

export const CheckCircleIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 2.8 2.8L16 9.8" />
  </svg>
);

export const KeyIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="15" r="4" />
    <path d="m11 12 9-9M16 7l3 3M14 9l2 2" />
  </svg>
);