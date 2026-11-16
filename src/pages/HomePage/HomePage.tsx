import { useEffect, useState } from 'react';
import { dashboard } from '@lark-base-open/js-sdk';
import MilestoneTimeline from '@/pages/HomePage/MilestoneTimeline';
import TimelineConfig from '@/pages/HomePage/TimelineConfig';
import {
  getSavedConfig,
  IS_CONFIG_MODE,
  IS_DASHBOARD_HOST,
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
  const [loading, setLoading] = useState(IS_DASHBOARD_HOST);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
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
        const savedConfig = await getSavedConfig();
        if (!active) return;
        if (savedConfig) {
          setConfig(savedConfig);
        } else if (IS_CONFIG_MODE) {
          setConfig({ ...EMPTY_CONFIG, nodes: [createEmptyNode()] });
        }
      } catch (cause) {
        if (active) setError(`插件初始化失败：${String(cause)}`);
      } finally {
        if (active) setLoading(false);
        await dashboard.setRendered();
      }
    }

    void initialize();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!IS_DASHBOARD_HOST || IS_CONFIG_MODE) return;
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
  }, []);

  function updateConfig(nextConfig: IPluginConfig) {
    setConfig(nextConfig);
    setSaveMessage('');
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
      setSaveMessage('已发布到当前仪表盘');
    } catch (cause) {
      setError(`发布失败：${String(cause)}`);
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
        <MilestoneTimeline
          milestones={milestones}
          today={today}
          loading={loading || today === 0}
          preview={!IS_DASHBOARD_HOST}
          appearance={config.appearance}
        />
      </div>
      {IS_CONFIG_MODE && (
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
