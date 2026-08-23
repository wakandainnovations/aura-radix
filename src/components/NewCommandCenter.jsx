import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import NewUISidebar from './newui/NewUISidebar';
import PreviewTabsToggle from './newui/PreviewTabsToggle';
import CommandCenterSection from './newui/commandcenter/CommandCenterSection';
import MyMovieSection from './newui/mymovie/MyMovieSection';
import AudienceIntelligenceSection from './newui/audience/AudienceIntelligenceSection';
import CompetitorIntelligenceSection from './newui/competitor/CompetitorIntelligenceSection';
import CampaignPlannerSection from './newui/campaign/CampaignPlannerSection';
import WarRoomSection from './newui/warroom/WarRoomSection';
import AIProducerSection from './newui/aiproducer/AIProducerSection';
import { dummyMovieOverview } from './newui/dummyMovieData';
import { PAGE_BG } from './newui/theme';
import { DEMO_HIDDEN_NAV_KEYS } from './newui/previewTabs';
import { entityService } from '../api/entityService';
import { authService } from '../api/authService';
import { useLicense } from '../hooks/useLicense';
import { useAuth } from '../hooks/useAuth';
import { usePreviewTabsToggle } from '../hooks/usePreviewTabsToggle';
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
  const [activeSection, setActiveSection] = useState('command-center');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const { isAdmin, viewAsUserId, refresh: refreshLicense } = useLicense();
  const { username, setIsAuthenticated, setUsername } = useAuth();
  const [fullAccessOn, setFullAccessOn] = usePreviewTabsToggle();

  // AI Copilot chat history lives here (not inside AIProducerSection) so it
  // survives switching nav sections and only resets on logout (this
  // component unmounts) or when the selected movie changes.
  const [aiChatMessages, setAiChatMessages] = useState([]);
  const [aiChatConversationId, setAiChatConversationId] = useState(null);

  // Non-admins always get the demo-restricted view; admins get it too unless
  // they've flipped the toggle on.
  const fullAccess = isAdmin && fullAccessOn;
  const hiddenNavKeys = fullAccess ? [] : DEMO_HIDDEN_NAV_KEYS;

  // If the active section just got hidden (toggle flipped off, or admin
  // status changed), fall back to a section that's always visible.
  useEffect(() => {
    if (hiddenNavKeys.includes(activeSection)) {
      setActiveSection('command-center');
    }
  }, [hiddenNavKeys, activeSection]);

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

  // Start a fresh AI Copilot conversation whenever the movie in focus changes.
  useEffect(() => {
    setAiChatMessages([]);
    setAiChatConversationId(null);
  }, [activeMovie?.id]);

  const data = dummyMovieOverview;
  const releaseInDays = daysUntilRelease(activeMovie?.releaseDate) ?? data.releaseInDays;
  const SectionComponent = SECTIONS[activeSection] ?? CommandCenterSection;

  return (
    <div className={`h-screen flex ${PAGE_BG} text-white overflow-hidden`}>
      {isAdmin && <PreviewTabsToggle fullAccess={fullAccessOn} onToggle={setFullAccessOn} />}

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
        hiddenNavKeys={hiddenNavKeys}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <SectionComponent
          selectedMovie={activeMovie}
          userName={username}
          onOpenWorkspace={() => setActiveSection('my-movie')}
          fullAccess={fullAccess}
          chatMessages={aiChatMessages}
          onChatMessagesChange={setAiChatMessages}
          chatConversationId={aiChatConversationId}
          onChatConversationIdChange={setAiChatConversationId}
        />
      </div>
    </div>
  );
}
