'use client'

import Button from '@/app/components/Button'
import Input from '@/app/components/inputs/Input'
import { useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import AuthSocialButton from './AuthSocialButton'
import { BsGithub, BsGoogle } from 'react-icons/bs'

type Variant = 'LOGIN' | 'REGISTER'

export default function AuthForm() {
  const [variant, setVariant] = useState<Variant>('LOGIN')
  const [isLoading, setIsLoading] = useState(false)

  const toggleVariant = useCallback(() => {
    if (variant === 'LOGIN') {
      setVariant('REGISTER')
    } else {
      setVariant('LOGIN')
    }
  }, [variant])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true)

    if (variant === 'REGISTER') {
      // Axios 회원가입 코드
    }

    if (variant === 'LOGIN') {
      // NextAuth 로그인 코드
    }
  }

  const socialAction = (action: string) => {
    setIsLoading(true)

    // NextAuth 소셜 로그인 코드
  }

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {variant === 'REGISTER' && (
            <Input
              id="username"
              label="이름"
              register={register}
              errors={errors}
            />
          )}
          <Input
            id="email"
            label="이메일"
            type="email"
            register={register}
            errors={errors}
          />
          <Input
            id="password"
            label="비밀번호"
            type="password"
            register={register}
            errors={errors}
          />
          <div>
            <Button disabled={isLoading} fullWidth type="submit">
              {variant === 'LOGIN' ? '로그인' : '가입하기'}
            </Button>
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">또는</span>
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <AuthSocialButton
            icon={BsGithub}
            onClick={() => socialAction('github')}
          />
          <AuthSocialButton
            icon={BsGoogle}
            onClick={() => socialAction('google')}
          />
        </div>
        <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
          <div>
            {variant === 'LOGIN'
              ? '계정이 없으신가요?'
              : '계정이 이미 있으신가요?'}
          </div>
          <div onClick={toggleVariant} className="underline cursor-pointer">
            {variant === 'LOGIN' ? '회원가입' : '로그인'}
          </div>
        </div>
      </div>
    </div>
  )
}
