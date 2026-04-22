import React, { useState } from 'react';
import { LayoutDashboard, BarChart3, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';

export default function LeftNavbar({ activeTab, onTabChange }) {
  const [expandedMenu, setExpandedMenu] = useState({ crisis: true, analytics: true });
  
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3,
      subTabs: [
        { id: 'ai-analytics', label: 'AI Analytics' },
      ]
    },
    { 
      id: 'crisis', 
      label: 'Crisis Management', 
      icon: AlertTriangle,
      subTabs: [
        { id: 'crisis-management', label: 'Crisis Response' },
        { id: 'crisis-center', label: 'Crisis Feed' },
        { id: 'negative-analysis', label: 'Sentiment Analysis' }
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
