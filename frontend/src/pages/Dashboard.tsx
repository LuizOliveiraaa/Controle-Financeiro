import React from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Controle Financeiro</h1>
        <div>
          <span className="mr-4">{user?.email}</span>
          <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded">Sair</button>
        </div>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">Saldo Atual: R$ 0,00</div>
          <div className="bg-white p-4 rounded shadow">Receitas do mês: R$ 0,00</div>
          <div className="bg-white p-4 rounded shadow">Despesas do mês: R$ 0,00</div>
        </div>

        <section className="mt-6 bg-white p-4 rounded shadow">Últimas transações (vazia)</section>
      </main>
    </div>
  )
}
