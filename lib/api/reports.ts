import { apiFetch, getAuthHeaders } from "./client"
import type { InterviewReportResponse, DebateReportResponse } from "@/types/report"

export interface ReportListItem {
  reportType: string
  domainId: number
  interviewType: string
  companyName: string
  jobPosition: string
  date: string
  totalScore: number
  feedbackPreview: string
  selfIntroId: number | null
}

export interface ReportListResponse {
  items: ReportListItem[]
  page: number
  size: number
  total: number
}

export async function getReportList(params?: {
  type?: "all" | "interview" | "debate"
  page?: number
  size?: number
  q?: string
  resumeId?: number
}): Promise<ReportListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.type) searchParams.set("type", params.type)
  if (params?.page !== undefined) searchParams.set("page", String(params.page))
  if (params?.size !== undefined) searchParams.set("size", String(params.size))
  if (params?.q) searchParams.set("q", params.q)
  if (params?.resumeId !== undefined) searchParams.set("resumeId", String(params.resumeId))

  const query = searchParams.toString()
  return apiFetch<ReportListResponse>(
    `/reports${query ? `?${query}` : ""}`,
    { method: "GET" },
    "리포트 목록 조회에 실패했습니다"
  )
}

export async function getInterviewReport(sessionId: number): Promise<InterviewReportResponse | null> {
  const response = await fetch(`/reports/interview/${sessionId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  })

  if (response.status === 202) return null // 아직 생성 중
  if (!response.ok) throw new Error("리포트 조회에 실패했습니다")

  const contentType = response.headers.get("content-type")
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("리포트 조회에 실패했습니다")
  }

  const result = await response.json()
  return result.data
}

export async function getDebateReport(sessionId: number): Promise<DebateReportResponse | null> {
  const response = await fetch(`/reports/debate/${sessionId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  })

  if (response.status === 202) return null
  if (!response.ok) throw new Error("토론 리포트 조회에 실패했습니다")

  const contentType = response.headers.get("content-type")
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("토론 리포트 조회에 실패했습니다")
  }

  const result = await response.json()
  return result.data
}

export interface UpcomingReportItem {
  scheduleId: number
  companyName: string
  jobPosition: string
  interviewType: string
  scheduledAt: string
  daysUntil: number
  selfIntroId: number | null
  selfIntroFilename: string | null
  previousReports: PrevReportSummary[]
  aiFeedback: string | null
}

export interface PrevReportSummary {
  [key: string]: unknown
}

export interface UpcomingReportResponse {
  items: UpcomingReportItem[]
}

export async function getUpcomingReports(): Promise<UpcomingReportResponse> {
  return apiFetch<UpcomingReportResponse>(
    "/reports/upcoming",
    { method: "GET" },
    "다가오는 면접 리포트 조회에 실패했습니다"
  )
}

export interface SelfIntroReportResponse {
  selfIntroId: number
  companyName: string
  jobPosition: string
  totalSessions: number
  hasTrendData: boolean
  scoreTimeline: SessionScorePoint[]
  overallAverage: number
  itemAverages: Record<string, number>
  itemTrend: ItemTrendItem[]
  bestSession: SessionSummary | null
  worstSession: SessionSummary | null
  topRecommendedQuestions: RecommendedQuestionCount[]
  readiness: ReadinessInfo | null
  growthSummary: string | null
  aiSummary: AiSummary | null
}

export interface SessionScorePoint {
  sessionId: number
  round: number
  score: number
  date: string
}

export interface ItemTrendItem {
  item: string
  firstAvg: number
  lastAvg: number
  diff: number
  direction: "UP" | "STABLE" | "DOWN"
}

export interface SessionSummary {
  sessionId: number
  round: number
  score: number
  strengths: string
  weaknesses: { item: string; comment: string }[]
  date: string
}

export interface RecommendedQuestionCount {
  text: string
  count: number
}

export interface ReadinessInfo {
  level: "READY" | "NEEDS_REVIEW" | "NEEDS_IMPROVEMENT"
  comment: string
}

export interface AiSummary {
  overall: string
  repeatedWeakness: string
  nextSteps: string
}

export async function getSelfIntroReport(selfIntroId: number): Promise<SelfIntroReportResponse> {
  return apiFetch<SelfIntroReportResponse>(
    `/reports/self-intro/${selfIntroId}`,
    { method: "GET" },
    "자소서 리포트 조회에 실패했습니다"
  )
}

export async function deleteInterviewReport(sessionId: number): Promise<void> {
  return apiFetch<void>(
    `/reports/interview/${sessionId}`,
    { method: "DELETE" },
    "면접 리포트 삭제에 실패했습니다"
  )
}

export async function deleteDebateReport(sessionId: number): Promise<void> {
  return apiFetch<void>(
    `/reports/debate/${sessionId}`,
    { method: "DELETE" },
    "토론 리포트 삭제에 실패했습니다"
  )
}
