import { apiFetch, getAuthHeaders } from "./client"
import type { Difficulty, PracticeMode } from "@/types/interview"

export interface PersonaVideoResponse {
  speakingVideoUrl: string
  silenceVideoUrl: string
}

export interface DebateTopic {
  id: number
  topicKey: string
  title: string
  description: string
  category: string
  proKeyPoints: string[]
  conKeyPoints: string[]
}

export interface DebatePersona {
  id: number
  personaKey: string
  name: string
  background: string
  debateStyle: string
  difficulty: string
  strengths: string[]
  weaknesses: string[]
  speakingVideoUrl: string
  silenceVideoUrl: string
}

export interface DebateSessionCreateResponse {
  sessionId: number
  mode: PracticeMode
  prepSeconds: number
  moderator: PersonaVideoResponse
  opponent: PersonaVideoResponse
}

export interface DebateTurnSummary {
  id: number
  speakerType: "USER" | "AI_COMPETITOR" | "AI_INTERVIEWER"
  round: string
  stance: "PRO" | "CON" | "NEUTRAL"
  content: string
  audioUrl?: string
  createdAt: string
  weightedScore?: number
  evalStrengths?: string
  evalImprovements?: string
}

export interface DebateStateResponse {
  sessionId: number
  mode: PracticeMode
  prepSeconds: number
  currentState: string
  awaitingDecision: boolean
  availableChoices: ("rebut_again" | "finish")[]
  version: number
  latestTurns: DebateTurnSummary[]
  moderator: PersonaVideoResponse
  opponent: PersonaVideoResponse
  waitingForUser: boolean
}

export async function getDebateTopics(category?: string): Promise<DebateTopic[]> {
  const query = category ? `?category=${category}` : ""
  return apiFetch<DebateTopic[]>(
    `/debate/topics${query}`,
    { method: "GET" },
    "토론 주제 조회에 실패했습니다"
  )
}

export async function getDebatePersonas(): Promise<DebatePersona[]> {
  return apiFetch<DebatePersona[]>(
    "/debate/personas",
    { method: "GET" },
    "토론 페르소나 조회에 실패했습니다"
  )
}

export async function createDebateSession(data: {
  topicId: number
  userStance: "PRO" | "CON"
  personaId: number
  difficulty: Difficulty
  mode: PracticeMode
  introId?: number
}): Promise<DebateSessionCreateResponse> {
  return apiFetch<DebateSessionCreateResponse>(
    "/debate/sessions",
    { method: "POST", body: JSON.stringify(data) },
    "토론 세션 생성에 실패했습니다"
  )
}

export async function startDebateSession(sessionId: number): Promise<void> {
  const response = await fetch(`/debate/${sessionId}/start`, {
    method: "POST",
    headers: getAuthHeaders(),
  })
  if (!response.ok && response.status !== 202) {
    throw new Error("토론 시작에 실패했습니다")
  }
}

export async function getDebateState(sessionId: number): Promise<DebateStateResponse> {
  return apiFetch<DebateStateResponse>(
    `/debate/${sessionId}/state`,
    { method: "GET" },
    "토론 상태 조회에 실패했습니다"
  )
}

export async function submitDebateTurn(sessionId: number, content: string, commit?: boolean): Promise<void> {
  const response = await fetch(`/debate/${sessionId}/turn`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ content, commit }),
  })
  if (!response.ok && response.status !== 202) {
    throw new Error("토론 턴 제출에 실패했습니다")
  }
}

export async function chooseBranch(sessionId: number, choice: "rebut_again" | "finish"): Promise<void> {
  const response = await fetch(`/debate/${sessionId}/branch`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ choice }),
  })
  if (!response.ok && response.status !== 202) {
    throw new Error("토론 분기 선택에 실패했습니다")
  }
}

export async function endDebateSession(sessionId: number): Promise<void> {
  const response = await fetch(`/debate/${sessionId}/end`, {
    method: "POST",
    headers: getAuthHeaders(),
  })
  if (!response.ok && response.status !== 202) {
    throw new Error("토론 종료에 실패했습니다")
  }
}

export interface DebateTopicCandidate {
  title: string
  description: string
  category: string
}

export interface DebateTopicSuggestResponse {
  candidates: DebateTopicCandidate[]
  newsCount: number
}

export async function suggestDebateTopics(data: {
  keywords?: string[]
  count?: number
  introId?: number
}): Promise<DebateTopicSuggestResponse> {
  return apiFetch<DebateTopicSuggestResponse>(
    "/debate/topics/suggest",
    { method: "POST", body: JSON.stringify(data) },
    "토론 주제 추천에 실패했습니다"
  )
}

export async function generateDebateTopic(data: {
  title: string
  description?: string
  category: "AI_ETHICS" | "RECRUITMENT" | "DEV_CULTURE" | "TECH_TREND"
  introId?: number
}): Promise<DebateTopic> {
  return apiFetch<DebateTopic>(
    "/debate/topics/generate",
    { method: "POST", body: JSON.stringify(data) },
    "토론 주제 생성에 실패했습니다"
  )
}

export interface DebateClipUploadUrlResponse {
  uploadUrl: string
  fileUrl: string
}

export async function getDebateClipUploadUrl(sessionId: number, questionId: number): Promise<DebateClipUploadUrlResponse> {
  return apiFetch<DebateClipUploadUrlResponse>(
    `/debate/${sessionId}/clip-upload-url?questionId=${questionId}`,
    { method: "GET" },
    "토론 클립 업로드 URL 발급에 실패했습니다"
  )
}

export interface DebateWorstClipResponse {
  videoUrl: string
  clipReason: string
}

export async function getDebateWorstClip(sessionId: number): Promise<DebateWorstClipResponse> {
  return apiFetch<DebateWorstClipResponse>(
    `/debate/${sessionId}/worst-clip`,
    { method: "GET" },
    "토론 클립 조회에 실패했습니다"
  )
}

export async function saveDebateWorstClip(sessionId: number, data: {
  questionId: number
  videoUrl: string
  clipScore: number
  clipReason?: string
}): Promise<void> {
  return apiFetch<void>(
    `/debate/${sessionId}/worst-clip`,
    { method: "POST", body: JSON.stringify(data) },
    "토론 클립 저장에 실패했습니다"
  )
}
