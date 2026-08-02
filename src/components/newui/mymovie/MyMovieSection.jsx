import { useState } from 'react';
import MovieOverviewHeader from '../MovieOverviewHeader';
import OverviewTab from './OverviewTab';
import PerformanceTab from './PerformanceTab';
import TimelineTab from './TimelineTab';
import AssetsTab from './AssetsTab';
import ReportsTab from './ReportsTab';
import { dummyMovieOverview } from '../dummyMovieData';

const TABS = {
  Overview: OverviewTab,
  Performance: PerformanceTab,
  Timeline: TimelineTab,
  Assets: AssetsTab,
  Reports: ReportsTab,
};

export default function MyMovieSection() {
  const [activeTab, setActiveTab] = useState('Overview');
  const data = dummyMovieOverview;
  const TabComponent = TABS[activeTab];

  return (
    <>
      <MovieOverviewHeader
        title={data.title}
        status={data.status}
        releaseInDays={data.releaseInDays}
        dateRangeLabel={data.dateRangeLabel}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notificationCount={3}
      />
      <TabComponent />
    </>
  );
}
