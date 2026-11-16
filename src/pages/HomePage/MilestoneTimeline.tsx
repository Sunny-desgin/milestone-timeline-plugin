import { useEffect, useRef } from 'react';
import { CalendarDays, Flag, LoaderCircle } from 'lucide-react';
import type { IAppearance, IMilestone } from '@/lib/timeline';
import MilestoneIcon from '@/components/MilestoneIcon';

interface MilestoneTimelineProps {
  milestones: IMilestone[];
  today: number;
  loading: boolean;
  preview: boolean;
  appearance: IAppearance;
}

const DAY = 24 * 60 * 60 * 1000;
const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const todayFormatter = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
});

function percentOf(timestamp: number, start: number, end: number) {
  return ((timestamp - start) / (end - start)) * 100;
}

export default function MilestoneTimeline({ milestones, today, loading, preview, appearance }: MilestoneTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const timestamps = milestones.map((item) => item.timestamp).concat(today || []);
  const min = timestamps.length ? Math.min(...timestamps) : 0;
  const max = timestamps.length ? Math.max(...timestamps) : DAY;
  const padding = Math.max((max - min) * 0.08, DAY * 3);
  const start = min - padding;
  const end = max + padding;
  const todayPosition = percentOf(today, start, end);
  const canvasWidth = Math.max(760, milestones.length * 170);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || !today || loading) return;
    const left = (todayPosition / 100) * scroller.scrollWidth - scroller.clientWidth / 2;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scroller.scrollTo({ left: Math.max(0, left), behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [today, todayPosition, loading, milestones.length]);

  return (
    <section className="timeline-shell" aria-label="项目里程碑时间轴">
      <header className="timeline-header">
        <div>
          <div className="timeline-eyebrow">
            <Flag size={14} /> 项目进度计划
            {preview && <span className="preview-badge">示例数据</span>}
          </div>
        </div>
        <div className="timeline-count"><strong>{milestones.length}</strong><span>个节点</span></div>
      </header>

      <div className="timeline-scroll" ref={scrollRef}>
        <div className="timeline-canvas" style={{ width: canvasWidth, minWidth: '100%' }}>
          {today > 0 && (
            <div className="today-marker" style={{ left: `${todayPosition}%` }}>
              <span>今天 · {todayFormatter.format(today)}</span>
            </div>
          )}
          <div
            className="timeline-axis"
            style={{ height: appearance.axisWidth, backgroundColor: appearance.axisColor }}
          />
          {milestones.map((milestone, index) => (
            <div
              className={`milestone-node ${index % 2 === 0 ? 'is-above' : 'is-below'}`}
              key={milestone.id}
              style={{ left: `${percentOf(milestone.timestamp, start, end)}%` }}
            >
              <div className="milestone-card">
                <strong>{milestone.name}</strong>
                <time>{dateFormatter.format(milestone.timestamp)}</time>
              </div>
              <span className="milestone-dot" style={{ color: milestone.color }}>
                <MilestoneIcon name={milestone.icon} size={15} />
              </span>
            </div>
          ))}
          {!loading && milestones.length === 0 && (
            <div className="timeline-empty">
              <CalendarDays size={28} />
              <strong>暂无可显示的里程碑</strong>
              <span>请在设置中添加节点名称和日期，然后点击发布</span>
            </div>
          )}
          {loading && (
            <div className="timeline-empty">
              <LoaderCircle className="spin" size={26} />
              <span>正在读取项目节点</span>
            </div>
          )}
        </div>
      </div>
      <footer className="timeline-footer">
        <span>按日期排序</span>
        <span>横向滚动查看完整计划</span>
      </footer>
    </section>
  );
}
