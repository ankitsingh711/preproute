import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { deleteTest, getTests } from '@/api/tests'
import { Button } from '@/components/ui/Button'
import { StatusPill } from '@/components/ui/Badge'
import type { TestStatus } from '@/types/api'

const statusFilters: Array<{ value: TestStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'live', label: 'Live' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'unpublished', label: 'Unpublished' },
  { value: 'expired', label: 'Expired' },
]

export function DashboardPage() {
  const queryClient = useQueryClient()
  const { data: tests, isLoading, isError } = useQuery({ queryKey: ['tests'], queryFn: getTests })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TestStatus | 'all'>('all')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: deleteTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] })
      setPendingDeleteId(null)
    },
  })

  const filtered = useMemo(() => {
    if (!tests) return []
    return tests.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(search.trim().toLowerCase())
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [tests, search, statusFilter])

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Dashboard</h1>
          <p className="mt-1 text-sm text-secondary-text">
            All tests created on the platform
          </p>
        </div>
        <Link to="/tests/new">
          <Button>
            <Plus className="h-4 w-4" />
            Create New Test
          </Button>
        </Link>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tests by name"
            className="w-72 rounded-lg border border-border bg-white py-2.5 pl-9 pr-4 text-sm text-heading placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TestStatus | 'all')}
          className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-heading focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {statusFilters.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-tint/60 text-xs uppercase tracking-wide text-secondary-text">
            <tr>
              <th className="px-6 py-3 font-medium">Test Name</th>
              <th className="px-6 py-3 font-medium">Subject</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Questions</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Created</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-muted">
                  Loading tests…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-red-500">
                  Couldn't load tests. Please refresh.
                </td>
              </tr>
            )}
            {!isLoading && !isError && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-muted">
                  No tests found.
                </td>
              </tr>
            )}
            {filtered.map((test) => (
              <tr key={test.id} className="hover:bg-tint/40">
                <td className="max-w-xs truncate px-6 py-4 font-medium text-heading">
                  {test.name}
                </td>
                <td className="px-6 py-4 text-secondary-text">{test.subject}</td>
                <td className="px-6 py-4 capitalize text-secondary-text">{test.type}</td>
                <td className="px-6 py-4 text-secondary-text">
                  {test.questions?.length ?? 0} / {test.total_questions}
                </td>
                <td className="px-6 py-4">
                  <StatusPill status={test.status} />
                </td>
                <td className="px-6 py-4 text-secondary-text">
                  {new Date(test.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3 text-heading/60">
                    <Link
                      to={`/tests/${test.id}/preview`}
                      aria-label="View test"
                      className="hover:text-primary"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/tests/${test.id}/edit`}
                      aria-label="Edit test"
                      className="hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      aria-label="Delete test"
                      onClick={() => setPendingDeleteId(test.id)}
                      className="hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-base font-semibold text-heading">Delete this test?</h2>
            <p className="mt-2 text-sm text-secondary-text">
              This can't be undone. The test and its association with any questions will be
              removed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setPendingDeleteId(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(pendingDeleteId)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
