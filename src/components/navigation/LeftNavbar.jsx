import React, { useState } from 'react';
import { LayoutDashboard, BarChart3, AlertTriangle, Boxes, Users, Megaphone, Briefcase, ChevronDown, ChevronRight } from 'lucide-react';

export default function LeftNavbar({ activeTab, onTabChange }) {
  const [expandedMenu, setExpandedMenu] = useState({
    'ai-insights': true,
    'audience-content': true,
    marketing: true,
    crisis: true,
    workspace: true,
  });

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'entity-management', label: 'Manage Entities', icon: Boxes },
    {
      id: 'ai-insights',
      label: 'AI Insights',
      icon: BarChart3,
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
      id: 'marketing',
      label: 'Marketing',
      icon: Megaphone,
      subTabs: [
        { id: 'marketing-intel', label: 'Marketing Intel' },
        { id: 'marketing-aggregation', label: 'Aggregated Intel' },
        { id: 'checkpoints', label: 'Checkpoints' },
      ]
    },
    { 
      id: 'crisis', 
      label: 'Crisis Management', 
      icon: AlertTriangle,
      subTabs: [
        { id: 'alert-management', label: 'Alert Management' },
        { id: 'alert-rules', label: 'Alert Rules' },
        { id: 'crisis-management', label: 'Crisis Response' },
        { id: 'crisis-center', label: 'Crisis Feed' },
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
    }
  ];

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
        {tabs.map(tab => {
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
                        <span className="text-left">{subTab.label}</span>
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
