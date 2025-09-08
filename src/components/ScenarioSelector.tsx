import React from 'react'
import type { Scenario } from '../data/presets'

export default function ScenarioSelector({scenario,setScenario}:{scenario:Scenario,setScenario:(s:Scenario)=>void}){
  
  // 🎯 DEBUG: Log scenario changes
  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newScenario = e.target.value as Scenario
    console.log('🎯 SCENARIO SELECTOR DEBUG:', {
      component: 'scenario_selector',
      oldScenario: scenario,
      newScenario: newScenario,
      timestamp: new Date().toLocaleTimeString()
    })
    setScenario(newScenario)
  }
  
  return (
    <div className="input-row">
      <label>Scenario</label>
      <select value={scenario} onChange={handleScenarioChange}>
        <option>Custom</option>
        <option>Good</option>
        <option>Better</option>
        <option>Best</option>
      </select>
    </div>
  )
}
