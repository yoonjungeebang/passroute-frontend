"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowRight, Mail } from "lucide-react"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/auth-schemas"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const email = watch("email")

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true)
    try {
      // TODO: API 호출
      console.log("[v0] Forgot password attempt:", data)
      setEmailSent(true)
    } catch (error) {
      console.error("[v0] Forgot password error:", error)
    } finally {
      setIsLoading(false)
    }
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
              {emailSent ? "확인 이메일을 확인하세요" : "비밀번호 찾기"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {emailSent 
                ? `${email} 주소로 비밀번호 재설정 링크를 보냈습니다`
                : "계정에 연결된 이메일 주소를 입력해주세요"
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!emailSent ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    이메일
                  </label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="name@example.com"
                    className="border-border/50 bg-secondary/30"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-400">{errors.email.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full gap-2 bg-gradient-to-r from-primary to-violet-600 py-6 text-base font-semibold text-white shadow-lg shadow-primary/30 hover:opacity-90"
                >
                  {isLoading ? (
                    <>전송 중...</>
                  ) : (
                    <>
                      확인 이메일 받기
                      <Mail className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                </div>

                <div className="space-y-3 text-center">
                  <p className="text-sm text-muted-foreground">
                    받은편지함을 확인하고 비밀번호 재설정 링크를 클릭해주세요
                  </p>
                  <p className="text-xs text-muted-foreground">
                    이메일이 도착하지 않으면 스팸 폴더를 확인해주세요
                  </p>
                </div>

                <Button
                  onClick={() => setEmailSent(false)}
                  variant="outline"
                  className="w-full border-border/50"
                >
                  다시 시도
                </Button>
              </div>
            )}

            {/* Back to Login */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              <Link
                href="/login"
                className="font-medium text-primary hover:text-violet-400 transition-colors"
              >
                로그인으로 돌아가기
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
