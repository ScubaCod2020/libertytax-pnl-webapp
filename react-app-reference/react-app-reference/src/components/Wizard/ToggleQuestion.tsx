// ToggleQuestion.tsx - Reusable toggle question component for wizard sections
// Eliminates duplication between NewStoreSection and ExistingStoreSection

import React from 'react';
import type { WizardAnswers } from './types';

interface ToggleQuestionProps {
  title: string;
  description: string;
  fieldName: keyof WizardAnswers;
  fieldValue: boolean | undefined;
  positiveLabel: string;
  negativeLabel: string;
  onUpdate: (updates: Partial<WizardAnswers>) => void;
  fieldsToeClearOnDisable?: (keyof WizardAnswers)[];
  titleColor?: string;
  showOnlyWhen?: boolean; // Optional condition to show the toggle
}

export default function ToggleQuestion({
  title,
  description,
  fieldName,
  fieldValue,
  positiveLabel,
  negativeLabel,
  onUpdate,
  fieldsToeClearOnDisable = [],
  titleColor = '#6b7280',
  showOnlyWhen = true,
}: ToggleQuestionProps) {
  if (!showOnlyWhen) {
    return null;
  }

  return (
    <div
      style={{
        marginBottom: '1rem',
        padding: '0.75rem',
        backgroundColor: '#f8fafc',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ marginBottom: '0.5rem' }}>
        <label style={{ fontWeight: 600, color: titleColor }}>{title}</label>
      </div>
      <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>
        {description}
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="radio"
            name={fieldName}
            checked={fieldValue === true}
            onChange={() => onUpdate({ [fieldName]: true })}
            style={{ marginRight: '0.25rem' }}
          />
          <span style={{ fontWeight: 500 }}>{positiveLabel}</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="radio"
            name={fieldName}
            checked={fieldValue === false}
            onChange={() => {
              // Clear related fields when disabling
              const clearUpdates = fieldsToeClearOnDisable.reduce((acc, field) => {
                acc[field] = undefined;
                return acc;
              }, {} as Partial<WizardAnswers>);

              onUpdate({
                [fieldName]: false,
                ...clearUpdates,
              });
            }}
            style={{ marginRight: '0.25rem' }}
          />
          <span style={{ fontWeight: 500 }}>{negativeLabel}</span>
        </label>
      </div>
    </div>
  );
}
