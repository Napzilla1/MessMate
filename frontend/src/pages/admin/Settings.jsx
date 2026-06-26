import { useState } from 'react'
import { Save, Bell, Shield, Database, Globe } from 'lucide-react'

export default function Settings() {
  return (
    <div style={{ maxWidth: 800 }}>
      <div className="page-header">
        <div><h1>System Settings</h1><p>Global configuration</p></div>
        <button className="btn btn-primary"><Save size={16}/> Save Changes</button>
      </div>
      <div className="card">
        <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 20 }}>General Configuration</h3>
        <p>Settings disabled in demo mode.</p>
      </div>
    </div>
  )
}
