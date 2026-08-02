import { TrendingUp, Users, Globe2 } from 'lucide-react';
import { Panel, PanelLink } from '../shared/Panel';
import LegendDonut from '../shared/LegendDonut';
import BarRow from '../shared/BarRow';
import FilterBar from '../shared/FilterBar';
import GeoPlaceholder from '../shared/GeoPlaceholder';
import { thClass, tdClass, trClass } from '../theme';
import { demographicsData } from './audienceData';

const INSIGHT_ICONS = [TrendingUp, Users, Globe2];

export default function DemographicsTab() {
  const d = demographicsData;

  return (
    <div className="p-6 space-y-4">
      <FilterBar
        filters={[
          { label: 'Platform', value: 'All Platforms' },
          { label: 'Content Type', value: 'All' },
          { label: 'Audience', value: 'All Audiences' },
        ]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_1fr_360px] gap-4">
        <Panel title="AUDIENCE BY AGE" info>
          <LegendDonut data={d.age} centerValue="6.2M" centerLabel="Total Audience" size={130} />
          <div className="text-xs text-emerald-400 mt-2">↑ 18% vs previous 30 days</div>
        </Panel>
        <Panel title="AUDIENCE BY GENDER" info>
          <LegendDonut data={d.gender} centerValue="6.2M" centerLabel="Total Audience" size={130} />
          <div className="text-xs text-emerald-400 mt-2">↑ 0.9% vs previous 30 days</div>
        </Panel>
        <Panel title="AUDIENCE BY LANGUAGE" info>
          <div className="space-y-2.5 flex-1">
            {d.language.map((l) => (
              <BarRow key={l.label} label={l.label} pct={l.pct} color="#a78bfa" />
            ))}
          </div>
          <div className="text-xs text-emerald-400 mt-2">↑ 12% vs previous 30 days</div>
        </Panel>
        <Panel title="DEMOGRAPHIC INSIGHTS" info>
          <div className="space-y-4 flex-1">
            {d.insights.map((ins, i) => {
              const Icon = INSIGHT_ICONS[i];
              return (
                <div key={ins.text} className="flex items-start gap-2.5">
                  <Icon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-white/80">{ins.text}</div>
                    <div className="text-[11px] text-white/35">{ins.caption}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <PanelLink>View all insights</PanelLink>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="HOUSEHOLD INCOME (INDIA)" info>
          <LegendDonut data={d.income} centerValue="6.2M" centerLabel="Total Audience" size={130} />
          <div className="text-xs text-emerald-400 mt-2">↑ 10% vs previous 30 days</div>
        </Panel>
        <Panel title="EDUCATION LEVEL" info>
          <LegendDonut data={d.education} centerValue="6.2M" centerLabel="Total Audience" size={130} />
          <div className="text-xs text-emerald-400 mt-2">↑ 7% vs previous 30 days</div>
        </Panel>
        <Panel title="TOP INTERESTS" info>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1 text-sm">
            {[...d.interestsLeft, ...d.interestsRight].map((it) => (
              <div key={it.label} className="flex items-center justify-between gap-2">
                <span className="text-white/70 truncate">{it.label}</span>
                <span className="text-white/50 shrink-0">{it.pct}%</span>
              </div>
            ))}
          </div>
          <PanelLink>View all interests</PanelLink>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="AUDIENCE BY COUNTRY" info>
          <GeoPlaceholder markers={d.worldMarkers} height={160} className="mb-3" />
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Country</th>
                <th className={`${thClass} text-right`}>Audience</th>
              </tr>
            </thead>
            <tbody>
              {d.countries.map((c) => (
                <tr key={c.label} className={trClass}>
                  <td className={tdClass}>{c.label}</td>
                  <td className={`${tdClass} text-right text-white/50`}>{c.audience} ({c.pct})</td>
                </tr>
              ))}
            </tbody>
          </table>
          <PanelLink>View all countries</PanelLink>
        </Panel>

        <Panel title="TOP CITIES" info>
          <GeoPlaceholder markers={d.cityMarkers} height={160} className="mb-3" />
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>City</th>
                <th className={`${thClass} text-right`}>Audience</th>
                <th className={`${thClass} text-right`}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {d.cities.map((c) => (
                <tr key={c.label} className={trClass}>
                  <td className={tdClass}>{c.label}</td>
                  <td className={`${tdClass} text-right text-white/50`}>{c.audience} ({c.pct})</td>
                  <td className={`${tdClass} text-right text-emerald-400`}>↑ {c.delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <PanelLink>View all cities</PanelLink>
        </Panel>
      </div>
    </div>
  );
}
