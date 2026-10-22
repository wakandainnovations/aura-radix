import { useEffect, useState } from 'react';
import SectionHeader from '../shared/SectionHeader';
import OverviewTab from './OverviewTab';
import DemographicsTab from './DemographicsTab';
import GeographyTab from './GeographyTab';
import ThemesTab from './ThemesTab';
import { visibleTabsFor } from '../previewTabs';

const TABS = {
  Overview: OverviewTab,
  Demographics: DemographicsTab,
  Geography: GeographyTab,
  Themes: ThemesTab,
};

export default function AudienceIntelligenceSection({ fullAccess }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const TabComponent = TABS[activeTab];
  const visibleTabs = visibleTabsFor('audience-intelligence', Object.keys(TABS), fullAccess);

  useEffect(() => {
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0]);
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
        hideDateCompareShare
      />
      <TabComponent />
    </>
  );
}
