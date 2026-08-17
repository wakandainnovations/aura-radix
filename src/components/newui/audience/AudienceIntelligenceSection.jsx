import { useEffect, useState } from 'react';
import SectionHeader from '../shared/SectionHeader';
import OverviewTab from './OverviewTab';
import DemographicsTab from './DemographicsTab';
import GeographyTab from './GeographyTab';
import ThemesTab from './ThemesTab';
import InfluencersTab from './InfluencersTab';
import ConversationsTab from './ConversationsTab';
import { PREVIEW_SUBTABS } from '../previewTabs';

const TABS = {
  Overview: OverviewTab,
  Demographics: DemographicsTab,
  Geography: GeographyTab,
  Themes: ThemesTab,
  Influencers: InfluencersTab,
  Conversations: ConversationsTab,
};

const HIDDEN_TABS = PREVIEW_SUBTABS['audience-intelligence'];

export default function AudienceIntelligenceSection({ showPreviewTabs }) {
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
        title="Audience Intelligence"
        subtitle="Understand your audience and what drives them."
        tabs={visibleTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <TabComponent />
    </>
  );
}
