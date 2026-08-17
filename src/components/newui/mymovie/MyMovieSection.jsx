import { useEffect, useState } from 'react';
import MovieOverviewHeader from '../MovieOverviewHeader';
import OverviewTab from './OverviewTab';
import PerformanceTab from './PerformanceTab';
import TimelineTab from './TimelineTab';
import AssetsTab from './AssetsTab';
import ReportsTab from './ReportsTab';
import useMovieOverviewData from './useMovieOverviewData';
import { visibleTabsFor } from '../previewTabs';

const OTHER_TABS = {
  Performance: PerformanceTab,
  Timeline: TimelineTab,
  Assets: AssetsTab,
  Reports: ReportsTab,
};

const ALL_TABS = ['Overview', ...Object.keys(OTHER_TABS)];

export default function MyMovieSection({ selectedMovie, fullAccess }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const data = useMovieOverviewData(selectedMovie);
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
        dateRangeLabel={data.dateRangeLabel}
        tabs={visibleTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notificationCount={3}
      />
      {activeTab === 'Overview' ? <OverviewTab data={data} /> : <OtherTabComponent />}
    </>
  );
}
