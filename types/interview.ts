export type InterviewType = "technical" | "personality"
export type InterviewFormat = "ONE_ON_ONE" | "DEBATE"
export type Difficulty = "low" | "middle" | "high"
export type PracticeMode = "practice" | "real"
export type SessionStatus = "PREPARING" | "PREPARE_FAILED" | "IN_PROGRESS" | "COMPLETED" | "ABORTED"

export interface InterviewSetupRequest {
  siId?: number
  resumeId?: number
  portfolioId?: number
  companyName: string
  jobPosition: string
  interviewType: InterviewType
  interviewMode: string
  interviewFormat: InterviewFormat
  aiInterviewer: string
  aiCompetitors?: string
  debateTopic?: string
  interviewCount?: number
  difficulty: Difficulty
  pressureLevel?: number
  followupCount?: number
}

export interface InterviewRoomResponse {
  roomId: number
}

export interface InterviewStartResponse {
  sessionId: number
  status: SessionStatus
}

export interface SessionQuestion {
  questionId: number
  questionText: string
  questionOrder: number
  audioUrl?: string
}

export interface AnswerSubmission {
  questionId: number
  answerText: string
  voiceData?: {
    filler_word_count: number
    wpm: number
  }
  videoUrl?: string
  clipScore?: number
  clipReason?: string
}

export interface AnswerProgressResponse {
  hasFollowUp: boolean
  followUpQuestionId?: number
  followUpQuestionText?: string
  lastQuestion: boolean
  audioUrl?: string
}
