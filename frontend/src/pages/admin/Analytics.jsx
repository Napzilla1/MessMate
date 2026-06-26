import { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { Calendar, Download } from 'lucide-react'

const MOCK_FINANCE = [
  { month: 'Jan', budget: 450000, spent: 420000 },
  { month: 'Feb', budget: 450000, spent: 440000 },
  { month: 'Mar', budget: 450000, spent: 480000 },
  { month: 'Apr', budget: 450000, spent: 410000 },
  { month: 'May', budget: 450000, spent: 390000 },
]

export default function Analytics() {
  return (
    <div>
      <div className="page-header">
        <div><h1>System Analytics</h1><p>Financial and operational overview</p></div>
        <button className="btn btn-primary"><Download size={16}/> Export Report</button>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 20 }}>Budget vs Expenditure (YTD)</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_FINANCE}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="budget" name="Allocated Budget" fill="var(--accent-teal)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Actual Spent" fill="var(--accent-amber)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
