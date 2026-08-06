import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import NewUISidebar from './newui/NewUISidebar';
import CommandCenterSection from './newui/commandcenter/CommandCenterSection';
import MyMovieSection from './newui/mymovie/MyMovieSection';
import AudienceIntelligenceSection from './newui/audience/AudienceIntelligenceSection';
import CompetitorIntelligenceSection from './newui/competitor/CompetitorIntelligenceSection';
import CampaignPlannerSection from './newui/campaign/CampaignPlannerSection';
import WarRoomSection from './newui/warroom/WarRoomSection';
import AIProducerSection from './newui/aiproducer/AIProducerSection';
import { dummyMovieOverview } from './newui/dummyMovieData';
import { PAGE_BG } from './newui/theme';
import { entityService } from '../api/entityService';
import { authService } from '../api/authService';
import { useLicense } from '../hooks/useLicense';
import { useAuth } from '../hooks/useAuth';
import { daysUntilRelease } from './newui/dateUtils';

const SECTIONS = {
  'command-center': CommandCenterSection,
  'my-movie': MyMovieSection,
  'audience-intelligence': AudienceIntelligenceSection,
  'competitor-intelligence': CompetitorIntelligenceSection,
  'campaign-planner': CampaignPlannerSection,
  'war-room': WarRoomSection,
  'ai-producer': AIProducerSection,
};

// New UI preview, built from the provided design mocks. Section content
// still runs on static dummy data (see each section's *Data.js) — only the
// "Switch Movie" picker is wired to the real entity list so far. That's the
// natural next step once the visual design is signed off: thread the
// selected movie into each section instead of the dummy dataset.
export default function NewCommandCenter() {
  const [activeSection, setActiveSection] = useState('my-movie');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const { viewAsUserId, refresh: refreshLicense } = useLicense();
  const { username, setIsAuthenticated, setUsername } = useAuth();

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUsername(null);
    // Re-probes admin/license status now that the token is gone, which flips
    // isAdmin to false and lets App.jsx fall back to the classic UI.
    refreshLicense();
  };

  const { data: movies = [] } = useQuery({
    queryKey: ['entities', 'movie', viewAsUserId ?? 'self'],
    queryFn: () => entityService.getAll('movie', { ownerId: viewAsUserId ?? undefined }),
  });

  // Default to the first movie entity once the list loads, without
  // clobbering a choice the user already made from the switcher.
  const activeMovie = selectedMovie ?? movies[0] ?? null;

  const data = dummyMovieOverview;
  const releaseInDays = daysUntilRelease(activeMovie?.releaseDate) ?? data.releaseInDays;
  const SectionComponent = SECTIONS[activeSection] ?? MyMovieSection;

  return (
    <div className={`h-screen flex ${PAGE_BG} text-white overflow-hidden`}>
      <NewUISidebar
        activeItem={activeSection}
        onSelect={setActiveSection}
        movieTitle={data.title}
        releaseInDays={releaseInDays}
        movies={movies}
        selectedMovie={activeMovie}
        onSelectMovie={setSelectedMovie}
        userName={username}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <SectionComponent
          selectedMovie={activeMovie}
          userName={username}
          onOpenWorkspace={() => setActiveSection('my-movie')}
        />
      </div>
    </div>
  );
}
