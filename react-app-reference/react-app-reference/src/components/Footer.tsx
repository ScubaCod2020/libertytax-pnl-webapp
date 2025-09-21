// Footer.tsx - Professional navigation footer
// Multi-column layout with app navigation and external links

import React from 'react';

interface FooterProps {
  onNavigate?: (page: string) => void;
  showWizard?: boolean;
  wizardCompleted?: boolean;
  currentPage?: 'wizard' | 'dashboard' | 'reports';
}

export default function Footer({
  onNavigate,
  showWizard = false,
  wizardCompleted = false,
  currentPage = 'wizard',
}: FooterProps) {
  const handleNavClick = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        padding: '2rem 1rem 1rem',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1.5fr', // About column wider, others closer
          gap: '1.5rem',
          fontSize: '0.875rem',
        }}
      >
        {/* App Navigation Column */}
        <div>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#1f2937',
              marginBottom: '1rem',
            }}
          >
            Navigation
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => handleNavClick('wizard')}
              style={{
                background: 'none',
                border: 'none',
                color: currentPage === 'wizard' ? '#2563eb' : '#6b7280',
                fontWeight: currentPage === 'wizard' ? 600 : 400,
                textAlign: 'left',
                cursor: 'pointer',
                padding: '0.25rem 0',
                fontSize: '0.875rem',
              }}
            >
              🚀 Setup Wizard
            </button>
            <button
              onClick={() => handleNavClick('dashboard')}
              disabled={!wizardCompleted}
              style={{
                background: 'none',
                border: 'none',
                color: wizardCompleted
                  ? currentPage === 'dashboard'
                    ? '#2563eb'
                    : '#6b7280'
                  : '#d1d5db',
                fontWeight: currentPage === 'dashboard' ? 600 : 400,
                textAlign: 'left',
                cursor: wizardCompleted ? 'pointer' : 'not-allowed',
                padding: '0.25rem 0',
                fontSize: '0.875rem',
              }}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => handleNavClick('reports')}
              disabled={!wizardCompleted}
              style={{
                background: 'none',
                border: 'none',
                color: wizardCompleted
                  ? currentPage === 'reports'
                    ? '#2563eb'
                    : '#6b7280'
                  : '#d1d5db',
                fontWeight: currentPage === 'reports' ? 600 : 400,
                textAlign: 'left',
                cursor: wizardCompleted ? 'pointer' : 'not-allowed',
                padding: '0.25rem 0',
                fontSize: '0.875rem',
              }}
            >
              📈 Reports
            </button>
          </div>
        </div>

        {/* Quick Links Column */}
        <div>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#1f2937',
              marginBottom: '1rem',
            }}
          >
            Quick Links
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => handleNavClick('pro-tips')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                textAlign: 'left',
                cursor: 'pointer',
                padding: '0.25rem 0',
                fontSize: '0.875rem',
              }}
            >
              💡 Pro-Tips <span style={{ color: '#d1d5db', fontSize: '0.75rem' }}>*</span>
            </button>
            <button
              onClick={() => handleNavClick('practice')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                textAlign: 'left',
                cursor: 'pointer',
                padding: '0.25rem 0',
                fontSize: '0.875rem',
              }}
            >
              🎯 Practice Problems <span style={{ color: '#d1d5db', fontSize: '0.75rem' }}>*</span>
            </button>
            <button
              onClick={() => handleNavClick('export')}
              disabled={!wizardCompleted}
              style={{
                background: 'none',
                border: 'none',
                color: wizardCompleted ? '#6b7280' : '#d1d5db',
                textAlign: 'left',
                cursor: wizardCompleted ? 'pointer' : 'not-allowed',
                padding: '0.25rem 0',
                fontSize: '0.875rem',
              }}
            >
              📄 Export (PDF/Excel) <span style={{ color: '#d1d5db', fontSize: '0.75rem' }}>*</span>
            </button>
          </div>
        </div>

        {/* External Resources Column - Scaffolding */}
        <div>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#1f2937',
              marginBottom: '1rem',
            }}
          >
            Resources
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => handleNavClick('settings')}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                textAlign: 'left',
                cursor: 'not-allowed',
                padding: '0.25rem 0',
                fontSize: '0.875rem',
              }}
            >
              ⚙️ Settings <span style={{ color: '#d1d5db', fontSize: '0.75rem' }}>*</span>
            </button>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                color: '#9ca3af',
                textDecoration: 'none',
                padding: '0.25rem 0',
                fontSize: '0.875rem',
                cursor: 'not-allowed',
              }}
            >
              📚 Training Materials <span style={{ color: '#d1d5db', fontSize: '0.75rem' }}>*</span>
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                color: '#9ca3af',
                textDecoration: 'none',
                padding: '0.25rem 0',
                fontSize: '0.875rem',
                cursor: 'not-allowed',
              }}
            >
              📞 Support Center <span style={{ color: '#d1d5db', fontSize: '0.75rem' }}>*</span>
            </a>
          </div>
        </div>

        {/* About/Version Column - Wider */}
        <div>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#1f2937',
              marginBottom: '1rem',
            }}
          >
            About & Status
          </h3>
          <div
            style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              lineHeight: '1.5',
            }}
          >
            <div style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: '#374151' }}>P&L Budget & Forecast</strong>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>Version 0.5 Preview</div>
            <div style={{ marginBottom: '1rem' }}>Liberty Tax Service</div>

            {/* Progress Milestones for Stakeholders */}
            <div
              style={{
                fontSize: '0.625rem',
                color: '#059669',
                marginBottom: '0.75rem',
                lineHeight: '1.4',
              }}
            >
              <div style={{ fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                🚀 Current Milestones:
              </div>
              <div>✅ Wizard-driven setup complete</div>
              <div>✅ Modular component architecture</div>
              <div>✅ Regional branding & features</div>
              <div>✅ Real-time calculations & validation</div>
            </div>

            <div
              style={{
                fontSize: '0.625rem',
                color: '#9ca3af',
                borderTop: '1px solid #e5e7eb',
                paddingTop: '0.5rem',
              }}
            >
              Data persisted locally • Regional features active
              <br />
              <span style={{ color: '#d1d5db' }}>* Feature in development</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
