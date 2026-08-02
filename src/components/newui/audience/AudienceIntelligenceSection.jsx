import { useState } from 'react';
import SectionHeader from '../shared/SectionHeader';
import OverviewTab from './OverviewTab';
import DemographicsTab from './DemographicsTab';
import GeographyTab from './GeographyTab';
import ThemesTab from './ThemesTab';
import InfluencersTab from './InfluencersTab';
import ConversationsTab from './ConversationsTab';

const TABS = {
  Overview: OverviewTab,
  Demographics: DemographicsTab,
  Geography: GeographyTab,
  Themes: ThemesTab,
  Influencers: InfluencersTab,
  Conversations: ConversationsTab,
};

export default function AudienceIntelligenceSection() {
  const [activeTab, setActiveTab] = useState('Overview');
  const TabComponent = TABS[activeTab];

  return (
    <>
      <SectionHeader
        title="Audience Intelligence"
        subtitle="Understand your audience and what drives them."
        tabs={Object.keys(TABS)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <TabComponent />
    </>
  );
}
