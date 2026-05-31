import React, { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Upload, Loader2, AlertCircle, CheckCircle2, Package } from 'lucide-react';
import { workspaceService } from '../../api';

const EXPECTED_FORMAT = 'aura-workspace-export';
const EXPECTED_VERSION = 1;

export default function WorkspaceExportView() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [exportError, setExportError] = useState('');
  const [importError, setImportError] = useState('');
  const [importResult, setImportResult] = useState(null);

  const exportMutation = useMutation({
    mutationFn: () => workspaceService.export(),
    onSuccess: (bundle) => {
      setExportError('');
      const json = JSON.stringify(bundle, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'aura-workspace.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    onError: (err) => setExportError(err?.message || 'Export failed'),
  });

  const importMutation = useMutation({
    mutationFn: (bundle) => workspaceService.import(bundle),
    onSuccess: (result) => {
      setImportResult(result);
      setImportError('');
      // Imported data lands in every workspace-scoped list.
      queryClient.invalidateQueries({ queryKey: ['reply-templates'] });
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
      queryClient.invalidateQueries({ queryKey: ['entities'] });
    },
    onError: (err) => {
      setImportError(err?.message || 'Import failed');
      setImportResult(null);
    },
  });

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    // Allow re-selecting the same file later.
    e.target.value = '';
    if (!file) return;
    setImportError('');
    setImportResult(null);

    let bundle;
    try {
      bundle = JSON.parse(await file.text());
    } catch {
      setImportError('That file is not valid JSON.');
      return;
    }

    // Import-blocker: this bundle format is proprietary and version-locked.
    // Reject anything that isn't an Aura export before sending it to the server.
    if (bundle?.format !== EXPECTED_FORMAT) {
      setImportError('Unrecognized file — this is not an Aura workspace export.');
      return;
    }
    if (bundle?.version !== EXPECTED_VERSION) {
      setImportError(
        `Unsupported export version (${bundle.version}). This app supports version ${EXPECTED_VERSION}.`
      );
      return;
    }

    importMutation.mutate(bundle);
  };

  const resultRows = importResult
    ? [
        { label: 'Templates', value: importResult.templatesImported },
        { label: 'Alert rules', value: importResult.alertRulesImported },
        { label: 'Playbooks', value: importResult.playbooksImported },
        { label: 'Tracked entities', value: importResult.trackedEntitiesImported },
      ]
    : [];

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Package className="w-7 h-7 text-emerald-400" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Workspace Backup</h2>
            <p className="text-sm text-muted-foreground">
              Export everything you've built — templates, alert rules, playbooks and tracked entities — as a single
              bundle, and restore it into any account.
            </p>
          </div>
        </div>

        {/* Export */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-foreground">Export</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Downloads a single <code className="text-xs px-1 py-0.5 rounded bg-muted/40">aura-workspace.json</code> file
            containing your full workspace.
          </p>
          {exportError && (
            <div className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
              {exportError}
            </div>
          )}
          <button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 h-10 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {exportMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Preparing…
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export workspace
              </>
            )}
          </button>
        </div>

        {/* Import */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-semibold text-foreground">Import</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Restores a previously exported bundle into your account. Import is <strong>additive</strong> — it adds new
            items and never deletes anything you already have.
          </p>
          {importError && (
            <div className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
              {importError}
            </div>
          )}
          {importResult && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
              <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-400 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                Import complete
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                {resultRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-foreground">{row.value ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileSelected}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 h-10 text-sm font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            {importMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Choose file to import
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
