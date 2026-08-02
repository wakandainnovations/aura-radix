import { useState } from 'react';
import SectionHeader from '../shared/SectionHeader';
import OverviewTab from './OverviewTab';
import CampaignsTab from './CampaignsTab';
import AudienceOverlapTab from './AudienceOverlapTab';
import ContentAnalysisTab from './ContentAnalysisTab';
import MarketPositionTab from './MarketPositionTab';

const TABS = {
  Overview: OverviewTab,
  Campaigns: CampaignsTab,
  'Audience Overlap': AudienceOverlapTab,
  'Content Analysis': ContentAnalysisTab,
  'Market Position': MarketPositionTab,
};

export default function CompetitorIntelligenceSection() {
  const [activeTab, setActiveTab] = useState('Overview');
  const TabComponent = TABS[activeTab];

  return (
    <>
      <SectionHeader
        title="Competitor Intelligence"
        subtitle="Track competitor campaigns, audience overlap and market positioning."
        showExport
        tabs={Object.keys(TABS)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <TabComponent />
    </>
  );
}
