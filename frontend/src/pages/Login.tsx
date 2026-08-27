import React from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '../hooks/useAuth'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type FormData = z.infer<typeof schema>

export default function Login() {
  const { register, handleSubmit } = useForm<FormData>({ resolver: zodResolver(schema) })
  const auth = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (data: FormData) => {
    try {
      await auth.login(data.email, data.password)
      navigate('/')
    } catch (e) {
      alert('Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 w-full max-w-md text-white shadow-lg">
        <h1 className="text-2xl mb-4 font-semibold">Entrar</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('email')} placeholder="Email" className="w-full p-3 rounded bg-white/20" />
          <input {...register('password')} placeholder="Senha" type="password" className="w-full p-3 rounded bg-white/20" />
          <button className="w-full bg-indigo-500 p-3 rounded">Entrar</button>
        </form>
        <div className="mt-4 text-sm">
          <Link to="/forgot" className="underline">Esqueci minha senha</Link>
        </div>
        <div className="mt-4 text-sm">
          Não tem conta? <Link to="/register" className="underline">Criar conta</Link>
        </div>
      </div>
    </div>
  )
}
