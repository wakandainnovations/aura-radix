import { useEffect, useState } from 'react';
import SectionHeader from '../shared/SectionHeader';
import OverviewTab from './OverviewTab';
import CampaignsTab from './CampaignsTab';
import AudienceOverlapTab from './AudienceOverlapTab';
import ContentAnalysisTab from './ContentAnalysisTab';
import MarketPositionTab from './MarketPositionTab';
import { PREVIEW_SUBTABS } from '../previewTabs';

const TABS = {
  Overview: OverviewTab,
  Campaigns: CampaignsTab,
  'Audience Overlap': AudienceOverlapTab,
  'Content Analysis': ContentAnalysisTab,
  'Market Position': MarketPositionTab,
};

const HIDDEN_TABS = PREVIEW_SUBTABS['competitor-intelligence'];

export default function CompetitorIntelligenceSection({ showPreviewTabs }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const TabComponent = TABS[activeTab];
  const visibleTabs = Object.keys(TABS).filter(
    (tab) => showPreviewTabs || !HIDDEN_TABS.includes(tab),
  );

  useEffect(() => {
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab('Overview');
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
