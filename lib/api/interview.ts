import { apiFetch, getAuthHeaders } from "./client"
import type {
  InterviewSetupRequest,
  InterviewRoomResponse,
  InterviewStartResponse,
  AnswerSubmission,
  AnswerProgressResponse,
  SessionQuestion,
} from "@/types/interview"

export async function setupInterview(data: InterviewSetupRequest): Promise<InterviewRoomResponse> {
  return apiFetch<InterviewRoomResponse>("/interview/setup", {
    method: "POST",
    body: JSON.stringify(data),
  }, "면접 설정에 실패했습니다")
}

export async function startInterview(roomId: number): Promise<InterviewStartResponse> {
  return apiFetch<InterviewStartResponse>("/interview/start", {
    method: "POST",
    body: JSON.stringify({ roomId }),
  }, "면접 시작에 실패했습니다")
}

export async function getSessionQuestions(sessionId: number): Promise<SessionQuestion[]> {
  const result = await apiFetch<{ questions: SessionQuestion[] }>(
    `/interview/sessions/${sessionId}/questions`,
    { method: "GET" },
    "질문 목록 조회에 실패했습니다"
  )
  return result.questions
}

export async function submitAnswer(
  sessionId: number,
  data: AnswerSubmission
): Promise<AnswerProgressResponse> {
  return apiFetch<AnswerProgressResponse>(
    `/interview/sessions/${sessionId}/answers`,
    { method: "POST", body: JSON.stringify(data) },
    "답변 제출에 실패했습니다"
  )
}

export async function endInterview(sessionId: number): Promise<void> {
  const response = await fetch(`/interview/sessions/${sessionId}/end`, {
    method: "POST",
    headers: getAuthHeaders(),
  })
  // 202 Accepted - 리포트 비동기 생성
  if (!response.ok && response.status !== 202) {
    throw new Error("면접 종료에 실패했습니다")
  }
}

export interface WorstClipResponse {
  videoUrl: string
  clipReason: string
}

export async function getWorstClip(sessionId: number): Promise<WorstClipResponse> {
  return apiFetch<WorstClipResponse>(
    `/interview/sessions/${sessionId}/worst-clip`,
    { method: "GET" },
    "클립 조회에 실패했습니다"
  )
}

export async function saveWorstClip(sessionId: number, data: {
  questionId: number
  videoUrl: string
  clipScore: number
  clipReason?: string
}): Promise<void> {
  return apiFetch<void>(
    `/interview/sessions/${sessionId}/worst-clip`,
    { method: "POST", body: JSON.stringify(data) },
    "클립 저장에 실패했습니다"
  )
}

export interface ClipUploadUrlResponse {
  uploadUrl: string
  fileUrl: string
}

export async function getClipUploadUrl(sessionId: number, questionId: number): Promise<ClipUploadUrlResponse> {
  return apiFetch<ClipUploadUrlResponse>(
    `/interview/sessions/${sessionId}/clip-upload-url?questionId=${questionId}`,
    { method: "GET" },
    "클립 업로드 URL 발급에 실패했습니다"
  )
}

export function subscribePreparationEvents(
  sessionId: number,
  onMessage: (event: MessageEvent) => void,
  onError?: (event: Event) => void
): EventSource {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
  const url = `/interview/sessions/${sessionId}/preparation-events${token ? `?token=${token}` : ""}`
  const eventSource = new EventSource(url)
  eventSource.onmessage = onMessage
  if (onError) eventSource.onerror = onError
  return eventSource
}

export function subscribeCrawlEvents(
  roomId: number,
  onMessage: (event: MessageEvent) => void,
  onError?: (event: Event) => void
): EventSource {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
  const url = `/interview/rooms/${roomId}/crawl-events${token ? `?token=${token}` : ""}`
  const eventSource = new EventSource(url)
  eventSource.onmessage = onMessage
  if (onError) eventSource.onerror = onError
  return eventSource
}

export interface TopicStat {
  topic: string
  questionCount: number
  averagePercentage: number
  recommendation: string
}

export interface CsTopicAnalysisResponse {
  topics: TopicStat[]
  weakTopics: TopicStat[]
}

export async function getCsTopicAnalysis(): Promise<CsTopicAnalysisResponse> {
  return apiFetch<CsTopicAnalysisResponse>(
    "/interview/cs-topics/analysis",
    { method: "GET" },
    "CS 토픽 분석 조회에 실패했습니다"
  )
}
