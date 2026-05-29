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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">passroute</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {inlineError && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-4 py-3">
              <p className="text-sm text-rose-400">{inlineError}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">이메일</label>
            <Input
              {...register("email")}
              type="email"
              placeholder="name@example.com"
              className="h-11 border-border/50 bg-secondary/30"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-xs text-rose-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">비밀번호</label>
              <Link href="/find-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                비밀번호 찾기
              </Link>
            </div>
            <div className="relative">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
                className="h-11 border-border/50 bg-secondary/30 pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-400">{errors.password.message}</p>
            )}
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
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-3 text-muted-foreground">또는</span>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="space-y-3">
          <Link href="/find-email" className="block">
            <Button variant="outline" className="w-full h-11 text-sm font-medium border-border/50">
              이메일 찾기
            </Button>
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            계정이 없으신가요?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline transition-colors">
              회원가입
            </Link>
          </p>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-muted-foreground/60">
          로그인함으로써{" "}
          <Link href="#" className="underline hover:text-muted-foreground transition-colors">
            이용약관
          </Link>
          과{" "}
          <Link href="#" className="underline hover:text-muted-foreground transition-colors">
            개인정보처리방침
          </Link>
          에 동의합니다
        </p>
      </div>
    </div>
  )
}
