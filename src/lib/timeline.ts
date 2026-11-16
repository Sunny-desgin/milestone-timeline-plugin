// EXPORTS: IMilestone{id,name,timestamp,icon,color}, INodeConfig{id,name,date,icon,color}, IAppearance{backgroundColor,axisColor,axisWidth}, IPluginConfig{nodes,appearance}, EMPTY_CONFIG, DEFAULT_APPEARANCE, DEFAULT_ICON, DEFAULT_ICON_COLOR, createEmptyNode, createDemoMilestones, configToMilestones, isConfigComplete
export interface IMilestone {
  id: string;
  name: string;
  timestamp: number;
  icon: string;
  color: string;
}

export interface INodeConfig {
  id: string;
  name: string;
  date: string;
  icon: string;
  color: string;
}

export interface IAppearance {
  backgroundColor: string;
  axisColor: string;
  axisWidth: number;
}

export interface IPluginConfig {
  nodes: INodeConfig[];
  appearance: IAppearance;
}

export const DEFAULT_ICON = 'flag';
export const DEFAULT_ICON_COLOR = '#FFFFFF';
export const DEFAULT_APPEARANCE: IAppearance = {
  backgroundColor: '#FFFFFF',
  axisColor: '#E5E7EB',
  axisWidth: 2,
};
export const EMPTY_CONFIG: IPluginConfig = { nodes: [], appearance: DEFAULT_APPEARANCE };

export function createEmptyNode(): INodeConfig {
  return {
    id: crypto.randomUUID(),
    name: '',
    date: '',
    icon: DEFAULT_ICON,
    color: DEFAULT_ICON_COLOR,
  };
}

function dateTimestamp(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const timestamp = Date.parse(`${date}T00:00:00`);
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function configToMilestones(config: IPluginConfig): IMilestone[] {
  return config.nodes.flatMap((node) => {
    const timestamp = dateTimestamp(node.date);
    if (timestamp === null || !node.name.trim()) return [];
    return [{
      id: node.id,
      name: node.name.trim(),
      timestamp,
      icon: node.icon,
      color: node.color,
    }];
  }).sort((a, b) => a.timestamp - b.timestamp);
}

export function isConfigComplete(config: IPluginConfig) {
  return config.nodes.length > 0 && configToMilestones(config).length === config.nodes.length;
}

export function createDemoMilestones(today: number): IMilestone[] {
  const day = 24 * 60 * 60 * 1000;
  const items = [
    { id: 'demo-1', name: '需求确认', offset: -42 },
    { id: 'demo-2', name: '方案冻结', offset: -21 },
    { id: 'demo-3', name: '设计发布', offset: -7 },
    { id: 'demo-4', name: '样件试制', offset: 12 },
    { id: 'demo-5', name: '验证完成', offset: 32 },
    { id: 'demo-6', name: '项目交付', offset: 55 },
  ];

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    timestamp: today + item.offset * day,
    icon: DEFAULT_ICON,
    color: DEFAULT_ICON_COLOR,
  }));
}
