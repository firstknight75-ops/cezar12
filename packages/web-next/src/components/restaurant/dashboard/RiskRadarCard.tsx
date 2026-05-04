'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const DATA = [
  { metric: 'جودة الطعام', value: 85 },
  { metric: 'الخدمة', value: 70 },
  { metric: 'التسعير', value: 60 },
  { metric: 'الموقع', value: 90 },
  { metric: 'التسويق', value: 45 },
]

export function RiskRadarCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>مؤشرات الأداء</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={DATA}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <Radar
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
