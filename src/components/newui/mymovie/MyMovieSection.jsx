import { useEffect, useState } from 'react';
import MovieOverviewHeader from '../MovieOverviewHeader';
import OverviewTab from './OverviewTab';
import PerformanceTab from './PerformanceTab';
import TimelineTab from './TimelineTab';
import AssetsTab from './AssetsTab';
import ReportsTab from './ReportsTab';
import useMovieOverviewData from './useMovieOverviewData';
import { PREVIEW_SUBTABS } from '../previewTabs';

const OTHER_TABS = {
  Performance: PerformanceTab,
  Timeline: TimelineTab,
  Assets: AssetsTab,
  Reports: ReportsTab,
};

const HIDDEN_TABS = PREVIEW_SUBTABS['my-movie'];

export default function MyMovieSection({ selectedMovie, showPreviewTabs }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const data = useMovieOverviewData(selectedMovie);
  const OtherTabComponent = OTHER_TABS[activeTab];
  const visibleTabs = ['Overview', ...Object.keys(OTHER_TABS)].filter(
    (tab) => showPreviewTabs || !HIDDEN_TABS.includes(tab),
  );

  useEffect(() => {
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab('Overview');
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
