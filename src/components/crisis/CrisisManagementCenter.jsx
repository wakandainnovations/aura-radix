import React from 'react';
import { AlertTriangle } from 'lucide-react';
import CrisisPlanGenerator from './CrisisPlanGenerator';
import GatedFeature from '../licensing/GatedFeature';
import { FEATURE_KEYS } from '../../lib/licensing';

export default function CrisisManagementCenter({
  selectedEntity,
  entityType,
  mentions = [],
}) {
  return (
    <GatedFeature featureKey={FEATURE_KEYS.CRISIS} featureName="Crisis Management">
      <div className="h-full flex flex-col bg-background">
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <CrisisPlanGenerator
            selectedEntity={selectedEntity}
            mentions={mentions}
          />
        </div>
      </div>
    </GatedFeature>
  );
}
