import { useState } from 'react';
import { Youtube, Film, MessageSquare, Send, ThumbsUp, MessageCircle, Radio, Users, Plus, CheckSquare, Share2 } from 'lucide-react';
import { Panel, PanelLink } from '../shared/Panel';
import { CARD, thClass, tdClass, trClass } from '../theme';
import { teamCoordinationData } from './warRoomData';

const TASK_ICONS = { youtube: Youtube, clip: Film, x: MessageSquare, instagram: MessageSquare, user: Users };
const APPROVAL_ICONS = { youtube: Youtube, clip: Film, megaphone: MessageSquare, shield: Users };
const PRIORITY_TONE = { High: 'bg-red-500/15 text-red-400', Medium: 'bg-amber-500/15 text-amber-400', Low: 'bg-white/[0.06] text-white/50' };
const STATUS_TONE = { 'In Progress': 'bg-blue-500/15 text-blue-400', Completed: 'bg-emerald-500/15 text-emerald-400', 'To Do': 'bg-white/[0.06] text-white/50' };
const TASK_TABS = ['All Tasks', 'My Tasks', 'Completed'];
const WORKLOAD_TONE = { High: 'text-red-400 bg-red-400', Medium: 'text-amber-400 bg-amber-400', Low: 'text-blue-400 bg-blue-400' };

export default function TeamCoordinationTab() {
  const d = teamCoordinationData;
  const [taskTab, setTaskTab] = useState('All Tasks');

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Panel title="TEAM TASKS" info>
          <div className="flex items-center gap-1.5 mb-3 -mx-1">
            {TASK_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTaskTab(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium mx-1 transition-colors ${t === taskTab ? 'bg-blue-600/20 text-blue-400' : 'text-white/50 hover:bg-white/[0.04]'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Task</th>
                <th className={thClass}>Owner / Due</th>
                <th className={`${thClass} text-right`}>Priority / Status</th>
              </tr>
            </thead>
            <tbody>
              {d.tasks.map((t) => {
                const Icon = TASK_ICONS[t.icon];
                return (
                  <tr key={t.label} className={trClass}>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-white/40 shrink-0" />
                        <span className="truncate max-w-[120px]">{t.label}</span>
                      </div>
                    </td>
                    <td className={`${tdClass} text-white/50`}>
                      <div>{t.owner}</div>
                      <div className="text-[11px] text-white/30">{t.due}</div>
                    </td>
                    <td className={`${tdClass} text-right space-y-1`}>
                      <div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${PRIORITY_TONE[t.priority]}`}>{t.priority}</span>
                      </div>
                      <div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_TONE[t.status]}`}>{t.status}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        <Panel title="APPROVALS PENDING" info>
          <div className="space-y-3 flex-1">
            {d.approvals.map((a) => {
              const Icon = APPROVAL_ICONS[a.iconKey];
              return (
                <div key={a.title} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-white/60" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-white/80 truncate">{a.title}</div>
                      <div className="text-[11px] text-white/35">Requested by {a.requestedBy} · {a.time}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button className="px-2.5 py-1 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10 transition-colors">Reject</button>
                    <button className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs transition-colors">Approve</button>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="TEAM ACTIVITY" info>
          <div className="space-y-3.5 flex-1">
            {d.activity.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/[0.06] shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white/80">
                    <span className="font-medium">{a.name}</span> <span className="text-white/40">({a.team})</span>
                  </div>
                  <div className="text-[11px] text-white/45">{a.action}</div>
                </div>
                <span className="text-[11px] text-white/30 shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="SHARED NOTES" info>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">M</div>
            <input className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/50 placeholder:text-white/30" placeholder="Share an update or note with your team..." readOnly />
            <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors shrink-0">Post</button>
          </div>
          <div className="space-y-4 flex-1">
            {d.notes.map((n, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-white/[0.06] shrink-0" />
                  <span className="text-sm font-medium text-white/85">{n.name}</span>
                  <span className="text-[11px] text-white/30">{n.time}</span>
                </div>
                <p className="text-sm text-white/70 ml-8">{n.text}</p>
                <div className="flex items-center gap-4 ml-8 mt-1 text-[11px] text-white/35">
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {n.likes}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {n.comments}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="TEAM WORKLOAD" info>
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Team</th>
                <th className={`${thClass} text-right`}>Active Tasks</th>
                <th className={thClass}>Workload</th>
              </tr>
            </thead>
            <tbody>
              {d.workload.map((w) => {
                const [textTone, barTone] = WORKLOAD_TONE[w.level].split(' ');
                return (
                  <tr key={w.team} className={trClass}>
                    <td className={tdClass}>{w.team}</td>
                    <td className={`${tdClass} text-right text-white/50`}>{w.active}</td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className={`h-full rounded-full ${barTone}`} style={{ width: `${w.active * 20}%` }} />
                        </div>
                        <span className={`text-xs ${textTone}`}>{w.level}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      </div>

      <div className={`${CARD} p-5`}>
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white/90 tracking-wide">QUICK ACTIONS</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {['Broadcast Message', 'Update Team', 'Create Task', 'Request Approval', 'Share Note'].map((a) => (
            <button key={a} className="px-4 py-2.5 rounded-lg border border-white/10 text-sm text-white/75 hover:bg-white/[0.05] transition-colors">
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
