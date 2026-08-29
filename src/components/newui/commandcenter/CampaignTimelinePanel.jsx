import { useMemo, useState } from 'react';
import { Check, Play, Circle, Plus, Pencil } from 'lucide-react';
import { Panel, PanelLink } from '../shared/Panel';
import AddCheckpointModal from './AddCheckpointModal';
import EditCheckpointModal from './EditCheckpointModal';
import CheckpointCalendarModal from './CheckpointCalendarModal';
import { STAGE_LABEL_TOOLTIP } from './checkpointStageTooltips';
import InfoTooltip from '../shared/InfoTooltip';

const STEP_STYLE = {
  done: { ring: 'border-emerald-400 text-emerald-400', line: 'bg-emerald-400', label: 'text-white/70' },
  current: { ring: 'border-blue-400 text-blue-400 bg-blue-500/15', line: 'bg-white/10', label: 'text-blue-400' },
  upcoming: { ring: 'border-white/15 text-white/25', line: 'bg-white/10', label: 'text-white/40' },
};

const IMPACT_TONE_CLASS = { good: 'text-emerald-400', bad: 'text-red-400', neutral: 'text-white/35' };

function StepIcon({ status }) {
  if (status === 'done') return <Check className="w-4 h-4" />;
  if (status === 'current') return <Play className="w-3.5 h-3.5 fill-current" />;
  return <Circle className="w-2.5 h-2.5 fill-current" />;
}

export default function CampaignTimelinePanel({ steps, checkpoints = [], entityId }) {
  const [addOpen, setAddOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [editCheckpoint, setEditCheckpoint] = useState(null);

  const checkpointsById = useMemo(() => new Map(checkpoints.map((c) => [String(c.id), c])), [checkpoints]);

  return (
    <Panel
      title="CAMPAIGN TIMELINE"
      className="min-w-0"
      control={<PanelLink className="mt-0" onClick={() => setCalendarOpen(true)}>View calendar</PanelLink>}
    >
      <div className="flex-1 overflow-x-auto mt-4">
        <div className="flex items-start min-w-max">
          {steps.map((step, i) => {
            const style = STEP_STYLE[step.status];
            return (
              <div key={step.key} className="flex items-start">
                <div className="flex flex-col items-center gap-1.5 w-16 shrink-0 group">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${style.ring} ${step.isDefault ? 'border-dashed' : ''}`}
                    title={step.isDefault ? 'Default lifecycle-stage checkpoint' : undefined}
                  >
                    <StepIcon status={step.status} />
                  </div>
                  <div className="text-center">
                    <InfoTooltip content={STAGE_LABEL_TOOLTIP[step.stage]}>
                      <div
                        className={`text-[11px] font-medium leading-tight ${style.label} ${
                          STAGE_LABEL_TOOLTIP[step.stage]
                            ? 'cursor-help underline decoration-dotted decoration-white/30 underline-offset-2'
                            : ''
                        }`}
                      >
                        {step.label}
                      </div>
                    </InfoTooltip>
                    <div className="flex items-center justify-center gap-1">
                      <div className="text-[10px] text-white/30 leading-tight">{step.date}</div>
                      {entityId != null && (
                        <button
                          onClick={() => setEditCheckpoint(checkpointsById.get(step.key) ?? null)}
                          className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-blue-400 transition-opacity"
                          title="Edit checkpoint date"
                        >
                          <Pencil className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                    {step.impact && (
                      <div
                        className={`text-[10px] font-semibold leading-tight mt-0.5 ${IMPACT_TONE_CLASS[step.impact.tone]}`}
                        title="Mentions in the 7 days after this checkpoint vs. the 7 days before it"
                      >
                        {step.impact.text}
                      </div>
                    )}
                  </div>
                </div>
                {i < steps.length - 1 && <div className={`h-0.5 w-4 mt-4 ${style.line}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {entityId != null && (
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors self-start mt-3"
        >
          <Plus className="w-3.5 h-3.5" />
          Add checkpoint
        </button>
      )}

      <CheckpointCalendarModal
        open={calendarOpen}
        onOpenChange={setCalendarOpen}
        checkpoints={checkpoints}
        entityId={entityId}
      />
      {entityId != null && (
        <>
          <AddCheckpointModal open={addOpen} onOpenChange={setAddOpen} entityId={entityId} />
          <EditCheckpointModal
            open={editCheckpoint != null}
            onOpenChange={(next) => !next && setEditCheckpoint(null)}
            entityId={entityId}
            checkpoint={editCheckpoint}
          />
        </>
      )}
    </Panel>
  );
}
