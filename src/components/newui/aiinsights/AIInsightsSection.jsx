import { useState } from 'react';
import SectionHeader from '../shared/SectionHeader';
import InvestmentAdvisorTab from './InvestmentAdvisorTab';

const TABS = {
  'Investment Advisor': InvestmentAdvisorTab,
};

export default function AIInsightsSection({ selectedMovie, userName }) {
  const [activeTab, setActiveTab] = useState('Investment Advisor');
  const TabComponent = TABS[activeTab];

  return (
    <>
      <SectionHeader
        title="AI Insights"
        subtitle="Model-backed answers to the big pre-production questions."
        hideDateCompareShare
        tabs={Object.keys(TABS)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <TabComponent selectedMovie={selectedMovie} userName={userName} />
    </>
  );
}
