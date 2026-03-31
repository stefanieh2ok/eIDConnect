/**
 * Type declaration for lucide-react (fixes "is not a module" with moduleResolution: bundler).
 * Remove this file when upgrading to a lucide-react version with compatible types.
 */
declare module 'lucide-react' {
  import type { FC, SVGProps } from 'react';
  type LucideIconProps = SVGProps<SVGSVGElement> & { size?: number };
  export type LucideIcon = FC<LucideIconProps>;
  export const Settings: FC<LucideIconProps>;
  export const X: FC<LucideIconProps>;
  export const ChevronDown: FC<LucideIconProps>;
  export const MessageCircle: FC<LucideIconProps>;
  export const Send: FC<LucideIconProps>;
  export const Bot: FC<LucideIconProps>;
  export const User: FC<LucideIconProps>;
  export const BookOpen: FC<LucideIconProps>;
  export const Users: FC<LucideIconProps>;
  export const AlertCircle: FC<LucideIconProps>;
  export const Info: FC<LucideIconProps>;
  export const CheckCircle: FC<LucideIconProps>;
  export const TrendingUp: FC<LucideIconProps>;
  export const Sparkles: FC<LucideIconProps>;
  export const ChevronRight: FC<LucideIconProps>;
  export const ChevronLeft: FC<LucideIconProps>;
  export const ChevronUp: FC<LucideIconProps>;
  export const ThumbsUp: FC<LucideIconProps>;
  export const ThumbsDown: FC<LucideIconProps>;
  export const Clock: FC<LucideIconProps>;
  export const MapPin: FC<LucideIconProps>;
  export const Check: FC<LucideIconProps>;
  export const ExternalLink: FC<LucideIconProps>;
  export const Trophy: FC<LucideIconProps>;
  export const Star: FC<LucideIconProps>;
  export const Target: FC<LucideIconProps>;
  export const Zap: FC<LucideIconProps>;
  export const Award: FC<LucideIconProps>;
  export const Lock: FC<LucideIconProps>;
  export const Calendar: FC<LucideIconProps>;
  export const BarChart2: FC<LucideIconProps>;
  export const MessageSquare: FC<LucideIconProps>;
  export const Vote: FC<LucideIconProps>;
  export const CalendarDays: FC<LucideIconProps>;
  export const Building: FC<LucideIconProps>;
  export const Clipboard: FC<LucideIconProps>;
  export const Inbox: FC<LucideIconProps>;
  export const List: FC<LucideIconProps>;
  export const Scale: FC<LucideIconProps>;
  export const ListChecks: FC<LucideIconProps>;
  export const Camera: FC<LucideIconProps>;
  export const Wrench: FC<LucideIconProps>;
  export const TreePine: FC<LucideIconProps>;
  export const Lightbulb: FC<LucideIconProps>;
  export const MoreHorizontal: FC<LucideIconProps>;
  export const SlidersHorizontal: FC<LucideIconProps>;
  export const Mic: FC<LucideIconProps>;
  export const MicOff: FC<LucideIconProps>;
  export const Volume2: FC<LucideIconProps>;
  export const VolumeX: FC<LucideIconProps>;
  export const RotateCcw: FC<LucideIconProps>;
  export const Newspaper: FC<LucideIconProps>;
  export const Minus: FC<LucideIconProps>;
}
