import type { Job, JobStatus } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : body?.message;
    throw new Error(message ?? `Request failed with status ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const jobsApi = {
  getAll: () => request<Job[]>("/jobs"),
  create: (input: { title: string; type: string }) =>
    request<Job>("/jobs", { method: "POST", body: JSON.stringify(input) }),
  updateStatus: (job: Job, status: JobStatus) =>
    request<Job>(`/jobs/${job.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, expectedStatus: job.status }),
    }),
  delete: (id: string) => request<void>(`/jobs/${id}`, { method: "DELETE" }),
};
