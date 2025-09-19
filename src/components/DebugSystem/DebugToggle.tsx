// DebugToggle.tsx - Toggle button for debug system
// Small button that can be placed in footer or anywhere

import React from 'react'
import cdnSupportAgent from '../../assets/icons/cdn_Support_agent.png'
import usSupportAgent from '../../assets/icons/us_Support_agent.png'

interface DebugToggleProps {
  isOpen: boolean
  onToggle: () => void
  show: boolean
  region: 'US' | 'CA'
}

export default function DebugToggle({ isOpen, onToggle, show, region }: DebugToggleProps) {
  if (!show) return null

  const supportIcon = region === 'CA' 
    ? cdnSupportAgent
    : usSupportAgent
    
  console.log('DebugToggle render - region:', region, 'icon:', supportIcon) // Debug logging
  
  // Test if files exist by trying to create image objects
  React.useEffect(() => {
    const testImg = new Image()
    testImg.onload = () => console.log(`✅ ${region} icon file exists and loaded`)
    testImg.onerror = () => console.error(`❌ ${region} icon file NOT found or failed to load`)
    testImg.src = supportIcon
  }, [supportIcon, region])

  return (
    <button
      onClick={onToggle}
      aria-label="Debug"
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: isOpen ? '#f59e0b' : '#374151',
        border: '2px solid white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'all 0.2s ease',
        zIndex: 10000,
        padding: '8px'
      }}
      title={isOpen ? 'Close Support Panel' : 'Open Support Panel'}
    >
      {isOpen ? (
        <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>✕</span>
      ) : (
        <img 
          key={`support-${region}`}
          src={`${supportIcon}?v=${region}`}
          alt={`${region} Support Agent`}
          style={{ 
            width: '28px', 
            height: '28px', 
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)' // Make icon white
          }}
          onLoad={() => console.log(`Loaded ${region} support icon`)}
          onError={() => console.error(`Failed to load ${region} support icon`)}
        />
      )}
    </button>
  )
}
