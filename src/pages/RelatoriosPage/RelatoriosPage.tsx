import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { getCasos } from '../../services/casoService'
import { getDoacoes } from '../../services/doacaoService'
import { getPatrocinadores } from '../../services/patrocinadorService'
import type { Caso, Doacao } from '../../types'

const COLORS = ['#1E4E8C', '#F29E1F', '#3b82f6', '#22c55e', '#a855f7', '#ef4444']

function monthLabel(iso: string): string {
  const [year, month] = iso.split('T')[0].split('-')
  const names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${names[Number(month) - 1]}/${year.slice(2)}`
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    EM_ANDAMENTO: 'Em andamento', PENDENTE: 'Pendente', CONCLUIDO: 'Concluído',
  }
  return map[s] ?? s
}

export default function RelatoriosPage() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [doacoes, setDoacoes] = useState<Doacao[]>([])
  const [totalPatrocinadores, setTotalPatrocinadores] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.allSettled([getCasos(), getDoacoes(), getPatrocinadores()])
      .then(([c, d, p]) => {
        if (c.status === 'fulfilled') setCasos(c.value)
        if (d.status === 'fulfilled') setDoacoes(d.value)
        if (p.status === 'fulfilled') setTotalPatrocinadores(p.value.length)
        if (c.status === 'rejected') setError('Não foi possível carregar os casos.')
      })
      .finally(() => setLoading(false))
  }, [])

  // Casos por mês (usa dataAbertura)
  const casosPorMes = Object.entries(
    casos.reduce<Record<string, number>>((acc, c) => {
      const key = monthLabel(c.dataAbertura)
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {}),
  ).map(([mes, total]) => ({ mes, total }))

  // Casos por status
  const statusData = Object.entries(
    casos.reduce<Record<string, number>>((acc, c) => {
      const s = statusLabel(c.status)
      acc[s] = (acc[s] ?? 0) + 1
      return acc
    }, {}),
  ).map(([name, value]) => ({ name, value }))

  // Dentistas mais ativos (top 5 por número de casos)
  const dentistaCount = casos.reduce<Record<string, number>>((acc, c) => {
    const nome = c.dentista?.nome
    if (nome) acc[nome] = (acc[nome] ?? 0) + 1
    return acc
  }, {})
  const top5Dentistas = Object.entries(dentistaCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([nome, casos]) => ({ nome, casos }))

  // Doações monetárias por mês
  const doacoesPorMes = Object.entries(
    doacoes
      .filter(d => d.tipo === 'MONETARIO' && d.valor !== null)
      .reduce<Record<string, number>>((acc, d) => {
        const key = monthLabel(d.dataDoacao)
        acc[key] = (acc[key] ?? 0) + (d.valor ?? 0)
        return acc
      }, {}),
  ).map(([mes, total]) => ({ mes, total }))

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E4E8C]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 text-sm">{error}</div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-[#0F172A] mb-6">Relatórios</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total de Casos" value={casos.length} icon="fa-solid fa-folder-open" />
        <StatCard label="Total de Doações" value={doacoes.length} icon="fa-solid fa-hand-holding-heart" />
        <StatCard label="Patrocinadores" value={totalPatrocinadores} icon="fa-solid fa-building" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="📊 Casos por Mês">
          {casosPorMes.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={casosPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#1E4E8C" radius={[4, 4, 0, 0]} name="Casos" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="🥧 Status dos Casos">
          {statusData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="🦷 Dentistas Mais Ativos (Top 5)">
          {top5Dentistas.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={top5Dentistas} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis dataKey="nome" type="category" width={130} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="casos" fill="#F29E1F" radius={[0, 4, 4, 0]} name="Casos" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="💰 Doações Monetárias por Mês (R$)">
          {doacoesPorMes.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={doacoesPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => typeof v === 'number' ? `R$ ${v.toLocaleString('pt-BR')}` : v} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#1E4E8C" strokeWidth={2} dot={{ r: 4 }} name="Total (R$)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] flex items-center justify-center shrink-0">
        <i className={`${icon} text-[#1E4E8C] text-xl`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
        <p className="text-sm text-[#475569]">{label}</p>
      </div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
      <h2 className="text-sm font-semibold text-[#0F172A] mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Empty() {
  return <p className="text-sm text-[#475569] text-center py-8">Sem dados suficientes para exibir.</p>
}
