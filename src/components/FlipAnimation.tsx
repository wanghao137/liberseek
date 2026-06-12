import { useState, useEffect } from 'react'

type FlipAnimationProps = {
  children: React.ReactNode
  direction: 'left' | 'right' | null
  onComplete: () => void
}

export function FlipAnimation({ children, direction, onComplete }: FlipAnimationProps) {
  const [phase, setPhase] = useState<'idle' | 'flipping' | 'complete'>('idle')

  useEffect(() => {
    if (direction) {
      setPhase('flipping')
      const timer = setTimeout(() => {
        setPhase('complete')
        onComplete()
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setPhase('idle')
    }
  }, [direction, onComplete])

  return (
    <div className={`flip-animation ${phase} ${direction || ''}`}>
      {children}
      <style>{`
        .flip-animation {
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        .flip-animation.flipping.right {
          animation: flipRight 0.3s ease-in-out;
        }

        .flip-animation.flipping.left {
          animation: flipLeft 0.3s ease-in-out;
        }

        @keyframes flipRight {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(-90deg); opacity: 0.5; }
          100% { transform: rotateY(0deg); opacity: 1; }
        }

        @keyframes flipLeft {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(90deg); opacity: 0.5; }
          100% { transform: rotateY(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
