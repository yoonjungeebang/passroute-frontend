"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Brain } from "lucide-react"
import { getCsTopicAnalysis, type CsTopicAnalysisResponse } from "@/lib/api/interview"

const topicLabel: Record<string, string> = {
  DATA_STRUCTURE: "자료구조",
  ALGORITHM: "알고리즘",
  NETWORK: "네트워크",
  OS: "운영체제",
  DATABASE: "데이터베이스",
  CONCURRENCY: "동시성",
  MEMORY_GC: "메모리/GC",
  LANGUAGE: "프로그래밍 언어",
  FRAMEWORK: "프레임워크",
  DESIGN_PATTERN: "디자인 패턴",
  SECURITY: "보안",
}

export function CsTopicAnalysis() {
  const [data, setData] = useState<CsTopicAnalysisResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCsTopicAnalysis()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card className="border-border bg-white">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.topics.length === 0) return null

  return (
    <Card className="border-border bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Brain className="h-4 w-4 text-muted-foreground" />
          CS 토픽 분석
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.weakTopics.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">취약 토픽</p>
            <div className="flex flex-wrap gap-1.5">
              {data.weakTopics.map(t => (
                <Badge key={t.topic} variant="outline" className="border-rose-200 bg-rose-50 text-rose-600 text-xs">
                  {topicLabel[t.topic] ?? t.topic} ({t.averagePercentage.toFixed(0)}%)
                </Badge>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          {data.topics.slice(0, 6).map(t => (
            <div key={t.topic}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{topicLabel[t.topic] ?? t.topic}</span>
                <span className="text-xs font-medium text-foreground">{t.averagePercentage.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${t.averagePercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
