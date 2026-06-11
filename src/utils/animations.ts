export type AnimationConfig = {
  duration: number
  easing: string
  delay?: number
}

export const ANIMATIONS = {
  fadeIn: {
    duration: 0.3,
    easing: 'ease',
  },
  fadeOut: {
    duration: 0.2,
    easing: 'ease',
  },
  slideUp: {
    duration: 0.3,
    easing: 'ease-out',
  },
  slideDown: {
    duration: 0.3,
    easing: 'ease-in',
  },
  scaleIn: {
    duration: 0.2,
    easing: 'ease-out',
  },
  scaleOut: {
    duration: 0.15,
    easing: 'ease-in',
  },
  bounce: {
    duration: 0.5,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  spring: {
    duration: 0.6,
    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const

export function getAnimationStyle(config: AnimationConfig): React.CSSProperties {
  return {
    animation: `animation ${config.duration}s ${config.easing} ${config.delay ?? 0}s`,
  }
}

export function getTransitionStyle(
  property: string,
  config: AnimationConfig,
): React.CSSProperties {
  return {
    transition: `${property} ${config.duration}s ${config.easing} ${config.delay ?? 0}s`,
  }
}

export const CSS_KEYFRAMES = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes slideDown {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes scaleIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes scaleOut {
    from { transform: scale(1); opacity: 1; }
    to { transform: scale(0.9); opacity: 0; }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`
