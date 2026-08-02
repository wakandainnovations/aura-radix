import HealthScoreCard from '../HealthScoreCard';
import KPIScoreGrid from '../KPIScoreGrid';
import MoviePosterPanel from '../MoviePosterPanel';
import BuzzOverTimeChart from '../BuzzOverTimeChart';
import SentimentOverTimeChart from '../SentimentOverTimeChart';
import TopPositiveThemes from '../TopPositiveThemes';
import InsightCards from '../InsightCards';
import { dummyMovieOverview } from '../dummyMovieData';

export default function OverviewTab() {
  const data = dummyMovieOverview;
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 items-stretch">
        <div className="space-y-4">
          <HealthScoreCard healthScore={data.healthScore} />
          <KPIScoreGrid kpis={data.kpis} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <BuzzOverTimeChart buzzOverTime={data.buzzOverTime} />
            </div>
            <div className="lg:col-span-1">
              <SentimentOverTimeChart sentimentOverTime={data.sentimentOverTime} />
            </div>
            <div className="lg:col-span-1">
              <TopPositiveThemes themes={data.topPositiveThemes} />
            </div>
          </div>
        </div>

        <MoviePosterPanel title={data.title} poster={data.poster} />
      </div>

      <InsightCards insights={data.insights} />
    </div>
  );
}
