import { useMemo } from 'react'
import { generateProjectQrData, formatQrData } from '../modules/editor/qrUtils'

type QRCodeDisplayProps = {
  projectTitle: string
  artworkHeightCm: number
  visiblePageWidthCm: number
  leafCount: number
  size?: number
}

export function QRCodeDisplay({
  projectTitle,
  artworkHeightCm,
  visiblePageWidthCm,
  leafCount,
  size = 200,
}: QRCodeDisplayProps) {
  const qrData = useMemo(() => {
    const data = generateProjectQrData({
      title: projectTitle,
      artworkHeightCm,
      visiblePageWidthCm,
      leafCount,
    })
    return formatQrData(data)
  }, [projectTitle, artworkHeightCm, visiblePageWidthCm, leafCount])

  const qrUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrData)}`
  }, [qrData, size])

  return (
    <div className="qr-code-display">
      <img
        src={qrUrl}
        alt="项目 QR 码"
        width={size}
        height={size}
        style={{ borderRadius: 8 }}
      />
      <p className="qr-hint">扫描二维码查看项目参数</p>

      <style>{`
        .qr-code-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .qr-hint {
          margin: 0;
          font-size: 12px;
          color: #666;
        }
      `}</style>
    </div>
  )
}
