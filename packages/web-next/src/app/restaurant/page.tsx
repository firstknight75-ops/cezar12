import { PageHeader } from '@/components/shared/PageHeader'
import { SummaryCards } from '@/components/restaurant/dashboard/SummaryCards'
import { RiskRadarCard } from '@/components/restaurant/dashboard/RiskRadarCard'
import { AIRecommendationsFeed } from '@/components/restaurant/dashboard/AIRecommendationsFeed'

export default function RestaurantKitchenPage() {
  return (
    <div>
      <PageHeader
        title="لوحة المطبخ"
        description="مراقبة التكاليف الحقيقية وأداء الوصفات"
      />

      <SummaryCards />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RiskRadarCard />
        <AIRecommendationsFeed />
      </div>
    </div>
  )
}
