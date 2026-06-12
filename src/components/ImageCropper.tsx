import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

type ImageCropperProps = {
  image: string
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void
  onClose: () => void
}

export function ImageCropper({ image, onCropComplete, onClose }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const handleCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      onCropComplete(croppedArea, croppedAreaPixels)
    },
    [onCropComplete],
  )

  return (
    <div className="cropper-overlay">
      <div className="cropper-container">
        <div className="cropper-header">
          <h2>裁剪图片</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="cropper-content">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={handleCropComplete}
            aspect={1}
          />
        </div>

        <div className="cropper-controls">
          <div className="control-group">
            <label>
              <span>缩放</span>
              <span className="value">{zoom.toFixed(1)}x</span>
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </div>

          <div className="control-group">
            <label>
              <span>旋转</span>
              <span className="value">{rotation}°</span>
            </label>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="cropper-footer">
          <button type="button" className="cancel-btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="confirm-btn" onClick={onClose}>
            确认裁剪
          </button>
        </div>
      </div>

      <style>{`
        .cropper-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
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

        .cropper-container {
          width: 90vw;
          height: 90vh;
          max-width: 800px;
          max-height: 600px;
          display: flex;
          flex-direction: column;
          background: #1a1a1a;
          border-radius: 12px;
          overflow: hidden;
        }

        .cropper-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #333;
        }

        .cropper-header h2 {
          margin: 0;
          color: #fff;
          font-size: 18px;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: #fff;
          font-size: 24px;
          cursor: pointer;
          border-radius: 6px;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .cropper-content {
          flex: 1;
          position: relative;
          background: #000;
        }

        .cropper-controls {
          padding: 16px 20px;
          border-top: 1px solid #333;
        }

        .control-group {
          display: grid;
          gap: 8px;
        }

        .control-group label {
          display: flex;
          justify-content: space-between;
          color: #fff;
          font-size: 13px;
        }

        .control-group label .value {
          color: #aaa;
        }

        .control-group input[type="range"] {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #333;
          outline: none;
          -webkit-appearance: none;
        }

        .control-group input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #1e6f55;
          cursor: pointer;
          border: 2px solid #fff;
        }

        .cropper-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1px solid #333;
        }

        .cancel-btn,
        .confirm-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-btn {
          background: #333;
          color: #fff;
        }

        .cancel-btn:hover {
          background: #444;
        }

        .confirm-btn {
          background: #1e6f55;
          color: #fff;
        }

        .confirm-btn:hover {
          background: #175a45;
        }
      `}</style>
    </div>
  )
}
