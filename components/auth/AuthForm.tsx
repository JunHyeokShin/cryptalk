'use client'

import axios from 'axios'
import { signIn, useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Input from '../Input'
import Button from '../Button'
import { useRouter } from 'next/navigation'

type Variant = 'LOGIN' | 'REGISTER'

export default function AuthForm() {
  const session = useSession()
  const router = useRouter()
  const [variant, setVariant] = useState<Variant>('LOGIN')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session.status === 'authenticated') {
      router.push('/people')
    }
  }, [session.status, router])

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

    // 회원가입
    if (variant === 'REGISTER') {
      axios
        .post('/api/register', data)
        .then(() =>
          signIn('credentials', { ...data, redirect: false }).then(
            (callback) => {
              if (callback?.error) {
                toast.error(callback.error)
              }
              if (callback?.ok && !callback?.error) {
                toast.success('회원가입이 완료되었습니다.')
              }
            }
          )
        )
        .catch((error) => toast.error(error.response.data))
        .finally(() => setIsLoading(false))
    }

    // 로그인
    if (variant === 'LOGIN') {
      signIn('credentials', {
        ...data,
        redirect: false,
      })
        .then((callback) => {
          if (callback?.error) {
            toast.error(callback.error)
          }
          if (callback?.ok && !callback?.error) {
            toast.success('로그인 성공')
          }
        })
        .finally(() => setIsLoading(false))
    }
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
              disabled={isLoading}
            />
          )}
          <Input
            id="email"
            label="이메일"
            type="email"
            register={register}
            errors={errors}
            disabled={isLoading}
          />
          <Input
            id="password"
            label="비밀번호"
            type="password"
            register={register}
            errors={errors}
            disabled={isLoading}
          />
          <div>
            <Button disabled={isLoading} fullWidth type="submit">
              {variant === 'LOGIN' ? '로그인' : '가입하기'}
            </Button>
          </div>
        </form>
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
