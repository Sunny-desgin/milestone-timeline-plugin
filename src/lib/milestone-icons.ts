import {
  Award,
  Bell,
  Bookmark,
  CalendarDays,
  CircleCheck,
  Clock3,
  Flag,
  Lightbulb,
  PackageCheck,
  Rocket,
  ShieldCheck,
  Star,
  Target,
  ThumbsUp,
  Trophy,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MilestoneIconOption {
  id: string;
  label: string;
  Icon: LucideIcon;
  filled?: boolean;
}

export const MILESTONE_ICONS: MilestoneIconOption[] = [
  { id: 'flag', label: '旗帜', Icon: Flag, filled: true },
  { id: 'star', label: '星星', Icon: Star, filled: true },
  { id: 'check', label: '完成', Icon: CircleCheck },
  { id: 'target', label: '目标', Icon: Target },
  { id: 'rocket', label: '火箭', Icon: Rocket },
  { id: 'calendar', label: '日历', Icon: CalendarDays },
  { id: 'award', label: '奖章', Icon: Award },
  { id: 'zap', label: '闪电', Icon: Zap, filled: true },
  { id: 'package', label: '交付', Icon: PackageCheck },
  { id: 'bell', label: '提醒', Icon: Bell, filled: true },
  { id: 'bookmark', label: '书签', Icon: Bookmark, filled: true },
  { id: 'clock', label: '时间', Icon: Clock3 },
  { id: 'idea', label: '灵感', Icon: Lightbulb },
  { id: 'shield', label: '保障', Icon: ShieldCheck },
  { id: 'approve', label: '认可', Icon: ThumbsUp, filled: true },
  { id: 'trophy', label: '荣誉', Icon: Trophy },
];

export const MILESTONE_COLORS = [
  '#1F2329',
  '#3370FF',
  '#7F3FF5',
  '#00B42A',
  '#00B8A9',
  '#FFC60A',
  '#FF7D00',
  '#F53F3F',
  '#FFFFFF',
];

export const TRANSPARENT_COLOR = 'transparent';
