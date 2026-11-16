import { dashboard, DashboardState } from '@lark-base-open/js-sdk';
import { DEFAULT_APPEARANCE, DEFAULT_ICON, DEFAULT_ICON_COLOR } from '@/lib/timeline';
import { TRANSPARENT_COLOR } from '@/lib/milestone-icons';
import type { IAppearance, IPluginConfig } from '@/lib/timeline';

export const IS_DASHBOARD_HOST = window.self !== window.top;
export const IS_CONFIG_MODE = IS_DASHBOARD_HOST &&
  (dashboard.state === DashboardState.Create || dashboard.state === DashboardState.Config);

function normalizeColor(value: unknown, fallback: string, allowTransparent = true) {
  if (typeof value !== 'string') return fallback;
  if (allowTransparent && value === TRANSPARENT_COLOR) return value;
  return /^#[0-9A-Fa-f]{6}$/.test(value) ? value : fallback;
}

function normalizeAppearance(value: unknown): IAppearance {
  const candidate = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const width = typeof candidate.axisWidth === 'number' && Number.isFinite(candidate.axisWidth)
    ? Math.round(candidate.axisWidth)
    : DEFAULT_APPEARANCE.axisWidth;
  return {
    backgroundColor: normalizeColor(candidate.backgroundColor, DEFAULT_APPEARANCE.backgroundColor),
    axisColor: normalizeColor(candidate.axisColor, DEFAULT_APPEARANCE.axisColor, false),
    axisWidth: Math.min(8, Math.max(1, width)),
  };
}

export async function getSavedConfig(): Promise<IPluginConfig | null> {
  if (dashboard.state === DashboardState.Create) return null;
  const saved = await dashboard.getConfig();
  const value = saved.customConfig?.timeline;
  if (!value || typeof value !== 'object') return null;

  const candidate = value as Record<string, unknown>;
  if (!Array.isArray(candidate.nodes)) return null;
  const nodes = candidate.nodes.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const node = item as Record<string, unknown>;
    if (typeof node.id !== 'string' || typeof node.name !== 'string' || typeof node.date !== 'string') {
      return [];
    }
    return [{
      id: node.id,
      name: node.name,
      date: node.date,
      icon: typeof node.icon === 'string' ? node.icon : DEFAULT_ICON,
      color: normalizeColor(node.color, DEFAULT_ICON_COLOR),
    }];
  });

  return { nodes, appearance: normalizeAppearance(candidate.appearance) };
}

export async function saveTimelineConfig(config: IPluginConfig) {
  const normalized = {
    nodes: config.nodes.map((node) => ({ ...node, name: node.name.trim() })),
    appearance: { ...config.appearance },
  };
  await dashboard.saveConfig({
    dataConditions: [],
    customConfig: { timeline: normalized },
  });
}
