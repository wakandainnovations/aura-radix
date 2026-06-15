import React, { useState } from 'react';
import { LayoutDashboard, BarChart3, AlertTriangle, Boxes, Users, Flag, Wrench, Briefcase, FileText, ChevronDown, ChevronRight, Lock, UserCircle, ShieldCheck } from 'lucide-react';
import { useLicense } from '../../contexts/LicenseContext';
import { FEATURE_KEYS } from '../../lib/licensing';

// Maps a nav item id to the premium feature it unlocks. Items without an entry are
// always available. Used to render lock badges on features the user isn't entitled to.
const NAV_FEATURE = {
  checkpoints: FEATURE_KEYS.CHECKPOINTS,
  'entity-report': FEATURE_KEYS.INTELLIGENCE_REPORT,
  'crisis-management': FEATURE_KEYS.CRISIS,
  'user-intelligence': FEATURE_KEYS.AUDIENCE_CONTENT,
  'spreader-analysis': FEATURE_KEYS.AUDIENCE_CONTENT,
  'content-analysis': FEATURE_KEYS.AUDIENCE_CONTENT,
  'genre-intelligence': FEATURE_KEYS.AUDIENCE_CONTENT,
  'marketing-aggregation': FEATURE_KEYS.AGGREGATED_INTEL,
};

export default function LeftNavbar({ activeTab, onTabChange, isAdmin = false }) {
  const { hasFeature, featureByKey } = useLicense();
  const [expandedMenu, setExpandedMenu] = useState({
    'ai-insights': true,
    'audience-content': true,
    tools: true,
    crisis: true,
    workspace: true,
    account: true,
    administration: true,
  });

  // Returns the required tier label for a locked nav item, or null when unlocked.
  const lockTier = (id) => {
    const key = NAV_FEATURE[id];
    if (!key || hasFeature(key)) return null;
    return featureByKey(key)?.requiredTier || 'upgrade';
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'entity-management', label: 'Manage Entities', icon: Boxes },
    { id: 'checkpoints', label: 'Checkpoints', icon: Flag },
    { id: 'entity-report', label: 'Intelligence Report', icon: FileText },
    {
      id: 'ai-insights',
      label: 'AI Insights',
      icon: BarChart3,
      adminOnly: true, // In-development; visible only to the admin account
      subTabs: [
        { id: 'ai-analytics', label: 'AI Analytics' },
      ]
    },
    {
      id: 'audience-content',
      label: 'Audience & Content',
      icon: Users,
      subTabs: [
        { id: 'user-intelligence', label: 'User Intel' },
        { id: 'spreader-analysis', label: 'Spreader Analysis' },
        { id: 'content-analysis', label: 'Content Analysis' },
        { id: 'genre-intelligence', label: 'Genre Intelligence' },
      ]
    },
    {
      id: 'crisis',
      label: 'Crisis Management',
      icon: AlertTriangle,
      subTabs: [
        { id: 'alert-management', label: 'Alert Management' },
        { id: 'alert-rules', label: 'Alert Rules' },
        { id: 'crisis-center', label: 'Crisis Feed' },
        { id: 'crisis-management', label: 'Crisis Response' },
      ]
    },
    {
      id: 'workspace',
      label: 'Workspace',
      icon: Briefcase,
      subTabs: [
        { id: 'reply-templates', label: 'Reply Templates' },
        { id: 'crisis-playbooks', label: 'Crisis Playbooks' },
        { id: 'abuse-reports', label: 'Abuse Reports' },
        { id: 'workspace-export', label: 'Backup & Restore' },
      ]
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: Wrench,
      subTabs: [
        { id: 'marketing-aggregation', label: 'Aggregated Intel' },
      ]
    },
    {
      id: 'administration',
      label: 'Administration',
      icon: ShieldCheck,
      adminOnly: true,
      subTabs: [
        { id: 'admin-licenses', label: 'Licenses' },
        { id: 'admin-offer-keys', label: 'Offer Keys' },
        { id: 'admin-prices', label: 'Tier Prices' },
      ]
    },
    {
      id: 'account',
      label: 'Account',
      icon: UserCircle,
      subTabs: [
        { id: 'license', label: 'License' },
      ]
    }
  ];

  // Small "locked" pill shown next to gated items the user can't access.
  const LockBadge = ({ tier }) => (
    <span
      className="ml-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/15 text-amber-500"
      title={`Requires ${tier}`}
    >
      <Lock className="w-3 h-3" />
      {tier}
    </span>
  );

  const toggleMenu = (menuId) => {
    setExpandedMenu(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  return (
    <div className="h-full bg-card border-r border-border flex flex-col">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Aura</h2>
      </div>
      
      <nav className="flex-1 p-2 overflow-y-auto">
        {tabs.filter(tab => !tab.adminOnly || isAdmin).map(tab => {
          const Icon = tab.icon;
          const hasSubTabs = tab.subTabs && tab.subTabs.length > 0;
          const isExpanded = expandedMenu[tab.id];
          const isActive = activeTab === tab.id || (hasSubTabs && tab.subTabs.some(sub => sub.id === activeTab));
          
          return (
            <div key={tab.id} className="mb-1">
              <button
                onClick={() => {
                  if (hasSubTabs) {
                    toggleMenu(tab.id);
                    if (!isExpanded && tab.subTabs.length > 0) {
                      onTabChange(tab.subTabs[0].id);
                    }
                  } else {
                    onTabChange(tab.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm flex-1 text-left">{tab.label}</span>
                {!hasSubTabs && lockTier(tab.id) && <LockBadge tier={lockTier(tab.id)} />}
                {hasSubTabs && (
                  isExpanded ?
                    <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform" /> :
                    <ChevronRight className="w-4 h-4 flex-shrink-0 transition-transform" />
                )}
              </button>
              
              {/* Sub-tabs */}
              {hasSubTabs && isExpanded && (
                <div className="ml-2 mt-1 mb-1 space-y-0.5 border-l border-border pl-0">
                  {tab.subTabs.map(subTab => {
                    const isSubActive = activeTab === subTab.id;
                    return (
                      <button
                        key={subTab.id}
                        onClick={() => onTabChange(subTab.id)}
                        className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-150 text-xs font-medium ${
                          isSubActive
                            ? 'bg-primary/20 text-primary'
                            : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                        }`}
                      >
                        <span className="flex-1 text-left">{subTab.label}</span>
                        {lockTier(subTab.id) && <LockBadge tier={lockTier(subTab.id)} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
