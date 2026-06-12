import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import type { ReactNode } from 'react'

type Preview3DProps = {
  leafImages: Array<{ id: string; url: string | null }>
  onClose: () => void
}

function LeafCard({ position, imageUrl, index }: { position: [number, number, number]; imageUrl: string | null; index: number }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, 0]}>
        <boxGeometry args={[1.5, 2, 0.02]} />
        <meshStandardMaterial color={imageUrl ? '#ffffff' : '#cccccc'} />
      </mesh>
      {imageUrl && (
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.2}
          color="#333"
          anchorX="center"
          anchorY="middle"
        >
          {`${index + 1}`}
        </Text>
      )}
    </group>
  )
}

function Scene({ leafImages }: { leafImages: Preview3DProps['leafImages'] }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls enableZoom enableRotate enablePan />

      {leafImages.map((leaf, index) => (
        <LeafCard
          key={leaf.id}
          position={[index * 0.3 - (leafImages.length * 0.3) / 2, 0, 0]}
          imageUrl={leaf.url}
          index={index}
        />
      ))}
    </>
  )
}

function LoadingFallback(): ReactNode {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#666" />
    </mesh>
  )
}

export function Preview3D({ leafImages, onClose }: Preview3DProps) {
  return (
    <div className="preview-3d-overlay">
      <div className="preview-3d-container">
        <div className="preview-3d-header">
          <h2>3D 预览</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="preview-3d-content">
          <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
            <Suspense fallback={<LoadingFallback />}>
              <Scene leafImages={leafImages} />
            </Suspense>
          </Canvas>
        </div>

        <div className="preview-3d-footer">
          <p>使用鼠标拖拽旋转，滚轮缩放，右键平移</p>
        </div>
      </div>

      <style>{`
        .preview-3d-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .preview-3d-container {
          width: 95vw;
          height: 95vh;
          display: flex;
          flex-direction: column;
          background: #111;
          border-radius: 12px;
          overflow: hidden;
        }

        .preview-3d-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: #1a1a1a;
          border-bottom: 1px solid #333;
        }

        .preview-3d-header h2 {
          margin: 0;
          color: #fff;
          font-size: 18px;
        }

        .close-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          color: #fff;
          font-size: 24px;
          cursor: pointer;
          border-radius: 8px;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .preview-3d-content {
          flex: 1;
          background: #000;
        }

        .preview-3d-footer {
          padding: 12px 24px;
          background: #1a1a1a;
          border-top: 1px solid #333;
          text-align: center;
        }

        .preview-3d-footer p {
          margin: 0;
          color: #888;
          font-size: 13px;
        }
      `}</style>
    </div>
  )
}
