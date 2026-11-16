import { Ban, Check, ListPlus, LoaderCircle, Plus, Trash2 } from 'lucide-react';
import type { IAppearance, IPluginConfig } from '@/lib/timeline';
import MilestoneIcon from '@/components/MilestoneIcon';
import { MILESTONE_COLORS, MILESTONE_ICONS, TRANSPARENT_COLOR } from '@/lib/milestone-icons';
import { Button } from '@/components/ui/button';

interface ColorFieldProps {
  label: string;
  value: string;
  allowTransparent?: boolean;
  onChange: (value: string) => void;
}

function ColorField({ label, value, allowTransparent = false, onChange }: ColorFieldProps) {
  return (
    <div className="config-field">
      <span>{label}</span>
      <div className="color-swatches" role="group" aria-label={label}>
        {MILESTONE_COLORS.map((color) => (
          <button
            type="button"
            key={color}
            className={`color-swatch ${value === color ? 'is-selected' : ''}`}
            style={{
              backgroundColor: color,
              color: color === '#FFFFFF' || color === '#FFC60A' ? '#1F2329' : '#FFFFFF',
            }}
            title={color === '#FFFFFF' ? '白色' : color}
            aria-label={`${label} ${color}`}
            aria-pressed={value === color}
            onClick={() => onChange(color)}
          >
            {value === color && <Check size={13} strokeWidth={3} />}
          </button>
        ))}
        <input
          className="custom-color-input"
          type="color"
          value={value === TRANSPARENT_COLOR ? '#FFFFFF' : value}
          title="自定义颜色"
          aria-label={`${label}自定义颜色`}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
        />
        {allowTransparent && (
          <button
            type="button"
            className={`color-swatch transparent-swatch ${value === TRANSPARENT_COLOR ? 'is-selected' : ''}`}
            title="透明"
            aria-label={`${label}透明`}
            aria-pressed={value === TRANSPARENT_COLOR}
            onClick={() => onChange(TRANSPARENT_COLOR)}
          >
            <Ban size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

interface TimelineConfigProps {
  config: IPluginConfig;
  saving: boolean;
  saveMessage: string;
  onAddNode: () => void;
  onRemoveNode: (id: string) => void;
  onNodeChange: (id: string, key: 'name' | 'date' | 'icon' | 'color', value: string) => void;
  onAppearanceChange: (appearance: IAppearance) => void;
  onSave: () => void;
}

export default function TimelineConfig({
  config,
  saving,
  saveMessage,
  onAddNode,
  onRemoveNode,
  onNodeChange,
  onAppearanceChange,
  onSave,
}: TimelineConfigProps) {
  return (
    <aside className="config-panel">
      <div className="config-heading">
        <ListPlus size={18} />
        <div>
          <h2>里程碑设置</h2>
          <p>自定义节点和插件外观，最后统一发布</p>
        </div>
      </div>

      <details className="appearance-editor" open>
        <summary>插件外观设置</summary>
        <div className="appearance-content">
          <ColorField
            label="插件背景"
            value={config.appearance.backgroundColor}
            allowTransparent
            onChange={(backgroundColor) => onAppearanceChange({ ...config.appearance, backgroundColor })}
          />
          <ColorField
            label="横轴颜色"
            value={config.appearance.axisColor}
            onChange={(axisColor) => onAppearanceChange({ ...config.appearance, axisColor })}
          />
          <label className="config-field">
            <span>横轴粗细</span>
            <span className="axis-width-control">
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={config.appearance.axisWidth}
                onChange={(event) => onAppearanceChange({
                  ...config.appearance,
                  axisWidth: Number(event.target.value),
                })}
              />
              <output>{config.appearance.axisWidth}px</output>
            </span>
          </label>
        </div>
      </details>

      <div className="node-editor-list">
        {config.nodes.map((node, index) => (
          <section className="node-editor" key={node.id}>
            <div className="node-editor-heading">
              <strong>节点 {index + 1}</strong>
              <button
                type="button"
                className="node-remove"
                aria-label={`删除节点 ${index + 1}`}
                title="删除节点"
                onClick={() => onRemoveNode(node.id)}
              >
                <Trash2 size={15} />
              </button>
            </div>
            <label className="config-field">
              <span>节点名称</span>
              <input
                type="text"
                value={node.name}
                maxLength={50}
                placeholder="例如：设计发布"
                onChange={(event) => onNodeChange(node.id, 'name', event.target.value)}
              />
            </label>
            <label className="config-field">
              <span>节点日期</span>
              <input
                type="date"
                value={node.date}
                onChange={(event) => onNodeChange(node.id, 'date', event.target.value)}
              />
            </label>
            <div className="config-field">
              <span>节点图标</span>
              <div className="icon-options" role="group" aria-label={`节点 ${index + 1} 图标`}>
                {MILESTONE_ICONS.map((icon) => (
                  <button
                    type="button"
                    key={icon.id}
                    className={`icon-option ${node.icon === icon.id ? 'is-selected' : ''}`}
                    title={icon.label}
                    aria-label={icon.label}
                    aria-pressed={node.icon === icon.id}
                    onClick={() => onNodeChange(node.id, 'icon', icon.id)}
                  >
                    <MilestoneIcon name={icon.id} size={17} />
                  </button>
                ))}
              </div>
            </div>
            <ColorField
              label="图标颜色"
              value={node.color}
              allowTransparent
              onChange={(color) => onNodeChange(node.id, 'color', color)}
            />
          </section>
        ))}
        {config.nodes.length === 0 && (
          <div className="node-list-empty">还没有节点，请先添加一个里程碑</div>
        )}
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={onAddNode}>
        <Plus size={16} /> 添加节点
      </Button>

      <div className="config-actions">
        <Button className="w-full" disabled={saving} onClick={onSave}>
          {saving && <LoaderCircle className="spin" size={16} />}
          {saving ? '正在发布' : '发布'}
        </Button>
        {saveMessage && <p className="save-message">{saveMessage}</p>}
      </div>
    </aside>
  );
}
