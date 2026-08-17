import { useEffect, useState } from 'react';
import SectionHeader from '../shared/SectionHeader';
import OverviewTab from './OverviewTab';
import LiveMonitoringTab from './LiveMonitoringTab';
import CrisisManagementTab from './CrisisManagementTab';
import PlatformWatchTab from './PlatformWatchTab';
import TeamCoordinationTab from './TeamCoordinationTab';
import DecisionLogTab from './DecisionLogTab';
import { PREVIEW_SUBTABS } from '../previewTabs';

const TABS = {
  Overview: OverviewTab,
  'Live Monitoring': LiveMonitoringTab,
  'Crisis Management': CrisisManagementTab,
  'Platform Watch': PlatformWatchTab,
  'Team Coordination': TeamCoordinationTab,
  'Decision Log': DecisionLogTab,
};

const HIDDEN_TABS = PREVIEW_SUBTABS['war-room'];

function AutoRefreshBadge() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-white/40 shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      Auto Refresh: Every 60s
    </div>
  );
}

export default function WarRoomSection({ showPreviewTabs }) {
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
        title="War Room"
        subtitle="Real-time command center for your movie launch."
        livePill
        showExport
        tabs={visibleTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="px-8 pt-2 flex justify-end">
        <AutoRefreshBadge />
      </div>
      <TabComponent />
    </>
  );
}
