import apiClient from './client';

/**
 * Workspace export / import — a single proprietary JSON bundle of the
 * current user's templates, alert rules, playbooks and tracked entities.
 * Backend: /api/workspace (see WorkspaceController)
 */
export const workspaceService = {
  // Returns the WorkspaceExportBundle JSON object.
  export: async () => {
    const response = await apiClient.get('/workspace/export');
    return response;
  },

  // Import is additive — bundle must have format 'aura-workspace-export' and version 1.
  // Returns WorkspaceImportResult counts.
  import: async (bundle) => {
    const response = await apiClient.post('/workspace/import', bundle);
    return response;
  },
};
