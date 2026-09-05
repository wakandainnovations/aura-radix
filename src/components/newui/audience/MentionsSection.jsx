import { useState } from 'react';
import SectionHeader from '../shared/SectionHeader';
import MentionsTab from './MentionsTab';

// "Social Media Posts" is the only source today; a future "News Articles" (or
// similar) source can be added as another tab here alongside it.
const TABS = {
  'Social Media Posts': MentionsTab,
};

export default function MentionsSection({ selectedMovie }) {
  const [activeTab, setActiveTab] = useState('Social Media Posts');
  const TabComponent = TABS[activeTab];

  return (
    <>
      <SectionHeader
        title="Mentions"
        subtitle="What's being said about your movie, across sources, and what's driving it."
        tabs={Object.keys(TABS)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hideDateCompareShare
      />
      <TabComponent selectedMovie={selectedMovie} />
    </>
  );
}
