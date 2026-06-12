import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

type AnimatedContainerProps = {
  children: ReactNode
  isVisible: boolean
  animation?: 'fade' | 'slide' | 'scale' | 'none'
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
  className?: string
}

const animations = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  none: {
    initial: {},
    animate: {},
    exit: {},
  },
}

const directions = {
  up: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 20 } },
  down: { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } },
  left: { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 } },
  right: { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } },
}

export function AnimatedContainer({
  children,
  isVisible,
  animation = 'fade',
  direction = 'up',
  duration = 0.3,
  className = '',
}: AnimatedContainerProps) {
  const variant = animation === 'slide' ? directions[direction] : animations[animation]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={className}
          initial={variant.initial}
          animate={variant.animate}
          exit={variant.exit}
          transition={{ duration, ease: 'easeInOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

type AnimatedButtonProps = {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  whileHover?: Record<string, unknown>
  whileTap?: Record<string, unknown>
}

export function AnimatedButton({
  children,
  onClick,
  disabled = false,
  className = '',
  whileHover = { scale: 1.05 },
  whileTap = { scale: 0.95 },
}: AnimatedButtonProps) {
  return (
    <motion.button
      className={className}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : whileHover as any}
      whileTap={disabled ? undefined : whileTap as any}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.button>
  )
}

type AnimatedCardProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedCard({ children, className = '', delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
