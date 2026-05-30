import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';
import FormInput from '../ui/FormInput';
import KeywordInput from './KeywordInput';
import { ENTITY_TYPES, normalizeKeywords } from './entityTypes';

/**
 * Modal for creating a new entity (with keywords) or editing an existing entity's keywords.
 *
 * mode === 'create': full form (type, name, type-specific fields, keywords) -> onCreate(entityType, data)
 * mode === 'edit':   keywords-only editor for an existing entity      -> onUpdateKeywords(entityType, id, keywords)
 */
export default function EntityFormModal({
  open,
  onOpenChange,
  mode = 'create',
  entity = null,
  defaultEntityType = 'movie',
  onCreate,
  onUpdateKeywords,
}) {
  const isEdit = mode === 'edit';

  const [entityType, setEntityType] = useState(defaultEntityType);
  const [name, setName] = useState('');
  const [director, setDirector] = useState('');
  const [actors, setActors] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Reset form state whenever the modal opens or the target entity changes.
  useEffect(() => {
    if (!open) return;
    setError(null);
    setSubmitting(false);
    if (isEdit && entity) {
      setEntityType(entity.entityType || defaultEntityType);
      setName(entity.name || '');
      setDirector(entity.director || '');
      setActors(Array.isArray(entity.actors) ? entity.actors.join(', ') : entity.actors || '');
      setKeywords(normalizeKeywords(entity.keywords));
    } else {
      setEntityType(defaultEntityType);
      setName('');
      setDirector('');
      setActors('');
      setKeywords([]);
    }
  }, [open, isEdit, entity, defaultEntityType]);

  const typeConfig = ENTITY_TYPES.find((t) => t.value === entityType) || ENTITY_TYPES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isEdit && !name.trim()) {
      setError('Name is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await onUpdateKeywords(entityType, entity.id, keywords);
      } else {
        const data = { name: name.trim(), type: entityType, keywords };
        if (typeConfig.hasMovieFields) {
          if (director.trim()) data.director = director.trim();
          const actorList = actors
            .split(',')
            .map((a) => a.trim())
            .filter(Boolean);
          if (actorList.length > 0) data.actors = actorList;
        }
        await onCreate(entityType, data);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={document.body}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,560px)] max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <Dialog.Title className="text-lg font-semibold text-foreground">
                {isEdit ? 'Edit Keywords' : 'Add Entity'}
              </Dialog.Title>
              <p className="text-sm text-muted-foreground mt-1">
                {isEdit
                  ? `Update the keywords tracked for "${entity?.name}".`
                  : 'Create a new entity and the keywords used to track it.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-accent rounded transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Entity type */}
            {isEdit ? (
              <div className="space-y-2">
                <span className="text-sm font-medium text-foreground">Type</span>
                <div className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-muted-foreground">
                  {typeConfig.label}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  Type<span className="text-red-500 ml-1">*</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {ENTITY_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setEntityType(t.value)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                        entityType === t.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:bg-accent'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Name */}
            {isEdit ? (
              <div className="space-y-2">
                <span className="text-sm font-medium text-foreground">Name</span>
                <div className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground">
                  {entity?.name}
                </div>
              </div>
            ) : (
              <FormInput
                id="entity-name"
                label="Name"
                placeholder={typeConfig.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={submitting}
              />
            )}

            {/* Movie-specific fields (create only) */}
            {!isEdit && typeConfig.hasMovieFields && (
              <>
                <FormInput
                  id="entity-director"
                  label="Director"
                  placeholder="e.g. Christopher Nolan"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  disabled={submitting}
                />
                <FormInput
                  id="entity-actors"
                  label="Cast"
                  placeholder="Comma-separated, e.g. Actor One, Actor Two"
                  value={actors}
                  onChange={(e) => setActors(e.target.value)}
                  helpText="Separate multiple names with commas."
                  disabled={submitting}
                />
              </>
            )}

            {/* Keywords */}
            <KeywordInput
              keywords={keywords}
              onChange={setKeywords}
              disabled={submitting}
            />

            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
                className="px-4 py-2 h-10 text-sm font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 h-10 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEdit ? 'Save Keywords' : 'Create Entity'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
