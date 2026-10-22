import { useState } from 'react';
import SectionHeader from '../shared/SectionHeader';
import InvestmentAdvisorTab from './InvestmentAdvisorTab';

const TABS = {
  'AI Insights': InvestmentAdvisorTab,
};

export default function AIInsightsSection({ selectedMovie, userName }) {
  const [activeTab, setActiveTab] = useState('AI Insights');
  const TabComponent = TABS[activeTab];

  return (
    <>
      <SectionHeader
        title="Investment Advisor"
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
