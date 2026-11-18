import { dashboard, DashboardState } from '@lark-base-open/js-sdk';
import { DEFAULT_APPEARANCE, DEFAULT_ICON, DEFAULT_ICON_COLOR } from '@/lib/timeline';
import { TRANSPARENT_COLOR } from '@/lib/milestone-icons';
import type { IAppearance, IPluginConfig } from '@/lib/timeline';

export const IS_DASHBOARD_HOST = window.self !== window.top;

/**
 * 宿主注入的仪表盘状态。首帧可能还没就绪（undefined），
 * 所以所有判断都必须放在调用时读取，不能缓存成模块常量。
 */
export function readDashboardState(): DashboardState | undefined {
  if (!IS_DASHBOARD_HOST) return undefined;
  return (dashboard as { state?: DashboardState }).state;
}

/**
 * 创建状态（Create）和配置状态（Config）都需要展示配置面板。
 * 状态未就绪时按配置状态处理，避免进入展示态却没有配置入口。
 */
export function isConfigMode(): boolean {
  const state = readDashboardState();
  if (state === undefined || state === null) return true;
  return state === DashboardState.Create || state === DashboardState.Config;
}

/** 展示状态：View / FullScreen */
export function isViewMode(): boolean {
  const state = readDashboardState();
  return state === DashboardState.View || state === DashboardState.FullScreen;
}

/**
 * 通知宿主已渲染完成。创建状态下宿主可能拒绝该调用，
 * 属于正常现象，忽略即可，不影响插件使用。
 */
export async function markRendered(): Promise<void> {
  try {
    await dashboard.setRendered();
  } catch {
    // 创建状态或宿主未就绪时会被拒绝，忽略
  }
}

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

/**
 * 读取已保存的配置。
 * 创建状态下宿主禁止调用 getConfig，此时直接返回 null；
 * 状态未知时若读取被拒，同样按“暂无配置”处理，不阻断插件渲染。
 */
export async function getSavedConfig(): Promise<IPluginConfig | null> {
  if (readDashboardState() === DashboardState.Create) return null;

  let saved: Awaited<ReturnType<typeof dashboard.getConfig>>;
  try {
    saved = await dashboard.getConfig();
  } catch {
    return null;
  }

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
