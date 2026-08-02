import { useState } from 'react';
import { Plus } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import OverviewTab from './OverviewTab';
import CampaignsTab from './CampaignsTab';
import CalendarTab from './CalendarTab';
import BudgetingTab from './BudgetingTab';
import CreativePlanTab from './CreativePlanTab';
import DistributionPlanTab from './DistributionPlanTab';

const TABS = {
  Overview: OverviewTab,
  Campaigns: CampaignsTab,
  Calendar: CalendarTab,
  Budgeting: BudgetingTab,
  'Creative Plan': CreativePlanTab,
  'Distribution Plan': DistributionPlanTab,
};

function NewCampaignButton() {
  return (
    <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
      <Plus className="w-4 h-4" />
      New Campaign
    </button>
  );
}

export default function CampaignPlannerSection() {
  const [activeTab, setActiveTab] = useState('Overview');
  const TabComponent = TABS[activeTab];

  return (
    <>
      <SectionHeader
        title="Campaign Planner"
        subtitle="Plan, organize, and optimize your movie marketing campaigns."
        showExport
        actionButton={<NewCampaignButton />}
        tabs={Object.keys(TABS)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <TabComponent />
    </>
  );
}
