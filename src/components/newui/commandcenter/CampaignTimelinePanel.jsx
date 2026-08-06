import { Check, Play, Circle } from 'lucide-react';
import { Panel, PanelLink } from '../shared/Panel';

const STEP_STYLE = {
  done: { ring: 'border-emerald-400 text-emerald-400', line: 'bg-emerald-400', label: 'text-white/70' },
  current: { ring: 'border-blue-400 text-blue-400 bg-blue-500/15', line: 'bg-white/10', label: 'text-blue-400' },
  upcoming: { ring: 'border-white/15 text-white/25', line: 'bg-white/10', label: 'text-white/40' },
};

function StepIcon({ status }) {
  if (status === 'done') return <Check className="w-4 h-4" />;
  if (status === 'current') return <Play className="w-3.5 h-3.5 fill-current" />;
  return <Circle className="w-2.5 h-2.5 fill-current" />;
}

export default function CampaignTimelinePanel({ steps }) {
  return (
    <Panel title="CAMPAIGN TIMELINE" className="min-w-0" control={<PanelLink className="mt-0">View calendar</PanelLink>}>
      <div className="flex-1 overflow-x-auto mt-4">
        <div className="flex items-start min-w-max">
          {steps.map((step, i) => {
            const style = STEP_STYLE[step.status];
            return (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5 w-14 shrink-0">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${style.ring}`}>
                    <StepIcon status={step.status} />
                  </div>
                  <div className="text-center">
                    <div className={`text-[11px] font-medium leading-tight ${style.label}`}>{step.label}</div>
                    <div className="text-[10px] text-white/30 leading-tight">{step.date}</div>
                  </div>
                </div>
                {i < steps.length - 1 && <div className={`h-0.5 w-4 ${style.line}`} style={{ marginBottom: 24 }} />}
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
