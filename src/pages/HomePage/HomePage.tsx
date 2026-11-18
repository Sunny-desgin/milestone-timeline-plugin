import { useEffect, useState } from 'react';
import { dashboard } from '@lark-base-open/js-sdk';
import MilestoneTimeline from '@/pages/HomePage/MilestoneTimeline';
import TimelineConfig from '@/pages/HomePage/TimelineConfig';
import {
  getSavedConfig,
  isConfigMode,
  IS_DASHBOARD_HOST,
  markRendered,
  saveTimelineConfig,
} from '@/lib/dashboard';
import {
  configToMilestones,
  createDemoMilestones,
  createEmptyNode,
  EMPTY_CONFIG,
  isConfigComplete,
} from '@/lib/timeline';
import type { IPluginConfig } from '@/lib/timeline';
import './timeline.css';

export default function HomePage() {
  const [today, setToday] = useState(0);
  const [config, setConfig] = useState<IPluginConfig>(EMPTY_CONFIG);
  const [configMode, setConfigMode] = useState(isConfigMode);
  const [loading, setLoading] = useState(IS_DASHBOARD_HOST);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const updateToday = () => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      setToday(now.getTime());
    };
    updateToday();
    const timer = window.setInterval(updateToday, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!IS_DASHBOARD_HOST) return;
    let active = true;

    async function initialize() {
      try {
        // 创建状态下 getConfig 会被宿主拒绝，getSavedConfig 内部已兜底返回 null
        const savedConfig = await getSavedConfig();
        if (!active) return;

        const editable = isConfigMode();
        if (savedConfig) {
          setConfig(savedConfig);
        } else if (editable) {
          setConfig({ ...EMPTY_CONFIG, nodes: [createEmptyNode()] });
        }
        setConfigMode(editable);
        if (editable && !savedConfig) {
          setNotice('首次添加组件，请先配置节点并点击「发布」，配置才会保存到该组件。');
        }
      } catch (cause) {
        if (active) setError(`插件初始化失败：${String(cause)}`);
      } finally {
        if (active) setLoading(false);
        void markRendered();
      }
    }

    void initialize();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!IS_DASHBOARD_HOST || configMode) return;
    let active = true;
    const unsubscribe = dashboard.onConfigChange(async () => {
      try {
        const savedConfig = await getSavedConfig();
        if (active && savedConfig) setConfig(savedConfig);
      } catch (cause) {
        if (active) setError(`配置更新失败：${String(cause)}`);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [configMode]);

  function updateConfig(nextConfig: IPluginConfig) {
    setConfig(nextConfig);
    setSaveMessage('');
    setNotice('');
    setError('');
  }

  function updateNode(id: string, key: 'name' | 'date' | 'icon' | 'color', value: string) {
    updateConfig({
      ...config,
      nodes: config.nodes.map((node) => node.id === id ? { ...node, [key]: value } : node),
    });
  }

  async function handleSave() {
    if (config.nodes.length === 0) {
      setError('请至少添加一个里程碑节点');
      return;
    }
    if (!isConfigComplete(config)) {
      setError('请为每个节点填写名称并选择有效日期');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSaveMessage('');
      await saveTimelineConfig(config);
      setNotice('');
      setSaveMessage('已发布到当前仪表盘');
    } catch (cause) {
      const raw = String(cause);
      setError(
        raw.includes('creation status')
          ? '发布失败：组件还没完成添加。请先在仪表盘里确认添加该组件，进入配置状态后再点「发布」。'
          : `发布失败：${raw}`,
      );
    } finally {
      setSaving(false);
    }
  }

  const milestones = !IS_DASHBOARD_HOST && today > 0
    ? createDemoMilestones(today)
    : configToMilestones(config);

  return (
    <main className="plugin-page" style={{ backgroundColor: config.appearance.backgroundColor }}>
      <div className="timeline-main">
        {error && <div className="error-banner" role="alert">{error}</div>}
        {!error && notice && <div className="notice-banner" role="status">{notice}</div>}
        <MilestoneTimeline
          milestones={milestones}
          today={today}
          loading={loading || today === 0}
          preview={!IS_DASHBOARD_HOST}
          appearance={config.appearance}
        />
      </div>
      {configMode && (
        <TimelineConfig
          config={config}
          saving={saving}
          saveMessage={saveMessage}
          onAddNode={() => updateConfig({ ...config, nodes: [...config.nodes, createEmptyNode()] })}
          onRemoveNode={(id) => updateConfig({ ...config, nodes: config.nodes.filter((node) => node.id !== id) })}
          onNodeChange={updateNode}
          onAppearanceChange={(appearance) => updateConfig({ ...config, appearance })}
          onSave={() => void handleSave()}
        />
      )}
    </main>
  );
}
