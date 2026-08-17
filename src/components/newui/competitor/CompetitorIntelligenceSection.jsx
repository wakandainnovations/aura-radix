import { useEffect, useState } from 'react';
import SectionHeader from '../shared/SectionHeader';
import OverviewTab from './OverviewTab';
import CampaignsTab from './CampaignsTab';
import AudienceOverlapTab from './AudienceOverlapTab';
import ContentAnalysisTab from './ContentAnalysisTab';
import MarketPositionTab from './MarketPositionTab';
import { visibleTabsFor } from '../previewTabs';

const TABS = {
  Overview: OverviewTab,
  Campaigns: CampaignsTab,
  'Audience Overlap': AudienceOverlapTab,
  'Content Analysis': ContentAnalysisTab,
  'Market Position': MarketPositionTab,
};

export default function CompetitorIntelligenceSection({ fullAccess }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const TabComponent = TABS[activeTab];
  const visibleTabs = visibleTabsFor('competitor-intelligence', Object.keys(TABS), fullAccess);

  useEffect(() => {
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0]);
    }
  }, [visibleTabs, activeTab]);

  return (
    <>
      <SectionHeader
        title="Competitor Intelligence"
        subtitle="Track competitor campaigns, audience overlap and market positioning."
        showExport
        tabs={visibleTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <TabComponent />
    </>
  );
}
