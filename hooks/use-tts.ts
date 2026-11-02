"use client"

import { useState, useRef, useCallback } from "react"

interface UseTTSReturn {
  play: (url: string) => Promise<void>
  stop: () => void
  playing: boolean
}

export function useTTS(): UseTTSReturn {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    setPlaying(false)
  }, [])

  const play = useCallback(async (url: string) => {
    stop()
    const audio = new Audio(url)
    audioRef.current = audio

    setPlaying(true)
    audio.onended = () => {
      audioRef.current = null
      setPlaying(false)
    }
    audio.onerror = () => {
      audioRef.current = null
      setPlaying(false)
    }

    try {
      await audio.play()
    } catch {
      audioRef.current = null
      setPlaying(false)
    }
  }, [stop])

  return { play, stop, playing }
}
