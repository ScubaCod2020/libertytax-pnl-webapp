// DebugToggle.tsx - Toggle button for debug system
// Small button that can be placed in footer or anywhere

import React from 'react'

interface DebugToggleProps {
  isOpen: boolean
  onToggle: () => void
  show: boolean
}

export default function DebugToggle({ isOpen, onToggle, show }: DebugToggleProps) {
  if (!show) return null

  return (
    <button
      onClick={onToggle}
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: isOpen ? '#f59e0b' : '#374151',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'all 0.2s ease',
        zIndex: 10000,
      }}
      title={isOpen ? 'Close Debug Panel' : 'Open Debug Panel'}
    >
      {isOpen ? '✕' : '🐛'}
    </button>
  )
}
