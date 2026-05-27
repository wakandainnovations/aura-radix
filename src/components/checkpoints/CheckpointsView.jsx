import React from 'react';
import { useQuery } from '@tanstack/react-query';
import CheckpointManager from './CheckpointManager';
import CheckpointImpactView from './CheckpointImpactView';
import CheckpointTrendView from './CheckpointTrendView';
import SentimentDeltaView from './SentimentDeltaView';
import { checkpointService } from '../../api';

export default function CheckpointsView({ selectedEntity }) {
  const entityId = selectedEntity?.id;
  const entityName = selectedEntity?.name;

  const { data: checkpoints = [] } = useQuery({
    queryKey: ['checkpoints', entityId],
    queryFn: () => checkpointService.listByEntity(entityId),
    enabled: !!entityId,
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Checkpoints — {entityName}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Mark significant events and measure their impact on sentiment.
        </p>
      </div>

      <CheckpointManager entityId={entityId} entityName={entityName} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CheckpointImpactView entityId={entityId} entityName={entityName} />
        <CheckpointTrendView entityId={entityId} entityName={entityName} />
      </div>

      <SentimentDeltaView
        entityId={entityId}
        entityName={entityName}
        checkpoints={checkpoints}
      />
    </div>
  );
}
