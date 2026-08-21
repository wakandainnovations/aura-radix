import { useState } from 'react';
import { Volume2, Smile, Eye, Users, Rocket, Music, Play, Newspaper, MessageCircle } from 'lucide-react';
import StatCard from '../shared/StatCard';
import { Panel, PanelLink, DropdownPill } from '../shared/Panel';
import LegendDonut from '../shared/LegendDonut';
import BarRow from '../shared/BarRow';
import TrendLine from '../shared/TrendLine';
import IndiaStatesMap from '../shared/IndiaStatesMap';
import PlatformPerformanceModal from './PlatformPerformanceModal';
import SentimentTrendsModal from './SentimentTrendsModal';
import { AXIS_TICKS_15D } from './myMovieTabsData';

const STAT_ICONS = { buzz: Volume2, sentiment: Smile, awareness: Eye, engagement: Users, momentum: Rocket };
const DRIVER_ICONS = { song: Music, trailer: Play, media: Newspaper, fan: MessageCircle };

function PanelSkeleton() {
  return (
    <div className="space-y-2.5 animate-pulse" role="status" aria-label="Loading">
      <div className="h-3.5 bg-white/10 rounded w-2/3" />
      <div className="h-3.5 bg-white/10 rounded w-1/2" />
      <div className="h-3.5 bg-white/10 rounded w-3/5" />
    </div>
  );
}

export default function PerformanceTab({ data, isTrendLoading, isPlatformLoading, isRegionsLoading }) {
  const d = data;
  const [platformModalOpen, setPlatformModalOpen] = useState(false);
  const [sentimentModalOpen, setSentimentModalOpen] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Performance</h2>
        <p className="text-sm text-white/40">Deep dive into how your movie is performing across platforms and audiences.</p>
      </div>

      <div className="flex justify-end gap-2">
        <DropdownPill>Metric: Buzz</DropdownPill>
        <DropdownPill>Last 30 days</DropdownPill>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {d.stats.map((s) => (
          <StatCard
            key={s.label}
            icon={STAT_ICONS[s.iconKey]}
            iconHue="violet"
            label={s.label}
            value={s.value}
            suffix={s.suffix}
            delta={s.delta}
            deltaTone={s.deltaTone}
            caption={s.caption ?? 'vs previous 30 days'}
            sparkline={s.spark}
            sparklineColor="#a78bfa"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <Panel title="BUZZ OVER TIME" info description="Track how conversations around your movie have changed over time." control={<DropdownPill>Overall</DropdownPill>}>
          {isTrendLoading ? (
            <PanelSkeleton />
          ) : (
            <TrendLine data={d.buzzOverTime} series={[{ key: 'value', label: 'Buzz', color: '#a78bfa' }]} ticks={d.buzzOverTimeTicks ?? AXIS_TICKS_15D} area />
          )}
        </Panel>

        <Panel title="TOP DRIVERS" info description="What's contributing to your performance.">
          <div className="space-y-4 flex-1">
            {d.topDrivers.map((driver) => {
              const Icon = DRIVER_ICONS[driver.iconKey];
              return (
                <div key={driver.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/80 mb-1">{driver.label}</div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: `${driver.pct * 2}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-emerald-400 text-sm font-semibold">↑ {driver.pct}%</div>
                    <div className="text-[11px] text-white/35">{driver.caption}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <PanelLink>View all drivers</PanelLink>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="PLATFORM BREAKDOWN" info description="Where your conversations are happening.">
          {isPlatformLoading ? <PanelSkeleton /> : <LegendDonut data={d.platformBreakdown} centerValue="100%" size={130} />}
          <PanelLink onClick={() => setPlatformModalOpen(true)}>View platform performance</PanelLink>
          <PlatformPerformanceModal
            open={platformModalOpen}
            onOpenChange={setPlatformModalOpen}
            data={d.platformSentimentBreakdown}
          />
        </Panel>

        <Panel title="SENTIMENT DISTRIBUTION" info description="Overall tone of conversations.">
          {isPlatformLoading ? (
            <PanelSkeleton />
          ) : (
            <LegendDonut data={d.sentimentDistribution} centerValue={d.sentimentPositivePct ?? '80%'} centerLabel="Positive" size={130} />
          )}
          <PanelLink onClick={() => setSentimentModalOpen(true)}>View sentiment trends</PanelLink>
          <SentimentTrendsModal
            open={sentimentModalOpen}
            onOpenChange={setSentimentModalOpen}
            data={d.sentimentPlatformBreakdown}
          />
        </Panel>

        <Panel title="TOP REGIONS BY BUZZ" info description="Where you're getting the most buzz.">
          {isRegionsLoading ? (
            <PanelSkeleton />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                {d.topRegions.map((r) => (
                  <BarRow key={r.label} label={r.label} pct={r.pct * 3} valueLabel={`${r.pct}%`} color="#a78bfa" />
                ))}
              </div>
              <IndiaStatesMap regions={d.topRegionsForMap} height={140} />
            </div>
          )}
          <PanelLink>View all regions</PanelLink>
        </Panel>
      </div>
    </div>
  );
}
