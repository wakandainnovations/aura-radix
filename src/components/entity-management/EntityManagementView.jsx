import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Boxes, Plus, Pencil, Trash2, Loader2, AlertCircle, Tag, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { entityService } from '../../api';
import { useSortableRows } from '../shared';
import EntityFormModal from './EntityFormModal';
import { ENTITY_TYPES, getEntityTypeConfig, normalizeKeywords } from './entityTypes';

const QUERY_STALE_TIME = 1000 * 60 * 5; // 5 minutes

export default function EntityManagementView() {
  const queryClient = useQueryClient();
  const [activeType, setActiveType] = useState('movie');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingEntity, setEditingEntity] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const {
    data: entities = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['entities', activeType],
    queryFn: () => entityService.getAll(activeType),
    staleTime: QUERY_STALE_TIME,
    select: (data) =>
      (Array.isArray(data) ? data : []).map((entity) => ({ ...entity, entityType: activeType })),
  });

  const activeConfig = getEntityTypeConfig(activeType);

  // Only the Name column is meaningfully sortable (Keywords is a chip list,
  // Actions are buttons). Default order is unchanged until the header is clicked.
  const { rows: sortedEntities, sortState, requestSort } = useSortableRows(entities, null);

  const openCreate = () => {
    setModalMode('create');
    setEditingEntity(null);
    setActionError(null);
    setModalOpen(true);
  };

  // The list endpoint returns a minimal entity shape, but the update is a full
  // replace — so fetch the complete entity first to pre-populate every editable
  // field (director, actors, industry, genre, releaseDate, keywords). Otherwise
  // fields missing from the list payload would be cleared on save.
  const openEdit = async (entity) => {
    setActionError(null);
    setEditingId(entity.id);
    try {
      const full = await entityService.getById(entity.id, activeType);
      setEditingEntity({ ...entity, ...full, entityType: activeType });
    } catch {
      // Fall back to the list row; the user can still edit visible fields.
      setEditingEntity({ ...entity, entityType: activeType });
    } finally {
      setEditingId(null);
    }
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleCreate = useCallback(
    async (entityType, data) => {
      await entityService.create(entityType, data);
      queryClient.invalidateQueries({ queryKey: ['entities', entityType] });
    },
    [queryClient]
  );

  const handleUpdate = useCallback(
    async (entityType, entityId, data) => {
      await entityService.update(entityType, entityId, data);
      queryClient.invalidateQueries({ queryKey: ['entities', entityType] });
    },
    [queryClient]
  );

  const handleDelete = useCallback(
    async (entity) => {
      const confirmed = window.confirm(
        `Delete "${entity.name}"? This removes the entity and stops tracking its keywords.`
      );
      if (!confirmed) return;
      setActionError(null);
      setDeletingId(entity.id);
      try {
        await entityService.delete(activeType, entity.id);
        queryClient.invalidateQueries({ queryKey: ['entities', activeType] });
      } catch (err) {
        setActionError(err?.message || `Failed to delete "${entity.name}".`);
      } finally {
        setDeletingId(null);
      }
    },
    [activeType, queryClient]
  );

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Boxes className="w-7 h-7 text-emerald-400" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Manage Entities</h2>
              <p className="text-sm text-muted-foreground">
                Add movies, celebrities, politicians, and political parties, and edit their details and the keywords used to track them.
              </p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 h-10 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Entity
          </button>
        </div>

        {/* Type tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {ENTITY_TYPES.map((t) => {
            const Icon = t.icon;
            const isActive = activeType === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setActiveType(t.value)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                  isActive
                    ? 'bg-primary/20 text-primary border-primary/50'
                    : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {actionError && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-500">{actionError}</p>
          </div>
        )}

        {/* Entity table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-sm text-muted-foreground">
                {error?.message || `Failed to load ${activeConfig.label.toLowerCase()} entities.`}
              </p>
              <button
                onClick={() => refetch()}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors"
              >
                Retry
              </button>
            </div>
          ) : entities.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <activeConfig.icon className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No {activeConfig.label.toLowerCase()} entities yet.
              </p>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add your first {activeConfig.label.toLowerCase()}
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => requestSort('name')}
                      className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-foreground"
                    >
                      Name
                      {sortState?.key === 'name'
                        ? (sortState.dir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)
                        : <ChevronsUpDown className="w-3 h-3 opacity-30" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-semibold">Keywords</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedEntities.map((entity) => {
                  const keywords = normalizeKeywords(entity.keywords);
                  return (
                    <tr key={entity.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3 align-top">
                        <span className="font-medium text-foreground">{entity.name}</span>
                        {entity.director && (
                          <p className="text-xs text-muted-foreground mt-0.5">Dir. {entity.director}</p>
                        )}
                        {(entity.industry || entity.genre) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {[
                              Array.isArray(entity.industry) ? entity.industry.join(', ') : entity.industry,
                              Array.isArray(entity.genre) ? entity.genre.join(', ') : entity.genre,
                            ]
                              .filter(Boolean)
                              .join(' • ')}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {keywords.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">No keywords</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 max-w-xl">
                            {keywords.map((keyword, i) => (
                              <span
                                key={`${keyword}-${i}`}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
                              >
                                <Tag className="w-3 h-3" />
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(entity)}
                            disabled={editingId === entity.id}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
                            title="Edit entity"
                          >
                            {editingId === entity.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Pencil className="w-3.5 h-3.5" />
                            )}
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(entity)}
                            disabled={deletingId === entity.id}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Delete entity"
                          >
                            {deletingId === entity.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <EntityFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        entity={editingEntity}
        defaultEntityType={activeType}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
