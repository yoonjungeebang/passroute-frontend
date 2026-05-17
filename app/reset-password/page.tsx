"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowRight, Check, Lock } from "lucide-react"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/auth-schemas"
import { validatePassword } from "@/lib/auth-config"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")
  
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ valid: false, errors: [] as string[] })
  const [isValidToken, setIsValidToken] = useState(true)
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const password = watch("password")

  useEffect(() => {
    if (!token || !email) {
      setIsValidToken(false)
    }
  }, [token, email])

  const onPasswordChange = (value: string) => {
    const strength = validatePassword(value)
    setPasswordStrength(strength)
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!passwordStrength.valid || !token) return
    
    setIsLoading(true)
    try {
      // TODO: API 호출
      console.log("[v0] Reset password attempt:", { token, email, password: data.password })
      setIsComplete(true)
    } catch (error) {
      console.error("[v0] Reset password error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">InterviewAI</span>
          </div>

          {/* Error Card */}
          <Card className="border-border/50 bg-card border-rose-500/30">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold text-foreground">
                유효하지 않은 링크
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button
                onClick={() => router.push("/forgot-password")}
                className="w-full gap-2 bg-gradient-to-r from-primary to-violet-600 py-6 text-base font-semibold text-white"
              >
                다시 요청하기
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-600">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">InterviewAI</span>
        </div>

        {/* Form Card */}
        <Card className="border-border/50 bg-card">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              {isComplete ? "비밀번호가 재설정되었습니다" : "새 비밀번호 설정"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isComplete 
                ? "로그인하여 면접 준비를 계속하세요"
                : "새로운 비밀번호를 설정해주세요"
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!isComplete ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    새 비밀번호
                  </label>
                  <Input
                    {...register("password", {
                      onChange: (e) => onPasswordChange(e.target.value),
                    })}
                    type="password"
                    placeholder="••••••••"
                    className="border-border/50 bg-secondary/30"
                    disabled={isLoading}
                  />
                  {password && (
                    <div className="space-y-2">
                      {passwordStrength.errors.map((error) => (
                        <p key={error} className="text-xs text-rose-400">• {error}</p>
                      ))}
                      {passwordStrength.valid && (
                        <div className="flex items-center gap-1 text-xs text-emerald-400">
                          <Check className="h-3 w-3" />
                          강력한 비밀번호입니다
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    비밀번호 확인
                  </label>
                  <Input
                    {...register("confirmPassword")}
                    type="password"
                    placeholder="••••••••"
                    className="border-border/50 bg-secondary/30"
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-rose-400">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !passwordStrength.valid}
                  className="w-full gap-2 bg-gradient-to-r from-primary to-violet-600 py-6 text-base font-semibold text-white shadow-lg shadow-primary/30 hover:opacity-90 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>설정 중...</>
                  ) : (
                    <>
                      비밀번호 설정
                      <Lock className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                    <Check className="h-8 w-8 text-emerald-400" />
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  비밀번호가 성공적으로 변경되었습니다. 새로운 비밀번호로 로그인해주세요
                </p>

                <Button
                  onClick={() => router.push("/login")}
                  className="w-full gap-2 bg-gradient-to-r from-primary to-violet-600 py-6 text-base font-semibold text-white"
                >
                  로그인하기
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
