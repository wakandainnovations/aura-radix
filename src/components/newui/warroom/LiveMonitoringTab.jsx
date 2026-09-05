import StatCard from '../shared/StatCard';
import { Panel, PanelLink, DropdownPill } from '../shared/Panel';
import TrendLine from '../shared/TrendLine';
import GeoPlaceholder from '../shared/GeoPlaceholder';
import AIInsightBar from '../shared/AIInsightBar';
import { thClass, tdClass, trClass } from '../theme';
import { liveMonitoringData } from './warRoomData';

export default function LiveMonitoringTab() {
  const d = liveMonitoringData;

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {d.stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} suffix={s.suffix} delta={s.delta} caption={s.caption} badge={s.badge} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr] gap-4">
        <Panel title="CONVERSATION VELOCITY" info description="Mentions per minute." control={<DropdownPill>Last 60 min</DropdownPill>}>
          <TrendLine data={d.velocity} series={[{ key: 'value', label: 'Mentions', color: '#3987e5' }]} height={200} />
        </Panel>
        <Panel title="TICKET BOOKINGS TREND" info description="Tickets booked over time." control={<DropdownPill>Last 6 hours</DropdownPill>}>
          <TrendLine data={d.bookings} series={[{ key: 'value', label: 'Bookings', color: '#34d399' }]} height={200} area />
        </Panel>
        <Panel title="LIVE HEATMAP – MENTIONS" info description="Mentions intensity by region." control={<DropdownPill>India</DropdownPill>}>
          <GeoPlaceholder markers={d.heatmapCities} height={200} />
          <div className="flex items-center justify-between text-[11px] text-white/35 mt-2">
            <span>Low</span>
            <span>High</span>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr] gap-4">
        <Panel title="LIVE HASHTAG RANKING" info description="By mention volume." className="lg:col-span-1">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>#</th>
                <th className={thClass}>Hashtag</th>
                <th className={`${thClass} text-right`}>Volume</th>
                <th className={`${thClass} text-right`}>Change</th>
              </tr>
            </thead>
            <tbody>
              {d.hashtags.map((h) => (
                <tr key={h.tag} className={trClass}>
                  <td className={tdClass}>{h.rank}</td>
                  <td className={tdClass}>{h.tag}</td>
                  <td className={`${tdClass} text-right text-white/50`}>{h.volume}</td>
                  <td className={`${tdClass} text-right ${h.bad ? 'text-red-400' : 'text-emerald-400'}`}>↑ {h.delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {d.metrics.map((m) => (
            <StatCard key={m.label} label={m.label} value={m.value} suffix={m.suffix} delta={m.delta} caption={m.caption} sparkline={m.spark} sparklineColor="#a78bfa" />
          ))}
        </div>
      </div>

      <AIInsightBar insight={d.aiInsight} actions={d.actions} layout="cards" />
    </div>
  );
}
