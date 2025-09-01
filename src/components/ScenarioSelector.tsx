import React from 'react'
import type { Scenario } from '../data/presets'

export default function ScenarioSelector({scenario,setScenario}:{scenario:Scenario,setScenario:(s:Scenario)=>void}){
  return (
    <div className="input-row">
      <label>Scenario</label>
      <select value={scenario} onChange={e=>setScenario(e.target.value as Scenario)}>
        <option>Custom</option>
        <option>Good</option>
        <option>Better</option>
        <option>Best</option>
      </select>
    </div>
  )
}
