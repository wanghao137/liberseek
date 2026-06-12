import useSWR from 'swr'
import { loadProject, loadAllProjects, loadAssetsByProject } from '../lib/database'

export function useProject(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `project-${id}` : null,
    () => loadProject(id!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  return {
    project: data,
    error,
    isLoading,
    refresh: () => mutate(),
  }
}

export function useAllProjects() {
  const { data, error, isLoading, mutate } = useSWR(
    'all-projects',
    () => loadAllProjects(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  return {
    projects: data ?? [],
    error,
    isLoading,
    refresh: () => mutate(),
  }
}

export function useProjectAssets(projectId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    projectId ? `assets-${projectId}` : null,
    () => loadAssetsByProject(projectId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  return {
    assets: data ?? [],
    error,
    isLoading,
    refresh: () => mutate(),
  }
}
