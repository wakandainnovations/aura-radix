import React, { useState } from 'react';
import CrisisInputSection from './CrisisInputSection';
import { crisisService } from '../../api/crisisService';

export default function CrisisPlanGenerator({ selectedEntity, mentions = [] }) {
  const [problemDescription, setProblemDescription] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!problemDescription.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await crisisService.generatePlan(
        selectedEntity?.id,
        problemDescription
      );

      if (response && response.generatedPlan) {
        setGeneratedPlan(response.generatedPlan);
      }
    } catch (err) {
      console.error('Error generating crisis plan:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate crisis plan');
      setGeneratedPlan(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        <CrisisInputSection
          problemDescription={problemDescription}
          onDescriptionChange={setProblemDescription}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {generatedPlan && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Crisis Management Plan</h3>
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
              {generatedPlan}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
