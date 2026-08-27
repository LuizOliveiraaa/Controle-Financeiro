import React from 'react'
import { useForm } from 'react-hook-form'
import api from '../services/api'

export default function ForgotPassword() {
  const { register, handleSubmit } = useForm<{ email: string }>()

  const onSubmit = async (data: { email: string }) => {
    try {
      await api.post('/auth/forgot-password', data)
      alert('Verifique seu email (dev: check logs)')
    } catch (e) {
      alert('Erro')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 w-full max-w-md text-white shadow-lg">
        <h1 className="text-2xl mb-4 font-semibold">Esqueci minha senha</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('email')} placeholder="Email" className="w-full p-3 rounded bg-white/20" />
          <button className="w-full bg-indigo-500 p-3 rounded">Enviar link</button>
        </form>
      </div>
    </div>
  )
}
