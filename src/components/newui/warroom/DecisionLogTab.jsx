import { Search, Calendar, ChevronDown, Plus, CheckSquare, Share2, Download } from 'lucide-react';
import { Panel } from '../shared/Panel';
import StatCard from '../shared/StatCard';
import { CARD, thClass, tdClass, trClass } from '../theme';
import { decisionLogData } from './warRoomData';

const RESULT_TONE = { Positive: 'bg-emerald-500/15 text-emerald-400', 'In Progress': 'bg-blue-500/15 text-blue-400', 'Pending Results': 'bg-white/[0.06] text-white/50' };

export default function DecisionLogTab() {
  const d = decisionLogData;

  return (
    <div className="p-6 space-y-4">
      <Panel
        title="DECISION LOG"
        info
        description="Track all key decisions, actions, and their impact in real time."
        control={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/70">
              <Calendar className="w-3.5 h-3.5" />
              May 15, 2025
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/70">
              All Decisions
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/40">
              <Search className="w-3.5 h-3.5" />
              Search decisions...
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Time</th>
                <th className={thClass}>Decision</th>
                <th className={thClass}>Why AI Suggested</th>
                <th className={thClass}>Approved By</th>
                <th className={`${thClass} text-right`}>Impact</th>
                <th className={thClass}>Result</th>
              </tr>
            </thead>
            <tbody>
              {d.decisions.map((dec) => (
                <tr key={dec.title} className={trClass}>
                  <td className={`${tdClass} text-white/50 whitespace-nowrap`}>{dec.time}</td>
                  <td className={tdClass}>
                    <div className="text-white/85">{dec.title}</div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40">{dec.tag}</span>
                  </td>
                  <td className={`${tdClass} text-white/50 max-w-[220px]`}>{dec.why}</td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/[0.06] shrink-0" />
                      <div>
                        <div className="text-white/70">{dec.approver}</div>
                        <div className="text-[11px] text-white/35">{dec.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <div className="text-white/70">{dec.impactLabel} <span className="text-emerald-400">{dec.impactValue}</span></div>
                    <div className="text-[11px] text-white/35">{dec.metricLabel} <span className="text-emerald-400">{dec.metricValue}</span></div>
                  </td>
                  <td className={tdClass}>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${RESULT_TONE[dec.result]}`}>{dec.result}</span>
                    <div className="text-[10px] text-white/30 mt-0.5">{dec.resultTime}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="IMPACT SUMMARY (TODAY)" info>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total Decisions" value={d.summary.total} />
          <StatCard label="Positive Impact" value={d.summary.positive} deltaTone="good" />
          <StatCard label="In Progress" value={d.summary.inProgress} />
          <StatCard label="Pending Results" value={d.summary.pending} />
          <StatCard label="Avg. Impact Score" value={d.summary.avgImpact} suffix="/100" />
          <StatCard label="Overall Sentiment Change" value={d.summary.sentimentChange} deltaTone="good" />
        </div>
      </Panel>

      <div className={`${CARD} p-5`}>
        <h3 className="text-sm font-semibold text-white/90 tracking-wide mb-3">QUICK ACTIONS</h3>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-sm text-white/75 hover:bg-white/[0.05] transition-colors">
            <Plus className="w-4 h-4" /> Add Decision
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-sm text-white/75 hover:bg-white/[0.05] transition-colors">
            <CheckSquare className="w-4 h-4" /> Mark as Reviewed
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-sm text-white/75 hover:bg-white/[0.05] transition-colors">
            <Share2 className="w-4 h-4" /> Share Log
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-sm text-white/75 hover:bg-white/[0.05] transition-colors">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>
    </div>
  );
}
