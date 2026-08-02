import { useState } from 'react';
import NewUISidebar from './newui/NewUISidebar';
import MovieOverviewHeader from './newui/MovieOverviewHeader';
import HealthScoreCard from './newui/HealthScoreCard';
import KPIScoreGrid from './newui/KPIScoreGrid';
import MoviePosterPanel from './newui/MoviePosterPanel';
import BuzzOverTimeChart from './newui/BuzzOverTimeChart';
import SentimentOverTimeChart from './newui/SentimentOverTimeChart';
import TopPositiveThemes from './newui/TopPositiveThemes';
import InsightCards from './newui/InsightCards';
import { dummyMovieOverview } from './newui/dummyMovieData';
import { PAGE_BG } from './newui/theme';

// New UI preview, built from the provided design. Wired to dummyMovieData for
// now — swap the data source for real entity/dashboard service data once the
// visual design is signed off. Only the Overview tab is implemented; the
// other tabs are placeholders.
export default function NewCommandCenter() {
  const [activeTab, setActiveTab] = useState('Overview');
  const data = dummyMovieOverview;

  return (
    <div className={`h-screen flex ${PAGE_BG} text-white overflow-hidden`}>
      <NewUISidebar
        activeItem="my-movie"
        movieTitle={data.title}
        releaseInDays={data.releaseInDays}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <MovieOverviewHeader
          title={data.title}
          status={data.status}
          releaseInDays={data.releaseInDays}
          dateRangeLabel={data.dateRangeLabel}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          notificationCount={3}
        />

        {activeTab === 'Overview' ? (
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
        ) : (
          <div className="flex-1 flex items-center justify-center py-24">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white/80 mb-2">{activeTab}</h2>
              <p className="text-sm text-white/40">This tab hasn't been designed yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
