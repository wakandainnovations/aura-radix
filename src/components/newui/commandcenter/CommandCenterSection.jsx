import { HeartPulse, MonitorPlay, Smile, Users, Radio } from 'lucide-react';
import CommandCenterHeader from './CommandCenterHeader';
import AISummaryPanel from './AISummaryPanel';
import TodaysHighlights from './TodaysHighlights';
import RecommendedActions from './RecommendedActions';
import CompetitorWatchPanel from './CompetitorWatchPanel';
import AudiencePulsePanel from './AudiencePulsePanel';
import CampaignTimelinePanel from './CampaignTimelinePanel';
import MovieSnapshotPanel from './MovieSnapshotPanel';
import AskFramehouseBar from './AskFramehouseBar';
import StatCard from '../shared/StatCard';
import useCommandCenterData from './useCommandCenterData';

const STAT_ICONS = { health: HeartPulse, buzz: MonitorPlay, sentiment: Smile, reach: Users, awareness: Radio };

export default function CommandCenterSection({ selectedMovie, userName, onOpenWorkspace }) {
  const data = useCommandCenterData(selectedMovie);

  function handleAsk() {
    // UI preview only — no backend wired up for Q&A yet, matching AI Producer's chat.
  }

  return (
    <>
      <CommandCenterHeader
        userName={userName}
        title={data.title}
        releaseInDays={data.releaseInDays}
        status={data.campaignStatus}
      />

      <div className="p-6 grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4 items-start">
        <div className="space-y-4 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-stretch">
            <AISummaryPanel summary={data.aiSummary} isLoading={data.isAiSummaryLoading} />
            <TodaysHighlights
              highlights={data.highlights}
              updatedLabel={data.aiSummary.updatedLabel}
              isLoading={data.isHighlightsLoading}
            />
          </div>

          <RecommendedActions actions={data.recommendedActions} />

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {data.stats.map((s) => (
              <StatCard
                key={s.key}
                icon={STAT_ICONS[s.key]}
                iconHue={s.hue}
                label={s.label}
                value={s.value}
                suffix={s.suffix}
                caption={s.caption}
                sparkline={s.spark}
                sparklineColor={s.sparklineColor}
                barPct={s.barPct}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            <CompetitorWatchPanel competitors={data.competitorWatch} />
            <AudiencePulsePanel pulse={data.audiencePulse} />
          </div>

          <CampaignTimelinePanel steps={data.campaignTimeline} />
        </div>

        <MovieSnapshotPanel
          title={data.title}
          poster={data.poster}
          snapshot={data.snapshot}
          onOpenWorkspace={onOpenWorkspace}
        />
      </div>

      <div className="px-6 pb-6">
        <AskFramehouseBar
          movieTitle={data.title}
          suggestions={data.askSuggestions.map((s) => s.replace('{title}', data.title))}
          onAsk={handleAsk}
        />
      </div>
    </>
  );
}
