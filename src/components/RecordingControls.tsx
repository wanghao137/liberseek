import { useState, useCallback, useEffect, useRef } from 'react'
import { isMediaRecorderSupported, getSupportedMimeType, formatDuration, type RecordingState } from '../modules/editor/recordingUtils'

type RecordingControlsProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  onRecordingComplete?: (blob: Blob) => void
}

export function RecordingControls({ canvasRef, onRecordingComplete }: RecordingControlsProps) {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    mimeType: null,
  })

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)

  const isSupported = isMediaRecorderSupported()

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = useCallback(() => {
    if (!canvasRef.current || !isSupported) return

    const stream = canvasRef.current.captureStream(30)
    const mimeType = getSupportedMimeType()

    if (!mimeType) {
      alert('不支持的视频格式')
      return
    }

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 2500000,
    })

    chunksRef.current = []

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType })
      onRecordingComplete?.(blob)
    }

    recorder.start(100)

    recorderRef.current = recorder

    setState({
      isRecording: true,
      isPaused: false,
      duration: 0,
      mimeType,
    })

    timerRef.current = window.setInterval(() => {
      setState((prev) => ({
        ...prev,
        duration: prev.duration + 1,
      }))
    }, 1000)
  }, [canvasRef, isSupported, onRecordingComplete])

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setState((prev) => ({
      ...prev,
      isRecording: false,
      isPaused: false,
    }))
  }, [])

  const pauseRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.pause()
      setState((prev) => ({
        ...prev,
        isPaused: true,
      }))

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  const resumeRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === 'paused') {
      recorderRef.current.resume()
      setState((prev) => ({
        ...prev,
        isPaused: false,
      }))

      timerRef.current = window.setInterval(() => {
        setState((prev) => ({
          ...prev,
          duration: prev.duration + 1,
        }))
      }, 1000)
    }
  }, [])

  if (!isSupported) {
    return (
      <div className="recording-controls">
        <p className="unsupported">浏览器不支持录制功能</p>
        <style>{`
          .recording-controls {
            padding: 12px;
            background: rgba(163, 58, 43, 0.1);
            border-radius: 8px;
          }
          .unsupported {
            margin: 0;
            color: var(--cinnabar);
            font-size: 13px;
            text-align: center;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="recording-controls">
      <div className="recording-status">
        {state.isRecording && (
          <span className="recording-indicator">
            <span className="dot" />
            {state.isPaused ? '已暂停' : '录制中'}
          </span>
        )}
        <span className="duration">{formatDuration(state.duration)}</span>
      </div>

      <div className="recording-buttons">
        {!state.isRecording ? (
          <button type="button" className="record-btn" onClick={startRecording}>
            ⏺ 开始录制
          </button>
        ) : (
          <>
            {state.isPaused ? (
              <button type="button" className="resume-btn" onClick={resumeRecording}>
                ▶ 继续
              </button>
            ) : (
              <button type="button" className="pause-btn" onClick={pauseRecording}>
                ⏸ 暂停
              </button>
            )}
            <button type="button" className="stop-btn" onClick={stopRecording}>
              ⏹ 停止
            </button>
          </>
        )}
      </div>

      <style>{`
        .recording-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #1a1a1a;
          border-radius: 8px;
        }

        .recording-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .recording-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #ff4444;
          font-size: 13px;
          font-weight: 600;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: #ff4444;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .duration {
          color: #aaa;
          font-size: 14px;
          font-family: monospace;
        }

        .recording-buttons {
          display: flex;
          gap: 8px;
        }

        .record-btn,
        .pause-btn,
        .resume-btn,
        .stop-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .record-btn {
          background: #ff4444;
          color: #fff;
        }

        .record-btn:hover {
          background: #cc0000;
        }

        .pause-btn,
        .resume-btn {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .pause-btn:hover,
        .resume-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .stop-btn {
          background: #666;
          color: #fff;
        }

        .stop-btn:hover {
          background: #555;
        }
      `}</style>
    </div>
  )
}
