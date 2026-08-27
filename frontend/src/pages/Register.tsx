import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

const schema = z.object({ email: z.string().email(), password: z.string().min(6), nome: z.string().min(2) })

type FormData = z.infer<typeof schema>

export default function Register() {
  const { register, handleSubmit } = useForm<FormData>({ resolver: zodResolver(schema) })
  const navigate = useNavigate()

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/register', data)
      navigate('/login')
    } catch (e) {
      alert('Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 w-full max-w-md text-white shadow-lg">
        <h1 className="text-2xl mb-4 font-semibold">Criar conta</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('nome')} placeholder="Nome" className="w-full p-3 rounded bg-white/20" />
          <input {...register('email')} placeholder="Email" className="w-full p-3 rounded bg-white/20" />
          <input {...register('password')} placeholder="Senha" type="password" className="w-full p-3 rounded bg-white/20" />
          <button className="w-full bg-indigo-500 p-3 rounded">Criar</button>
        </form>
        <div className="mt-4 text-sm">
          Já tem conta? <a href="/login" className="underline">Entrar</a>
        </div>
      </div>
    </div>
  )
}
