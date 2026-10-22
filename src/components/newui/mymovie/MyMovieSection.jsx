import { useEffect, useState } from 'react';
import MovieOverviewHeader from '../MovieOverviewHeader';
import OverviewTab from './OverviewTab';
import PerformanceTab from './PerformanceTab';
import TimelineTab from './TimelineTab';
import AssetsTab from './AssetsTab';
import ReportsTab from './ReportsTab';
import InfluencersTab from '../audience/InfluencersTab';
import MentionsTab from '../audience/MentionsTab';
import useMovieOverviewData from './useMovieOverviewData';
import useMoviePerformanceData from './useMoviePerformanceData';
import { visibleTabsFor } from '../previewTabs';

// Influencers and Social Media Posts moved here from Audience Intelligence and
// Mentions; both take the selected movie.
const MOVIE_TABS = {
  Influencers: InfluencersTab,
  'Social Media Posts': MentionsTab,
};

const OTHER_TABS = {
  Timeline: TimelineTab,
  Assets: AssetsTab,
  Reports: ReportsTab,
};

const ALL_TABS = ['Overview', 'Performance', ...Object.keys(MOVIE_TABS), ...Object.keys(OTHER_TABS)];

export default function MyMovieSection({ selectedMovie, fullAccess }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const data = useMovieOverviewData(selectedMovie);
  const performanceData = useMoviePerformanceData(selectedMovie);
  const MovieTabComponent = MOVIE_TABS[activeTab];
  const OtherTabComponent = OTHER_TABS[activeTab];
  const visibleTabs = visibleTabsFor('my-movie', ALL_TABS, fullAccess);

  useEffect(() => {
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0]);
    }
  }, [visibleTabs, activeTab]);

  return (
    <>
      <MovieOverviewHeader
        title={data.title}
        status={data.status}
        releaseInDays={data.releaseInDays}
        tabs={visibleTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      {activeTab === 'Overview' ? (
        <OverviewTab data={data} />
      ) : activeTab === 'Performance' ? (
        <PerformanceTab
          data={performanceData}
          entityId={selectedMovie?.id}
          isTrendLoading={performanceData.isTrendLoading}
          isPlatformLoading={performanceData.isPlatformLoading}
          isRegionsLoading={performanceData.isRegionsLoading}
          isTopDriversLoading={performanceData.isTopDriversLoading}
        />
      ) : MovieTabComponent ? (
        <MovieTabComponent selectedMovie={selectedMovie} />
      ) : (
        <OtherTabComponent />
      )}
    </>
  );
}
