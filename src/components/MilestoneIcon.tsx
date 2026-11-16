import { MILESTONE_ICONS } from '@/lib/milestone-icons';

interface MilestoneIconProps {
  name: string;
  size?: number;
}

export default function MilestoneIcon({ name, size = 20 }: MilestoneIconProps) {
  const option = MILESTONE_ICONS.find((item) => item.id === name) ?? MILESTONE_ICONS[0];
  const Icon = option.Icon;
  return (
    <Icon
      size={size}
      strokeWidth={2}
      fill={option.filled ? 'currentColor' : 'none'}
      aria-hidden="true"
    />
  );
}
