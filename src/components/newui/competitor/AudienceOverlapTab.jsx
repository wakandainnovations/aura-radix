import StatCard from '../shared/StatCard';
import { Panel, PanelLink, DropdownPill } from '../shared/Panel';
import BarRow from '../shared/BarRow';
import TrendLine from '../shared/TrendLine';
import VennCluster from '../shared/VennCluster';
import AIInsightBar from '../shared/AIInsightBar';
import { thClass, tdClass, trClass } from '../theme';
import { audienceOverlapData, AXIS_TICKS } from './competitorData';

const LOYALTY_TONE = { Low: 'text-red-400', Medium: 'text-amber-400', High: 'text-emerald-400' };

function OverlapTable({ rows, cols }) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className={thClass}>{cols[0]}</th>
          {cols.slice(1).map((c) => (
            <th key={c} className={`${thClass} text-right`}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label} className={trClass}>
            <td className={tdClass}>{r.label}</td>
            <td className={`${tdClass} text-right text-white/60`}>{r.veera2}%</td>
            <td className={`${tdClass} text-right text-white/60`}>{r.rudra}%</td>
            <td className={`${tdClass} text-right text-white/60`}>{r.shadows}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function AudienceOverlapTab() {
  const d = audienceOverlapData;

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {d.stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} deltaTone={s.deltaTone ?? 'good'} caption={s.caption ?? 'vs previous 30 days'} badge={s.badge} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="AUDIENCE OVERLAP VENN DIAGRAM" info description="Compare your audience with competitors.">
          <VennCluster
            height={230}
            circles={[
              { xPct: 32, yPct: 38, size: 150, color: '#a78bfa' },
              { xPct: 58, yPct: 38, size: 150, color: '#3987e5' },
              { xPct: 32, yPct: 65, size: 150, color: '#f97316' },
              { xPct: 58, yPct: 65, size: 150, color: '#f87171' },
            ]}
            zoneLabels={[
              { text: '12%', xPct: 20, yPct: 22 },
              { text: '12%', xPct: 70, yPct: 22 },
              { text: '8%', xPct: 15, yPct: 55 },
              { text: '9%', xPct: 75, yPct: 55 },
              { text: '8%', xPct: 20, yPct: 78 },
              { text: '9%', xPct: 70, yPct: 78 },
              { text: '21%', xPct: 45, yPct: 50 },
            ]}
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 text-xs">
            <div className="flex items-center gap-1.5 text-white/50"><span className="w-2 h-2 rounded-full bg-[#a78bfa]" />Lord Gaaga (You) 2.8M</div>
            <div className="flex items-center gap-1.5 text-white/50"><span className="w-2 h-2 rounded-full bg-[#3987e5]" />Veera 2 2.1M</div>
            <div className="flex items-center gap-1.5 text-white/50"><span className="w-2 h-2 rounded-full bg-[#f97316]" />Shadows of War 1.4M</div>
            <div className="flex items-center gap-1.5 text-white/50"><span className="w-2 h-2 rounded-full bg-[#f87171]" />Untitled Love Story 900K</div>
          </div>
        </Panel>

        <Panel title="OVERLAP BY COMPETITOR" info description="How much your audience overlaps with each competitor.">
          <div className="space-y-3 flex-1">
            {d.overlapByCompetitor.map((o) => (
              <BarRow key={o.label} label={o.label} pct={o.pct * 2} valueLabel={`${o.pct}% (${o.delta})`} color="#a78bfa" />
            ))}
          </div>
        </Panel>

        <Panel title="AUDIENCE OVERLAP TREND" info description="How overlap rate has changed over time.">
          <TrendLine
            data={d.trend}
            series={[
              { key: 'veera2', label: 'Veera 2', color: '#a78bfa' },
              { key: 'rudra', label: 'Rudra: The Rise', color: '#34d399' },
              { key: 'shadows', label: 'Shadows of War', color: '#f97316' },
              { key: 'uls', label: 'Untitled Love Story', color: '#f87171' },
            ]}
            ticks={AXIS_TICKS}
            compact={false}
            domainMax={50}
          />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="AUDIENCE SEGMENT OVERLAP" info description="Which audience segments overlap the most.">
          <OverlapTable rows={d.segmentOverlap} cols={['Audience Segment', 'Veera 2', 'Rudra', 'Shadows']} />
        </Panel>

        <Panel title="DEMOGRAPHIC OVERLAP" info description="Compare demographic overlap across key groups." control={<DropdownPill>Higher overlap</DropdownPill>}>
          <OverlapTable rows={d.demographicOverlap} cols={['Demographic', 'Veera 2', 'Rudra', 'Shadows']} />
        </Panel>

        <Panel title="AUDIENCE AT RISK" info description="Audience highly exposed to competitors.">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Competitor</th>
                <th className={`${thClass} text-right`}>At Risk</th>
                <th className={`${thClass} text-right`}>Loyalty</th>
              </tr>
            </thead>
            <tbody>
              {d.atRisk.map((r) => (
                <tr key={r.label} className={trClass}>
                  <td className={tdClass}>{r.label}</td>
                  <td className={`${tdClass} text-right text-white/60`}>{r.audience} ({r.pct})</td>
                  <td className={`${tdClass} text-right font-medium ${LOYALTY_TONE[r.loyalty]}`}>{r.loyalty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <AIInsightBar insight={d.aiInsight} actions={d.actions} ctaLabel="View AI Recommendations" />
    </div>
  );
}
