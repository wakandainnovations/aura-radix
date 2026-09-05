import { useState } from 'react';
import SectionHeader from '../shared/SectionHeader';
import ConversationsTab from './ConversationsTab';

const TABS = {
  'Social Media Posts': ConversationsTab,
};

export default function ConversationsSection({ selectedMovie }) {
  const [activeTab, setActiveTab] = useState('Social Media Posts');
  const TabComponent = TABS[activeTab];

  return (
    <>
      <SectionHeader
        title="Conversations"
        subtitle="Real conversations about your movie and what's driving them."
        tabs={Object.keys(TABS)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hideDateCompareShare
      />
      <TabComponent selectedMovie={selectedMovie} />
    </>
  );
}
