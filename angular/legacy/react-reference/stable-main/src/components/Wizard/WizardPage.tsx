// WizardPage.tsx - Standardized page wrapper for all wizard pages
// Provides consistent spacing, headers, and navigation across all wizard steps

import React from 'react';

interface WizardPageProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  step: 'welcome' | 'inputs' | 'review';
  onNext?: () => void;
  onBack?: () => void;
  onCancel?: () => void;
  canProceed?: boolean;
  nextLabel?: string;
  backLabel?: string;
}

export default function WizardPage({
  title,
  subtitle,
  children,
  step,
  onNext,
  onBack,
  onCancel,
  canProceed = true,
  nextLabel = 'Next',
  backLabel = 'Back',
}: WizardPageProps) {
  return (
    <div data-wizard-step={step} style={{ paddingLeft: '1rem' }}>
      {/* Page Header */}
      <div className="card-title">{title}</div>
      {subtitle && <div className="card-subtitle">{subtitle}</div>}

      {/* Page Content */}
      <div>{children}</div>

      {/* Navigation Buttons */}
      {(onNext || onBack || onCancel) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <div>
            {onCancel && (
              <button
                onClick={onCancel}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Cancel
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                {backLabel}
              </button>
            )}

            {onNext && (
              <button
                onClick={onNext}
                disabled={!canProceed}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: canProceed ? '#3b82f6' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: canProceed ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                {nextLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
