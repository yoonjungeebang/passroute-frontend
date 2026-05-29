"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileHeader } from "@/components/dashboard/mobile-header"
import { UpcomingSchedule } from "@/components/dashboard/upcoming-schedule"
import { SupportMaterials } from "@/components/dashboard/support-materials"
import { DocumentAssets } from "@/components/dashboard/document-assets"
import { InterviewHistory } from "@/components/dashboard/interview-history"
import { InterviewModal } from "@/components/dashboard/interview-modal"
import { HeroSection } from "@/components/dashboard/hero-section"

function DashboardContent() {
  const searchParams = useSearchParams()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const startInterviewId = searchParams?.get("startInterview")
  const prefillData = startInterviewId ? {
    introId: Number(startInterviewId),
    stage: "technical",
    mode: "one-on-one",
    practiceMode: "practice" as const,
    personas: ["TEAM_LEAD"],
  } : null

  useEffect(() => {
    if (startInterviewId) {
      setIsModalOpen(true)
    }
  }, [startInterviewId])

  const handleStartInterview = () => {
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileHeader />

      <main className="pt-14 lg:pl-64 lg:pt-0">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="animate-stagger space-y-6 pb-24">
            <HeroSection onStartInterview={handleStartInterview} />
            <UpcomingSchedule />
            <SupportMaterials />
            <DocumentAssets />
            <InterviewHistory />
          </div>
        </div>
      </main>

      <InterviewModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        prefillData={prefillData}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  )
}
