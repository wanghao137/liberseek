export type PreviewMode = 'edit' | 'flip' | 'scroll'

export type PreviewState = {
  currentPage: number
  totalPages: number
  mode: PreviewMode
}

export function createPreviewState(totalPages: number): PreviewState {
  return {
    currentPage: 0,
    totalPages,
    mode: 'edit',
  }
}

export function nextPage(state: PreviewState): PreviewState {
  if (state.currentPage >= state.totalPages - 1) {
    return state
  }

  return {
    ...state,
    currentPage: state.currentPage + 1,
  }
}

export function previousPage(state: PreviewState): PreviewState {
  if (state.currentPage <= 0) {
    return state
  }

  return {
    ...state,
    currentPage: state.currentPage - 1,
  }
}

export function goToPage(state: PreviewState, page: number): PreviewState {
  const clamped = Math.max(0, Math.min(state.totalPages - 1, page))

  return {
    ...state,
    currentPage: clamped,
  }
}

export function setMode(state: PreviewState, mode: PreviewMode): PreviewState {
  return {
    ...state,
    mode,
  }
}

export function formatPageIndicator(state: PreviewState): string {
  return `${state.currentPage + 1} / ${state.totalPages}`
}

export function isFirstPage(state: PreviewState): boolean {
  return state.currentPage === 0
}

export function isLastPage(state: PreviewState): boolean {
  return state.currentPage === state.totalPages - 1
}
