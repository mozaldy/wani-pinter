import type { SVGProps } from 'react';

export type IconName =
  | 'home' | 'grid' | 'chart' | 'pulse' | 'users' | 'book' | 'folder'
  | 'edit' | 'bell' | 'search' | 'sparkle' | 'upload' | 'download' | 'plus'
  | 'check' | 'x' | 'chevR' | 'chevD' | 'mic' | 'fileText' | 'clipboard'
  | 'target' | 'flame' | 'settings' | 'db' | 'filter' | 'calendar'
  | 'arrowR' | 'arrowU' | 'arrowD' | 'eye' | 'star' | 'alert'
  | 'sigma' | 'leaf' | 'globe' | 'message' | 'activity' | 'layers'
  | 'parents' | 'paperclip';

const PATHS: Record<IconName, React.ReactNode> = {
  home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  chart: <><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></>,
  pulse: <path d="M3 12h4l2-6 4 12 2-6h6"/>,
  users: <><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14c2.5 0 5 1.5 5 4"/></>,
  book: <><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v16H5.5A1.5 1.5 0 0 1 4 17.5z"/><path d="M4 17.5A1.5 1.5 0 0 1 5.5 16H19"/></>,
  folder: <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4l2 2.5h8.5a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18z"/>,
  edit: <><path d="M4 20h4l10-10-4-4L4 16z"/><path d="M14 6l4 4"/></>,
  bell: <><path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5z"/><path d="M10 19a2 2 0 0 0 4 0"/></>,
  search: <><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.5-3.5"/></>,
  sparkle: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></>,
  upload: <><path d="M12 16V4"/><path d="m6 10 6-6 6 6"/><path d="M4 18v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2"/></>,
  download: <><path d="M12 4v12"/><path d="m6 10 6 6 6-6"/><path d="M4 18v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  check: <path d="m5 12 5 5 9-11"/>,
  x: <><path d="M6 6l12 12M18 6 6 18"/></>,
  chevR: <path d="m9 6 6 6-6 6"/>,
  chevD: <path d="m6 9 6 6 6-6"/>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></>,
  fileText: <><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M8 13h8M8 17h6"/></>,
  clipboard: <><rect x="6" y="4" width="12" height="17" rx="1.5"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M9 11h6M9 15h4"/></>,
  target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></>,
  flame: <path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-3s-2 1-2 4a6 6 0 0 0 12 0c0-5-7-9-7-9z"/>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.5 1.5 0 0 0 .3 1.6l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.5 1.5 0 0 0-1.6-.3 1.5 1.5 0 0 0-.9 1.4V21a2 2 0 0 1-4 0v-.1a1.5 1.5 0 0 0-1-1.4 1.5 1.5 0 0 0-1.6.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.5 1.5 0 0 0 .3-1.6 1.5 1.5 0 0 0-1.4-.9H3a2 2 0 0 1 0-4h.1a1.5 1.5 0 0 0 1.4-1 1.5 1.5 0 0 0-.3-1.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.5 1.5 0 0 0 1.6.3H9a1.5 1.5 0 0 0 .9-1.4V3a2 2 0 0 1 4 0v.1a1.5 1.5 0 0 0 .9 1.4 1.5 1.5 0 0 0 1.6-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.5 1.5 0 0 0-.3 1.6V9a1.5 1.5 0 0 0 1.4.9H21a2 2 0 0 1 0 4h-.1a1.5 1.5 0 0 0-1.4.9z"/></>,
  db: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></>,
  filter: <path d="M3 4h18l-7 9v6l-4 2v-8z"/>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="1.5"/><path d="M3 10h18M8 3v4M16 3v4"/></>,
  arrowR: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  arrowU: <><path d="M12 19V5"/><path d="m6 11 6-6 6 6"/></>,
  arrowD: <><path d="M12 5v14"/><path d="m6 13 6 6 6-6"/></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
  star: <path d="m12 3 2.6 5.5 6 .9-4.4 4.2 1.1 6L12 17l-5.4 2.6 1.1-6L3.4 9.4l6-.9z"/>,
  alert: <><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/></>,
  sigma: <path d="M6 5h12l-7 7 7 7H6"/>,
  leaf: <><path d="M5 21c8 0 14-6 14-14V4h-3C8 4 4 9 4 16c0 1.5.3 3 1 5z"/><path d="M5 21c4-7 8-10 13-13"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>,
  message: <path d="M21 12a8 8 0 1 1-3.5-6.6L21 5l-1.4 3.5A8 8 0 0 1 21 12z"/>,
  activity: <path d="M3 12h4l2-7 4 14 2-7h6"/>,
  layers: <><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 18 9 5 9-5"/></>,
  parents: <><circle cx="9" cy="7" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5"/><path d="M15 20c0-2 2-3 4-3"/></>,
  paperclip: <path d="m21 11-9 9a5.5 5.5 0 0 1-7.8-7.8l9-9a3.5 3.5 0 0 1 5 5l-9 9a1.5 1.5 0 0 1-2.2-2.2L14 7"/>,
};

export function Icon({ name, size = 18, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={1.75}
      strokeLinecap="round" strokeLinejoin="round"
      {...rest}
    >{PATHS[name]}</svg>
  );
}
