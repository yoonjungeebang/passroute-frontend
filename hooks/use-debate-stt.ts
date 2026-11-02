"use client"

import { useState, useEffect, useRef, useCallback } from "react"

type RoundType = "OPENING" | "REBUTTAL_1" | "REBUTTAL_2" | "CLOSING"

interface UseDebateSTTParams {
  sessionId: number
  roundType: RoundType
  stream: MediaStream | null
  active: boolean
}

interface UseDebateSTTReturn {
  transcript: string
  wpm: number
  fillerCount: number
  audioLevel: number
  silenceSec: number
  feedback: string | null
  error: string | null
}

export function useDebateSTT({ sessionId, roundType, stream, active }: UseDebateSTTParams): UseDebateSTTReturn {
  const [transcript, setTranscript] = useState("")
  const [wpm, setWpm] = useState(0)
  const [fillerCount, setFillerCount] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [silenceSec, setSilenceSec] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const workletNodeRef = useRef<AudioWorkletNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number>(0)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const cleanup = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    if (wsRef.current) {
      wsRef.current.close(1000)
      wsRef.current = null
    }
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect()
      workletNodeRef.current = null
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect()
      analyserRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close()
      audioCtxRef.current = null
    }
    setAudioLevel(0)
  }, [])

  useEffect(() => {
    if (!active || !stream || !roundType) {
      cleanup()
      return
    }

    let cancelled = false
    const aiServerUrl = process.env.NEXT_PUBLIC_AI_WS_URL

    async function start() {
      try {
        const audioCtx = new AudioContext({ sampleRate: 48000 })
        audioCtxRef.current = audioCtx

        await audioCtx.audioWorklet.addModule("/audio-worklet-processor.js")

        if (cancelled) { audioCtx.close(); return }

        const source = audioCtx.createMediaStreamSource(stream!)
        const workletNode = new AudioWorkletNode(audioCtx, "pcm-processor", {
          processorOptions: { sampleRate: audioCtx.sampleRate },
        })
        workletNodeRef.current = workletNode

        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 256
        analyserRef.current = analyser

        source.connect(analyser)
        source.connect(workletNode)
        workletNode.connect(audioCtx.destination)

        const freqData = new Uint8Array(analyser.frequencyBinCount)
        const updateLevel = () => {
          if (cancelled) return
          analyser.getByteFrequencyData(freqData)
          const avg = freqData.reduce((a, b) => a + b, 0) / freqData.length
          setAudioLevel(Math.min(100, avg * 2))
          rafRef.current = requestAnimationFrame(updateLevel)
        }
        updateLevel()

        const ws = new WebSocket(`${aiServerUrl}/ws/stt/debate/${sessionId}/${roundType}`)
        wsRef.current = ws

        ws.onopen = () => {
          workletNode.port.onmessage = (e: MessageEvent) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(e.data as ArrayBuffer)
            }
          }
        }

        ws.onmessage = (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data as string)
            if (data.status === "completed") {
              setTranscript(data.text || "")
              if (data.wpm) setWpm(data.wpm)
              if (data.filler_count !== undefined) setFillerCount(data.filler_count)
              setSilenceSec(0)
            } else if (data.status === "silence") {
              setSilenceSec(data.silence_sec ?? 0)
            } else if (data.status === "feedback") {
              setFeedback(data.message || null)
              clearTimeout(feedbackTimerRef.current)
              feedbackTimerRef.current = setTimeout(() => setFeedback(null), 3000)
            } else if (data.status === "error") {
              setError(data.message || "STT 오류가 발생했습니다")
            }
          } catch { /* ignore parse errors */ }
        }

        ws.onerror = () => { /* silent */ }
      } catch { /* AudioContext error */ }
    }

    start()

    return () => {
      cancelled = true
      clearTimeout(feedbackTimerRef.current)
      cleanup()
    }
  }, [active, sessionId, roundType, stream, cleanup])

  useEffect(() => {
    setTranscript("")
    setWpm(0)
    setFillerCount(0)
    setSilenceSec(0)
    setFeedback(null)
    setError(null)
  }, [roundType])

  return { transcript, wpm, fillerCount, audioLevel, silenceSec, feedback, error }
}
