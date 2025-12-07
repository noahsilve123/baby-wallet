"use client"

import { useEffect, useState } from 'react'

type Donation = {
  id: string
  amount?: number | null
  currency?: string | null
  email?: string | null
  status?: string
  payment_intent?: string | null
  createdAt?: string
}

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchDonations()
  }, [])

  async function fetchDonations() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/donations')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setDonations(data || [])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to load donations'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function markCompleted(id: string) {
    try {
      const res = await fetch(`/api/admin/donations/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })
      if (!res.ok) throw new Error('Unable to update')
      await fetchDonations()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to update'
      setError(message)
    }
  }

  async function removeDonation(id: string) {
    if (!confirm('Delete this donation record?')) return
    try {
      const res = await fetch(`/api/admin/donations/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Delete failed')
      await fetchDonations()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      setError(message)
    }
  }

  function exportCSV() {
    if (!donations.length) return
    const headers = ['id', 'amount', 'currency', 'email', 'status', 'payment_intent', 'createdAt']
    const rows = donations.map((d) => [d.id, d.amount ?? '', d.currency ?? '', d.email ?? '', d.status ?? '', d.payment_intent ?? '', d.createdAt ?? ''])
    const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `donations-${new Date().toISOString()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin — Donations</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => void fetchDonations()} className="rounded border px-3 py-1">Refresh</button>
          <button onClick={exportCSV} className="rounded border px-3 py-1">Export CSV</button>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <div className="mt-6">
        {loading ? (
          <p>Loading…</p>
        ) : donations.length === 0 ? (
          <p className="text-sm text-gray-600">No donations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-sm text-gray-600">
                  <th className="p-2">ID</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Created</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id} className="align-top border-t">
                    <td className="p-2 text-xs break-words max-w-xs"><code className="bg-gray-100 rounded px-1 py-0.5">{d.id}</code></td>
                    <td className="p-2">{d.amount ? `$${(Number(d.amount) / 100).toFixed(2)}` : '—'}</td>
                    <td className="p-2">{d.email ?? '—'}</td>
                    <td className="p-2">{d.status ?? 'unknown'}</td>
                    <td className="p-2">{d.createdAt ? new Date(d.createdAt).toLocaleString() : '—'}</td>
                    <td className="p-2 space-x-2">
                      <button onClick={() => void markCompleted(d.id)} className="rounded bg-emerald-600 px-2 py-1 text-white text-sm">Mark completed</button>
                      <button onClick={() => void removeDonation(d.id)} className="rounded border px-2 py-1 text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}

function csvEscape(value: string | number) {
  const v = String(value ?? '')
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return '"' + v.replace(/"/g, '""') + '"'
  }
  return v
}
