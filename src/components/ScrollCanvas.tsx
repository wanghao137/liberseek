import { useRef, useState } from 'react'

type ScrollCanvasProps = {
  children: React.ReactNode
  width: number
  height: number
  scrollDecoration?: boolean
}

export function ScrollCanvas({ children, width, height, scrollDecoration = true }: ScrollCanvasProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="scroll-canvas-wrapper">
      {scrollDecoration && (
        <div className="scroll-decoration-left">
          <div className="scroll-rod" />
          <div className="scroll-end" />
        </div>
      )}
      
      <div 
        ref={scrollRef}
        className={`scroll-canvas ${isHovered ? 'hovered' : ''}`}
        style={{ width: `${width}px`, height: `${height}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="scroll-paper">
          {children}
        </div>
      </div>

      {scrollDecoration && (
        <div className="scroll-decoration-right">
          <div className="scroll-end" />
          <div className="scroll-rod" />
        </div>
      )}

      <style>{`
        .scroll-canvas-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          position: relative;
        }

        .scroll-decoration-left,
        .scroll-decoration-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 10;
        }

        .scroll-rod {
          width: 18px;
          height: calc(100% + 40px);
          background: linear-gradient(90deg, 
            #4a3728 0%, 
            #6b5344 20%, 
            #8b7355 40%, 
            #6b5344 60%, 
            #4a3728 80%, 
            #3d2d20 100%);
          border-radius: 9px;
          box-shadow: 
            2px 0 8px rgba(0, 0, 0, 0.3),
            inset -2px 0 4px rgba(255, 255, 255, 0.1);
        }

        .scroll-end {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, 
            #5c4a3a 0%, 
            #8b7355 50%, 
            #5c4a3a 100%);
          border-radius: 50%;
          box-shadow: 
            0 2px 6px rgba(0, 0, 0, 0.3),
            inset 0 1px 2px rgba(255, 255, 255, 0.2);
          margin-top: -12px;
        }

        .scroll-canvas {
          position: relative;
          overflow: hidden;
          border-radius: 4px;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.2),
            0 2px 8px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.3s ease;
        }

        .scroll-canvas.hovered {
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.25),
            0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .scroll-paper {
          width: 100%;
          height: 100%;
          background: 
            linear-gradient(90deg, rgba(139, 115, 85, 0.08) 1px, transparent 1px),
            linear-gradient(rgba(139, 115, 85, 0.06) 1px, transparent 1px),
            linear-gradient(135deg, #faf6ed 0%, #f5edd8 100%);
          background-size: 20px 20px, 20px 20px, auto;
          position: relative;
        }
      `}</style>
    </div>
  )
}
