import { Youtube, Instagram, Facebook } from 'lucide-react';
import { Panel, PanelLink } from '../shared/Panel';
import LegendDonut from '../shared/LegendDonut';
import TrendLine from '../shared/TrendLine';
import AIInsightBar from '../shared/AIInsightBar';
import { CARD, PLATFORM_COLOR } from '../theme';
import { platformWatchData } from './warRoomData';

const STATUS_TONE = { Strong: 'bg-emerald-500/15 text-emerald-400', Moderate: 'bg-amber-500/15 text-amber-400', Normal: 'bg-white/[0.06] text-white/50' };
const PLATFORM_ICON = { YouTube: Youtube, Instagram: Instagram, Facebook: Facebook };

function PlatformCard({ p }) {
  const Icon = PLATFORM_ICON[p.label];
  return (
    <div className={`${CARD} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="w-4 h-4" style={{ color: PLATFORM_COLOR[p.label] }} /> : <span className="w-4 h-4 rounded-full" style={{ backgroundColor: PLATFORM_COLOR[p.label] }} />}
          <span className="text-sm font-medium text-white/85">{p.label}</span>
        </div>
        <span className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_TONE[p.status]}`}>{p.status}</span>
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between"><span className="text-white/40">Buzz / min</span><span className="text-white/80">{p.buzz}</span></div>
        <div className="flex justify-between"><span className="text-white/40">Sentiment</span><span className="text-emerald-400">{p.sentiment}</span></div>
        <div className="flex justify-between"><span className="text-white/40">Velocity</span><span className="text-white/80">{p.velocity}</span></div>
        <div className="flex justify-between"><span className="text-white/40">Top Post</span><span className="text-white/80">{p.topPost}</span></div>
        <div className="flex justify-between"><span className="text-white/40">Top Creator</span><span className="text-white/80 truncate max-w-[100px]">{p.topCreator}</span></div>
      </div>
    </div>
  );
}

export default function PlatformWatchTab() {
  const d = platformWatchData;

  return (
    <div className="p-6 space-y-4">
      <Panel title="PLATFORM OVERVIEW" info>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {d.platforms.map((p) => (
            <PlatformCard key={p.label} p={p} />
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="PLATFORM SHARE OF VOICE" info>
          <LegendDonut data={d.shareOfVoice} centerValue="28.6K" centerLabel="Total Mentions" size={140} />
          <PanelLink>View full report</PanelLink>
        </Panel>

        <Panel title="SENTIMENT BY PLATFORM" info description="Where sentiment is strongest (or weakest).">
          <div className="space-y-3 flex-1">
            {d.sentimentByPlatform.map((p) => (
              <div key={p.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/60">{p.label}</span>
                  <span className="text-white/40">{p.positive}% / {p.neutral}% / {p.negative}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden flex bg-white/[0.06]">
                  <div className="h-full bg-emerald-400" style={{ width: `${p.positive}%` }} />
                  <div className="h-full bg-white/30" style={{ width: `${p.neutral}%` }} />
                  <div className="h-full bg-red-400" style={{ width: `${p.negative}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="PLATFORM VELOCITY TREND" info description="Last 60 min.">
          <TrendLine
            data={d.velocityTrend}
            series={[
              { key: 'youtube', label: 'YouTube', color: '#f87171' },
              { key: 'instagram', label: 'Instagram', color: '#f472b6' },
              { key: 'xTwitter', label: 'X (Twitter)', color: '#cbd5e1' },
              { key: 'facebook', label: 'Facebook', color: '#3987e5' },
              { key: 'reddit', label: 'Reddit', color: '#fb923c' },
            ]}
          />
        </Panel>
      </div>

      <AIInsightBar insight={d.aiInsight} actions={d.actions} layout="cards" />
    </div>
  );
}
