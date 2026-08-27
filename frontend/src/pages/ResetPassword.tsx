import React from 'react'
import { useForm } from 'react-hook-form'
import api from '../services/api'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function ResetPassword() {
  const { register, handleSubmit } = useForm<{ token: string; password: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const onSubmit = async (data: any) => {
    try {
      const token = searchParams.get('token') || data.token
      await api.post('/auth/reset-password', { token, password: data.password })
      alert('Senha atualizada')
      navigate('/login')
    } catch (e) {
      alert('Erro')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 w-full max-w-md text-white shadow-lg">
        <h1 className="text-2xl mb-4 font-semibold">Redefinir senha</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('password')} placeholder="Nova senha" type="password" className="w-full p-3 rounded bg-white/20" />
          <button className="w-full bg-indigo-500 p-3 rounded">Redefinir</button>
        </form>
      </div>
    </div>
  )
}
