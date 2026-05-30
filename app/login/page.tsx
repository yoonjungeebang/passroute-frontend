"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { loginSchema, type LoginInput } from "@/lib/auth-schemas"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [inlineError, setInlineError] = useState("")
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    setInlineError("")
    try {
      const response = await fetch(`/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setInlineError("이메일 또는 비밀번호를 확인해 주세요")
        } else if (response.status === 403) {
          setInlineError("탈퇴한 계정입니다")
        } else {
          setInlineError(result.message || "로그인에 실패했습니다")
        }
        return
      }

      localStorage.setItem("accessToken", result.data.accessToken)
      localStorage.setItem("refreshToken", result.data.refreshToken)
      router.push("/dashboard")
    } catch {
      setInlineError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.")
      return
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row min-h-[540px]">
        {/* Left Panel — Branding */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] p-10 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-[-60px] right-[-60px] w-60 h-60 rounded-full bg-white" />
            <div className="absolute bottom-[-40px] left-[-40px] w-48 h-48 rounded-full bg-white" />
            <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white tracking-tight">passroute</h2>
          </div>
          <div className="relative z-10">
            <p className="text-white/60 text-sm mb-2">AI 면접 코칭 플랫폼</p>
            <p className="text-white text-2xl font-bold leading-snug">
              면접 준비의<br />새로운 기준
            </p>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          {/* Mobile Logo */}
          <div className="md:hidden text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">passroute</h1>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[var(--color-text)]">로그인</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">계정 정보를 입력해 주세요</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {inlineError && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-4 py-3">
                <p className="text-sm text-rose-500">{inlineError}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">이메일</label>
              <Input
                {...register("email")}
                type="email"
                placeholder="name@example.com"
                className="h-11 border-[var(--color-border)] bg-[var(--color-bg)]"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs text-rose-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">비밀번호</label>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  className="h-11 border-[var(--color-border)] bg-[var(--color-bg)] pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <Link href="/find-password" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                비밀번호 찾기
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[var(--color-text-muted)]">또는</span>
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="space-y-3">
            <Link href="/find-email" className="block">
              <Button variant="outline" className="w-full h-11 text-sm font-medium border-[var(--color-border)]">
                이메일 찾기
              </Button>
            </Link>
            <p className="text-center text-sm text-[var(--color-text-muted)]">
              계정이 없으신가요?{" "}
              <Link href="/signup" className="font-medium text-[var(--color-primary)] hover:underline transition-colors">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
