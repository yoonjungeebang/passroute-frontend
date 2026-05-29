"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Mic, BarChart3, MessageCircle } from "lucide-react"

interface HeroSectionProps {
  onStartInterview: () => void
}

const features = [
  {
    icon: Mic,
    title: "AI 모의면접",
    desc: "실전과 동일한 환경에서 AI 면접관과 대화형 면접 연습",
  },
  {
    icon: MessageCircle,
    title: "심층 꼬리질문",
    desc: "자소서 기반 실제 면접에서 나올 법한 꼬리질문 생성",
  },
  {
    icon: BarChart3,
    title: "실시간 분석 리포트",
    desc: "시선, 음성, 답변 구조를 멀티모달로 분석 코칭",
  },
]

export function HeroSection({ onStartInterview }: HeroSectionProps) {
  return (
    <div className="space-y-5 animate-page-enter">
      {/* Main CTA Banner */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-white p-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(circle, #3E3630 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }} />
          <div className="absolute -right-8 -top-8 h-56 w-56 rounded-full border border-primary/10 animate-float" />
          <div className="absolute -right-4 -top-4 h-40 w-40 rounded-full border border-primary/5 animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute -bottom-6 right-1/4 h-32 w-32 rounded-full bg-primary/[0.03] animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary/40 via-primary/10 to-transparent rounded-full" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary">AI 면접 코칭</span>
            </div>
            <h2 className="text-2xl font-bold leading-tight text-foreground lg:text-3xl">
              혼자 준비하기 어려웠던 면접,<br />
              <span className="text-primary">PASSROUTE와 함께 돌파하세요</span>
            </h2>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
              AI가 질문하고, 분석하고, 성장을 돕습니다.
            </p>
          </div>

          <Button
            onClick={onStartInterview}
            className="gap-2 bg-foreground px-7 py-6 text-sm font-semibold text-background hover:bg-foreground/90 transition-all shadow-lg shadow-foreground/10"
          >
            면접 시작하기
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {features.map((feature, i) => (
          <div
            key={feature.title}
            className="group relative overflow-hidden rounded-xl border border-border bg-white p-5 card-hover"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="absolute left-0 top-0 h-full w-0.5 bg-primary/0 transition-all duration-300 group-hover:bg-primary/40" />
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:scale-110">
              <feature.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-foreground">{feature.title}</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
