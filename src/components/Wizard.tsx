import React from 'react'
import type { Region } from '../lib/calcs'

export default function Wizard({region,setRegion,goToInputs}:{region:Region,setRegion:(r:Region)=>void,goToInputs:()=>void}){
  return (
    <div className="card">
      <div className="card-title">Welcome – Quick Start</div>
      <div className="input-row">
        <label>Region</label>
        <select value={region} onChange={e=>setRegion(e.target.value as Region)}>
          <option value="US">U.S.</option>
          <option value="CA">Canada</option>
        </select>
      </div>
      <p className="small">TaxRush applies only to Canadian offices. Selecting U.S. will disable TaxRush in calculations.</p>
      <button className="btn-link" onClick={goToInputs}>Continue →</button>
    </div>
  )
}
