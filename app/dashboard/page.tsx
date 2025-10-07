import { ChatInterface } from "@/components/chat-interface"
import { DashboardAnalytics } from "@/components/dashboard-analytics"

export default function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h1 className="text-3xl font-bold mb-6">CRM Dashboard</h1>
              <DashboardAnalytics />
            </div>
            <div>
              <ChatInterface />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}