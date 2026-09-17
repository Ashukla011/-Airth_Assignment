import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { jobsApi } from './api'
import type { Job, JobStatus, StatusFilter } from './types'
import './App.css'

const statuses: JobStatus[] = ['pending', 'running', 'completed', 'failed']
const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong'

function App() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [busyJobId, setBusyJobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('')

  const loadJobs = useCallback(async () => {
    try {
      setError(null)
      setJobs(await jobsApi.getAll())
    } catch (error) {
      setError(errorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadJobs()
  }, [loadJobs])

  const counts = useMemo(
    () =>
      statuses.reduce<Record<JobStatus, number>>(
        (result, status) => {
          result[status] = jobs.filter((job) => job.status === status).length
          return result
        },
        { pending: 0, running: 0, completed: 0, failed: 0 },
      ),
    [jobs],
  )

  const visibleJobs = useMemo(
    () => (filter === 'all' ? jobs : jobs.filter((job) => job.status === filter)),
    [filter, jobs],
  )

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim() || !type.trim()) {
      setError('Title and type are required.')
      return
    }
    try {
      setError(null)
      setIsCreating(true)
      const newJob = await jobsApi.create({ title, type })
      setJobs((current) => [newJob, ...current])
      setTitle('')
      setType('')
    } catch (error) {
      setError(errorMessage(error))
    } finally {
      setIsCreating(false)
    }
  }

  async function handleStatusChange(job: Job, status: JobStatus) {
    try {
      setError(null)
      setBusyJobId(job.id)
      const updatedJob = await jobsApi.updateStatus(job, status)
      setJobs((current) =>
        current.map((item) => (item.id === updatedJob.id ? updatedJob : item)),
      )
    } catch (error) {
      setError(`${errorMessage(error)} Latest data has been loaded.`)
      await loadJobs()
    } finally {
      setBusyJobId(null)
    }
  }

  async function handleDelete(job: Job) {
    if (!window.confirm(`Delete "${job.title}"?`)) return
    try {
      setError(null)
      setBusyJobId(job.id)
      await jobsApi.delete(job.id)
      setJobs((current) => current.filter((item) => item.id !== job.id))
    } catch (error) {
      setError(errorMessage(error))
      await loadJobs()
    } finally {
      setBusyJobId(null)
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Job Queue</h1>
          <p className="subtitle">Create, monitor, and advance background jobs.</p>
        </div>
        <button className="secondary-button" onClick={() => void loadJobs()}>Refresh</button>
      </header>

      <section className="stats-grid" aria-label="Job counts">
        {statuses.map((status) => (
          <button
            className={`stat-card ${filter === status ? 'selected' : ''}`}
            key={status}
            onClick={() => setFilter(status)}
          >
            <span className={`status-dot ${status}`} />
            <span className="stat-label">{status}</span>
            <strong>{counts[status]}</strong>
          </button>
        ))}
      </section>

      <section className="panel create-panel">
        <div><h2>Create a job</h2><p>New jobs enter the queue as pending.</p></div>
        <form onSubmit={handleCreate}>
          <label>Job title
            <input maxLength={120} onChange={(event) => setTitle(event.target.value)} placeholder="Generate monthly report" value={title} />
          </label>
          <label>Job type
            <input maxLength={50} onChange={(event) => setType(event.target.value)} placeholder="Report" value={type} />
          </label>
          <button className="primary-button" disabled={isCreating} type="submit">
            {isCreating ? 'Creating…' : 'Create job'}
          </button>
        </form>
      </section>

      {error && <div className="error-banner" role="alert">
        <span>{error}</span><button onClick={() => setError(null)} aria-label="Dismiss error">×</button>
      </div>}

      <section className="panel jobs-panel">
        <div className="list-header">
          <div><h2>Jobs</h2><p>{visibleJobs.length} shown</p></div>
          <select aria-label="Filter jobs by status" onChange={(event) => setFilter(event.target.value as StatusFilter)} value={filter}>
            <option value="all">All statuses</option>
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>

        {isLoading ? <div className="empty-state">Loading jobs…</div>
          : visibleJobs.length === 0 ? <div className="empty-state"><strong>No jobs found</strong><span>Create a job or choose another status.</span></div>
          : <div className="job-list">{visibleJobs.map((job) => {
            const isBusy = busyJobId === job.id
            return <article className="job-row" key={job.id}>
              <div className="job-main">
                <span className={`status-badge ${job.status}`}>{job.status}</span>
                <div><h3>{job.title}</h3><p>{job.type} · {new Date(job.createdAt).toLocaleString()}</p></div>
              </div>
              <div className="job-actions">
                {job.status === 'pending' && <button disabled={isBusy} onClick={() => void handleStatusChange(job, 'running')}>Start</button>}
                {job.status === 'running' && <>
                  <button disabled={isBusy} onClick={() => void handleStatusChange(job, 'completed')}>Complete</button>
                  <button className="danger-text" disabled={isBusy} onClick={() => void handleStatusChange(job, 'failed')}>Fail</button>
                </>}
                <button className="danger-text" disabled={isBusy} onClick={() => void handleDelete(job)}>Delete</button>
              </div>
            </article>
          })}</div>}
      </section>
    </main>
  )
}

export default App
