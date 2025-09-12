import React from 'react'
import type { Light } from '../lib/calcs'

const colors = {
  green: 'var(--ok-green)',
  yellow: 'var(--warn-yellow)',
  red: 'var(--bad-red)',
  grey: '#C8C8C8'
}

export default function KPIStoplight({active}:{active:Light}){
  const lenses:Light[] = ['red','yellow','green']
  
  // 🔧 SAFETY CHECK: Ensure colors object is valid
  if (!colors) {
    console.warn('KPIStoplight: colors object is undefined')
    return null
  }
  
  return (
    <div className="stoplight" aria-label={`status ${active}`}>
      {lenses.map((l, i) => (
        <div key={i} className={'lens'+(l===active?' active':'')} style={{background: l===active?colors[l]:colors.grey}} />
      ))}
    </div>
  )
}
