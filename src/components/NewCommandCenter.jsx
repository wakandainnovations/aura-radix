import { useState } from 'react';
import NewUISidebar from './newui/NewUISidebar';
import MyMovieSection from './newui/mymovie/MyMovieSection';
import AudienceIntelligenceSection from './newui/audience/AudienceIntelligenceSection';
import CompetitorIntelligenceSection from './newui/competitor/CompetitorIntelligenceSection';
import CampaignPlannerSection from './newui/campaign/CampaignPlannerSection';
import WarRoomSection from './newui/warroom/WarRoomSection';
import AIProducerSection from './newui/aiproducer/AIProducerSection';
import { dummyMovieOverview } from './newui/dummyMovieData';
import { PAGE_BG } from './newui/theme';

const SECTIONS = {
  'command-center': MyMovieSection,
  'my-movie': MyMovieSection,
  'audience-intelligence': AudienceIntelligenceSection,
  'competitor-intelligence': CompetitorIntelligenceSection,
  'campaign-planner': CampaignPlannerSection,
  'war-room': WarRoomSection,
  'ai-producer': AIProducerSection,
};

// New UI preview, built from the provided design mocks. Every section runs
// on static dummy data (see each section's *Data.js) — no entity/movie
// selection exists in this shell yet, so nothing here is wired to the real
// dashboardService/analyticsService APIs. That's the natural next step once
// the visual design is signed off.
export default function NewCommandCenter() {
  const [activeSection, setActiveSection] = useState('my-movie');
  const data = dummyMovieOverview;
  const SectionComponent = SECTIONS[activeSection] ?? MyMovieSection;

  return (
    <div className={`h-screen flex ${PAGE_BG} text-white overflow-hidden`}>
      <NewUISidebar
        activeItem={activeSection}
        onSelect={setActiveSection}
        movieTitle={data.title}
        releaseInDays={data.releaseInDays}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <SectionComponent />
      </div>
    </div>
  );
}
