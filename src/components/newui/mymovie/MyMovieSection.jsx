import { useState } from 'react';
import MovieOverviewHeader from '../MovieOverviewHeader';
import OverviewTab from './OverviewTab';
import PerformanceTab from './PerformanceTab';
import TimelineTab from './TimelineTab';
import AssetsTab from './AssetsTab';
import ReportsTab from './ReportsTab';
import useMovieOverviewData from './useMovieOverviewData';

const OTHER_TABS = {
  Performance: PerformanceTab,
  Timeline: TimelineTab,
  Assets: AssetsTab,
  Reports: ReportsTab,
};

export default function MyMovieSection({ selectedMovie }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const data = useMovieOverviewData(selectedMovie);
  const OtherTabComponent = OTHER_TABS[activeTab];

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
      {activeTab === 'Overview' ? <OverviewTab data={data} /> : <OtherTabComponent />}
    </>
  );
}
