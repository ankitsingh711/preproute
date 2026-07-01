import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { login } from '@/api/auth'
import { ApiError } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import logo from '@/assets/logo.png'
import illustration from '@/assets/login-illustration.png'

const schema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.login)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    try {
      const { token, user } = await login(values.userId, values.password)
      setAuth(token, user)
      navigate('/', { replace: true })
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Login failed. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 items-center justify-center bg-tint lg:flex">
        <img src={illustration} alt="" className="max-w-md" />
      </div>

      <div className="flex flex-1 items-center justify-center border-l border-border bg-white px-6 py-16">
        <div className="w-full max-w-md">
          <img src={logo} alt="PrepRoute" className="mb-10 h-8 w-auto" />

          <h1 className="mb-2 text-2xl font-semibold text-heading">Login</h1>
          <p className="mb-8 text-sm text-secondary-text">
            Use your company provided Login credentials
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <Input
              id="userId"
              label="User ID"
              placeholder="Enter User ID"
              error={errors.userId?.message}
              {...register('userId')}
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Enter Password"
              error={errors.password?.message}
              {...register('password')}
            />

            <a href="#" className="-mt-3 text-sm text-primary hover:underline">
              Forgot password?
            </a>

            {serverError && <p className="text-sm text-red-500">{serverError}</p>}

            <Button type="submit" loading={isSubmitting} className="w-full py-3.5">
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
