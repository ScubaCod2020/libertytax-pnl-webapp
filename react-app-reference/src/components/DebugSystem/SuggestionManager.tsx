/**
 * Debug Tool: Suggestion & Threshold Manager
 * Allows developers to update suggestion profiles and thresholds
 */

import React, { useState } from 'react'
import { Region } from '../../types'
import { 
  suggestionProfiles, 
  SuggestionProfile,
  getSuggestionProfile,
  calculateSuggestions 
} from '../../utils/suggestionEngine'

interface SuggestionManagerProps {
  region: Region
  onProfileUpdate?: (profileKey: string, profile: SuggestionProfile) => void
}

export default function SuggestionManager({ region, onProfileUpdate }: SuggestionManagerProps) {
  const [selectedProfile, setSelectedProfile] = useState<string>('CA-new-standard')
  const [editMode, setEditMode] = useState(false)
  const [editedProfile, setEditedProfile] = useState<SuggestionProfile | null>(null)

  // Get relevant profiles for current region
  const relevantProfiles = Object.entries(suggestionProfiles).filter(([key, profile]) => 
    profile.region === region
  )

  const currentProfile = suggestionProfiles[selectedProfile]
  const suggestions = currentProfile ? calculateSuggestions(currentProfile) : null

  const handleEdit = (profile: SuggestionProfile) => {
    setEditedProfile({...profile})
    setEditMode(true)
  }

  const handleSave = () => {
    if (editedProfile && onProfileUpdate) {
      onProfileUpdate(selectedProfile, editedProfile)
    }
    setEditMode(false)
    setEditedProfile(null)
  }

  const handleCancel = () => {
    setEditMode(false)
    setEditedProfile(null)
  }

  const updateProfileField = (field: keyof SuggestionProfile, value: any) => {
    if (!editedProfile) return
    setEditedProfile({
      ...editedProfile,
      [field]: value
    })
  }

  const updateExpenseField = (expenseId: string, value: number) => {
    if (!editedProfile) return
    setEditedProfile({
      ...editedProfile,
      expenses: {
        ...editedProfile.expenses,
        [expenseId]: value
      }
    })
  }

  return (
    <div style={{
      background: '#1f2937',
      color: '#f3f4f6',
      padding: '1rem',
      borderRadius: '8px',
      fontSize: '0.875rem',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <h3 style={{ 
        margin: '0 0 1rem 0', 
        color: '#fbbf24', 
        fontSize: '1rem',
        fontWeight: 600 
      }}>
        🎯 Suggestion Profile Manager
      </h3>

      {/* Profile Selector */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
          Select Profile ({region} region):
        </label>
        <select
          value={selectedProfile}
          onChange={(e) => setSelectedProfile(e.target.value)}
          title="Select suggestion profile"
          aria-label="Select suggestion profile"
          style={{
            background: '#374151',
            color: '#f3f4f6',
            border: '1px solid #4b5563',
            borderRadius: '4px',
            padding: '0.5rem',
            fontSize: '0.875rem',
            width: '100%'
          }}
        >
          {relevantProfiles.map(([key, profile]) => (
            <option key={key} value={key}>
              {profile.name}
            </option>
          ))}
        </select>
      </div>

      {currentProfile && (
        <>
          {/* Profile Summary */}
          <div style={{ 
            background: '#374151', 
            padding: '0.75rem', 
            borderRadius: '6px',
            marginBottom: '1rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#f3f4f6' }}>
              {currentProfile.name}
            </h4>
            <p style={{ margin: '0', color: '#9ca3af', fontSize: '0.8rem' }}>
              {currentProfile.description}
            </p>
            
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
              <span>Store: {currentProfile.storeType}</span>
              <span>TaxRush: {currentProfile.handlesTaxRush ? 'Yes' : 'No'}</span>
            </div>
          </div>

          {/* Calculated Results Preview */}
          {suggestions && (
            <div style={{ 
              background: '#065f46', 
              padding: '0.75rem', 
              borderRadius: '6px',
              marginBottom: '1rem'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#10b981' }}>
                💰 Calculation Flow Preview
              </h4>
              <div style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                <div>ANF ${suggestions.avgNetFee} × {suggestions.taxPrepReturns} returns = <strong>${suggestions.grossFees.toLocaleString()}</strong> gross</div>
                <div>Less {suggestions.discountsPct}% discounts = <strong>${suggestions.taxPrepIncome.toLocaleString()}</strong> tax prep income</div>
                {suggestions.taxRushIncome > 0 && (
                  <div>Plus TaxRush ${suggestions.taxRushIncome.toLocaleString()} = <strong>${suggestions.totalRevenue.toLocaleString()}</strong> total</div>
                )}
                <div>Less ${suggestions.totalExpenses.toLocaleString()} expenses = <strong>${suggestions.netIncome.toLocaleString()}</strong> net income</div>
              </div>
            </div>
          )}

          {/* Edit Mode */}
          {!editMode ? (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                onClick={() => handleEdit(currentProfile)}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                📝 Edit Profile
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                  onClick={handleSave}
                  style={{
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  ✅ Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  ❌ Cancel
                </button>
              </div>

              {editedProfile && (
                <div style={{ 
                  background: '#374151', 
                  padding: '0.75rem', 
                  borderRadius: '6px',
                  maxHeight: '60vh',
                  overflowY: 'auto'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#fbbf24' }}>
                    Edit Profile: {editedProfile.name}
                  </h4>

                  {/* Core Financial Inputs */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ margin: '0 0 0.5rem 0', color: '#f3f4f6' }}>Core Inputs</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#d1d5db' }}>Avg Net Fee</label>
                        <input
                          type="number"
                          value={editedProfile.avgNetFee}
                          onChange={(e) => updateProfileField('avgNetFee', +e.target.value)}
                          title="Average Net Fee"
                          aria-label="Average Net Fee"
                          style={{
                            width: '100%',
                            background: '#1f2937',
                            color: '#f3f4f6',
                            border: '1px solid #4b5563',
                            borderRadius: '4px',
                            padding: '0.25rem',
                            fontSize: '0.8rem'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#d1d5db' }}>Tax Prep Returns</label>
                        <input
                          type="number"
                          value={editedProfile.taxPrepReturns}
                          onChange={(e) => updateProfileField('taxPrepReturns', +e.target.value)}
                          title="Tax Prep Returns"
                          aria-label="Tax Prep Returns"
                          style={{
                            width: '100%',
                            background: '#1f2937',
                            color: '#f3f4f6',
                            border: '1px solid #4b5563',
                            borderRadius: '4px',
                            padding: '0.25rem',
                            fontSize: '0.8rem'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#d1d5db' }}>Discounts %</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editedProfile.discountsPct}
                          onChange={(e) => updateProfileField('discountsPct', +e.target.value)}
                          title="Discounts Percentage"
                          aria-label="Discounts Percentage"
                          style={{
                            width: '100%',
                            background: '#1f2937',
                            color: '#f3f4f6',
                            border: '1px solid #4b5563',
                            borderRadius: '4px',
                            padding: '0.25rem',
                            fontSize: '0.8rem'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#d1d5db' }}>Other Income</label>
                        <input
                          type="number"
                          value={editedProfile.otherIncome || 0}
                          onChange={(e) => updateProfileField('otherIncome', +e.target.value)}
                          title="Other Income"
                          aria-label="Other Income"
                          style={{
                            width: '100%',
                            background: '#1f2937',
                            color: '#f3f4f6',
                            border: '1px solid #4b5563',
                            borderRadius: '4px',
                            padding: '0.25rem',
                            fontSize: '0.8rem'
                          }}
                        />
                      </div>

                      {editedProfile.handlesTaxRush && (
                        <>
                          <div>
                            <label style={{ fontSize: '0.8rem', color: '#d1d5db' }}>TaxRush Returns</label>
                            <input
                              type="number"
                              value={editedProfile.taxRushReturns || 0}
                              onChange={(e) => updateProfileField('taxRushReturns', +e.target.value)}
                              title="TaxRush Returns"
                              aria-label="TaxRush Returns"
                              style={{
                                width: '100%',
                                background: '#1f2937',
                                color: '#f3f4f6',
                                border: '1px solid #4b5563',
                                borderRadius: '4px',
                                padding: '0.25rem',
                                fontSize: '0.8rem'
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.8rem', color: '#d1d5db' }}>TaxRush ANF</label>
                            <input
                              type="number"
                              value={editedProfile.taxRushAvgNetFee || 0}
                              onChange={(e) => updateProfileField('taxRushAvgNetFee', +e.target.value)}
                              title="TaxRush Average Net Fee"
                              aria-label="TaxRush Average Net Fee"
                              style={{
                                width: '100%',
                                background: '#1f2937',
                                color: '#f3f4f6',
                                border: '1px solid #4b5563',
                                borderRadius: '4px',
                                padding: '0.25rem',
                                fontSize: '0.8rem'
                              }}
                            />
                          </div>
                        </>
                      )}

                      {editedProfile.storeType === 'existing' && (
                        <div>
                          <label style={{ fontSize: '0.8rem', color: '#d1d5db' }}>Growth %</label>
                          <input
                            type="number"
                            step="0.1"
                            value={editedProfile.expectedGrowthPct || 0}
                            onChange={(e) => updateProfileField('expectedGrowthPct', +e.target.value)}
                            title="Expected Growth Percentage"
                            aria-label="Expected Growth Percentage"
                            style={{
                              width: '100%',
                              background: '#1f2937',
                              color: '#f3f4f6',
                              border: '1px solid #4b5563',
                              borderRadius: '4px',
                              padding: '0.25rem',
                              fontSize: '0.8rem'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Key Expenses (top 6) */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ margin: '0 0 0.5rem 0', color: '#f3f4f6' }}>Key Expenses</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {['salariesPct', 'rentPct', 'suppliesPct', 'royaltiesPct', 'advRoyaltiesPct', 'miscPct'].map(expenseId => (
                        <div key={expenseId}>
                          <label style={{ fontSize: '0.8rem', color: '#d1d5db' }}>
                            {expenseId.replace('Pct', '').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </label>
                            <input
                              type="number"
                              step="0.1"
                              value={editedProfile.expenses[expenseId as keyof typeof editedProfile.expenses]}
                              onChange={(e) => updateExpenseField(expenseId, +e.target.value)}
                              title={expenseId.replace('Pct', '').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              aria-label={expenseId.replace('Pct', '').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              style={{
                                width: '100%',
                                background: '#1f2937',
                                color: '#f3f4f6',
                                border: '1px solid #4b5563',
                                borderRadius: '4px',
                                padding: '0.25rem',
                                fontSize: '0.8rem'
                              }}
                            />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Current Values Display */}
          <div style={{ 
            background: '#374151', 
            padding: '0.75rem', 
            borderRadius: '6px',
            fontSize: '0.8rem' 
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#f3f4f6' }}>Current Profile Values</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', color: '#d1d5db' }}>
              <div>ANF: ${currentProfile.avgNetFee}</div>
              <div>Returns: {currentProfile.taxPrepReturns.toLocaleString()}</div>
              <div>Discounts: {currentProfile.discountsPct}%</div>
              <div>Salaries: {currentProfile.expenses.salariesPct}%</div>
              <div>Rent: {currentProfile.expenses.rentPct}%</div>
              <div>Supplies: {currentProfile.expenses.suppliesPct}%</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
