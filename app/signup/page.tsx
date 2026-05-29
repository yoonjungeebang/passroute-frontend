"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Check, X, Loader2, ChevronLeft, Plus, Trash2 } from "lucide-react"
import { phoneVerificationSchema, signupStep2Schema, signupStep3Schema, type PhoneVerificationInput, type SignupStep2Input, type SignupStep3Input } from "@/lib/auth-schemas"
import { formatPhoneNumber, parsePhoneNumber, validatePassword, JOB_TYPES, EXPERIENCE_YEARS } from "@/lib/auth-config"

type SignupStep = 1 | 2 | 3

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<SignupStep>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [inlineError, setInlineError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState({ valid: false, errors: [] as string[] })

  const [formData, setFormData] = useState({
    phone: "",
    code: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    experienceYears: 0,
    preferredJobTypes: [] as string[],
    preferredCompanies: [] as string[],
  })

  const step1Form = useForm<PhoneVerificationInput>({
    resolver: zodResolver(phoneVerificationSchema),
    defaultValues: { phone: formData.phone, code: formData.code },
  })

  const step2Form = useForm<SignupStep2Input>({
    resolver: zodResolver(signupStep2Schema),
    defaultValues: { name: formData.name, email: formData.email, password: formData.password, confirmPassword: formData.confirmPassword },
  })

  const step3Form = useForm<SignupStep3Input>({
    resolver: zodResolver(signupStep3Schema),
    defaultValues: { experienceYears: formData.experienceYears, preferredJobTypes: formData.preferredJobTypes, preferredCompanies: formData.preferredCompanies },
  })

  const handleSendCode = async () => {
    const phoneValue = step1Form.watch("phone")
    if (!phoneValue) {
      step1Form.setError("phone", { message: "휴대폰 번호를 입력해주세요" })
      return
    }

    setIsLoading(true)
    setInlineError("")
    try {
      const response = await fetch(`/auth/phone/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: parsePhoneNumber(phoneValue) }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 400 && result.code === "ALREADY_REGISTERED") {
          setInlineError("이미 가입된 휴대폰 번호입니다")
        } else {
          setInlineError(result.message || "인증 발송에 실패했습니다")
        }
        return
      }

      setCodeSent(true)
      setCountdown(180)

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setCodeSent(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch {
      setInlineError("네트워크 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    const isValid = await step1Form.trigger()
    if (!isValid) return

    const { phone, code } = step1Form.getValues()
    setIsLoading(true)
    setInlineError("")

    try {
      const response = await fetch(`/auth/phone/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: parsePhoneNumber(phone), code }),
      })

      if (!response.ok) {
        setInlineError("인증번호가 올바르지 않습니다")
        return
      }

      setFormData(prev => ({ ...prev, phone: parsePhoneNumber(phone) }))
      setStep(2)
    } catch {
      setInlineError("네트워크 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStep2Submit = async () => {
    const isValid = await step2Form.trigger()
    if (!isValid) return

    const { name, email, password, confirmPassword } = step2Form.getValues()
    setFormData(prev => ({ ...prev, name, email, password, confirmPassword }))
    setStep(3)
  }

  const handleCompleteSignup = async (skipJobInfo: boolean = false) => {
    if (!skipJobInfo) {
      const isValid = await step3Form.trigger()
      if (!isValid) return
    }

    const { experienceYears, preferredJobTypes, preferredCompanies } = step3Form.getValues()

    setIsLoading(true)
    setInlineError("")

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        experienceYears: experienceYears || undefined,
        preferredJobTypes: preferredJobTypes?.length ? preferredJobTypes : undefined,
        preferredCompanies: preferredCompanies?.length ? preferredCompanies : undefined,
      }

      const response = await fetch(`/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setInlineError("이미 사용 중인 이메일입니다")
          setStep(2)
        } else if (response.status === 400 && result.code === "PHONE_NOT_VERIFIED") {
          setInlineError("휴대폰 인증을 다시 진행해 주세요")
          setStep(1)
        } else {
          setInlineError(result.message || "회원가입에 실패했습니다")
        }
        return
      }

      router.push("/login?signup=success")
    } catch {
      setInlineError("네트워크 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const passwordValue = step2Form.watch("password")
  if (passwordValue) {
    const strength = validatePassword(passwordValue)
    if (JSON.stringify(strength) !== JSON.stringify(passwordStrength)) {
      setPasswordStrength(strength)
    }
  }

  const passwordConfirmValue = step2Form.watch("confirmPassword")
  const passwordsMatch = passwordValue && passwordConfirmValue && passwordValue === passwordConfirmValue

  const stepLabels = ["본인 인증", "기본 정보", "직무 정보"]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">passroute</h1>
        </div>

        {/* Step Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            {stepLabels.map((label, i) => (
              <span
                key={label}
                className={`text-xs font-medium transition-colors ${
                  i + 1 <= step ? "text-primary" : "text-muted-foreground/40"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-border/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Error */}
        {inlineError && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-4 py-3">
            <p className="text-sm text-rose-400">{inlineError}</p>
          </div>
        )}

        {/* STEP 1: Phone Verification */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">휴대폰 번호 인증</h2>
              <p className="text-sm text-muted-foreground mt-0.5">본인 확인을 위해 휴대폰 번호를 인증해 주세요</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">휴대폰 번호</label>
                <div className="flex gap-2">
                  <Input
                    {...step1Form.register("phone")}
                    type="tel"
                    placeholder="010-0000-0000"
                    className="h-11 flex-1 border-border/50 bg-secondary/30"
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value)
                      step1Form.setValue("phone", formatted)
                    }}
                    disabled={codeSent || isLoading}
                  />
                  <Button
                    type="button"
                    onClick={handleSendCode}
                    disabled={codeSent || isLoading}
                    variant="outline"
                    className="h-11 shrink-0 border-border/50"
                  >
                    {codeSent ? formatCountdown(countdown) : "인증 발송"}
                  </Button>
                </div>
                {step1Form.formState.errors.phone && (
                  <p className="text-xs text-rose-400">{step1Form.formState.errors.phone.message}</p>
                )}
              </div>

              {codeSent && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">인증번호</label>
                    <Input
                      {...step1Form.register("code")}
                      type="text"
                      placeholder="인증번호 6자리"
                      maxLength={6}
                      className="h-11 border-border/50 bg-secondary/30 tracking-widest text-center text-lg"
                      disabled={isLoading}
                    />
                    {step1Form.formState.errors.code && (
                      <p className="text-xs text-rose-400">{step1Form.formState.errors.code.message}</p>
                    )}
                    {countdown > 0 && countdown < 30 && (
                      <p className="text-xs text-rose-400">
                        인증번호가 {formatCountdown(countdown)} 후 만료됩니다
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={isLoading}
                    className="w-full h-11 text-sm font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        확인 중...
                      </>
                    ) : (
                      "인증 확인"
                    )}
                  </Button>
                </>
              )}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline transition-colors">
                로그인
              </Link>
            </p>
          </div>
        )}

        {/* STEP 2: Basic Info */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep(1)}
                className="p-1 -ml-1 rounded-md hover:bg-secondary transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <h2 className="text-lg font-semibold text-foreground">기본 정보 입력</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">이름</label>
                <Input
                  {...step2Form.register("name")}
                  placeholder="실명을 입력하세요"
                  className="h-11 border-border/50 bg-secondary/30"
                  disabled={isLoading}
                />
                {step2Form.formState.errors.name && (
                  <p className="text-xs text-rose-400">{step2Form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">이메일</label>
                <Input
                  {...step2Form.register("email")}
                  type="email"
                  placeholder="name@example.com"
                  className="h-11 border-border/50 bg-secondary/30"
                  disabled={isLoading}
                />
                {step2Form.formState.errors.email && (
                  <p className="text-xs text-rose-400">{step2Form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">비밀번호</label>
                <div className="relative">
                  <Input
                    {...step2Form.register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="8~20자 영문/숫자/특수문자"
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
                {passwordValue && (
                  <div className="space-y-0.5">
                    {passwordStrength.errors.map((error) => (
                      <p key={error} className="text-xs text-rose-400 flex items-center gap-1">
                        <X className="h-3 w-3 shrink-0" /> {error}
                      </p>
                    ))}
                    {passwordStrength.valid && (
                      <p className="text-xs text-emerald-500 flex items-center gap-1">
                        <Check className="h-3 w-3" /> 안전한 비밀번호입니다
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">비밀번호 확인</label>
                <div className="relative">
                  <Input
                    {...step2Form.register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="비밀번호를 한 번 더 입력하세요"
                    className="h-11 border-border/50 bg-secondary/30 pr-16"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {passwordConfirmValue && (
                      passwordsMatch
                        ? <Check className="h-4 w-4 text-emerald-500" />
                        : <X className="h-4 w-4 text-rose-400" />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {step2Form.formState.errors.confirmPassword && (
                  <p className="text-xs text-rose-400">{step2Form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="button"
                onClick={handleStep2Submit}
                disabled={isLoading || !passwordStrength.valid || !passwordsMatch}
                className="w-full h-11 text-sm font-semibold"
              >
                다음
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Job Info */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep(2)}
                className="p-1 -ml-1 rounded-md hover:bg-secondary transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-foreground">직무 정보</h2>
                <p className="text-xs text-muted-foreground">선택사항 - 맞춤형 면접을 위해 알려주세요</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Experience */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">경력</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(EXPERIENCE_YEARS).map(([years, label]) => (
                    <button
                      key={years}
                      type="button"
                      onClick={() => step3Form.setValue("experienceYears", parseInt(years))}
                      className={`h-10 rounded-lg border text-sm font-medium transition-all ${
                        step3Form.watch("experienceYears") === parseInt(years)
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-border/50 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Types */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">희망 직무</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(JOB_TYPES).map(([key, label]) => {
                    const selected = (step3Form.watch("preferredJobTypes") || []).includes(key)
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          const current = step3Form.watch("preferredJobTypes") || []
                          const updated = current.includes(key)
                            ? current.filter(t => t !== key)
                            : [...current, key]
                          step3Form.setValue("preferredJobTypes", updated)
                        }}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                          selected
                            ? "bg-primary/10 border-primary text-primary"
                            : "border-border/50 text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Companies */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">희망 기업</label>
                {(step3Form.watch("preferredCompanies") || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(step3Form.watch("preferredCompanies") || []).map((company, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        {company}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (step3Form.watch("preferredCompanies") || []).filter((_, i) => i !== idx)
                            step3Form.setValue("preferredCompanies", updated)
                          }}
                          className="hover:text-primary/70"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    id="company-input"
                    placeholder="기업명 입력 후 Enter"
                    className="h-10 flex-1 border-border/50 bg-secondary/30 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                        e.preventDefault()
                        const value = (e.target as HTMLInputElement).value.trim()
                        if (value) {
                          const current = step3Form.watch("preferredCompanies") || []
                          step3Form.setValue("preferredCompanies", [...current, value])
                          ;(e.target as HTMLInputElement).value = ""
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-10 w-10 shrink-0 border-border/50"
                    onClick={() => {
                      const input = document.getElementById("company-input") as HTMLInputElement
                      const value = input?.value.trim()
                      if (value) {
                        const current = step3Form.watch("preferredCompanies") || []
                        step3Form.setValue("preferredCompanies", [...current, value])
                        input.value = ""
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  onClick={() => handleCompleteSignup(true)}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1 h-11 text-sm border-border/50"
                >
                  건너뛰기
                </Button>
                <Button
                  type="button"
                  onClick={() => handleCompleteSignup(false)}
                  disabled={isLoading}
                  className="flex-1 h-11 text-sm font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      가입 중...
                    </>
                  ) : (
                    "가입 완료"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
