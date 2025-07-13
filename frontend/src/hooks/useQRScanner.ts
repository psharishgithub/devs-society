import { useState, useEffect, useCallback } from 'react'

interface UseQRScannerOptions {
  onScan: (data: string) => void
  onError?: (error: string) => void
  autoStart?: boolean
}

interface UseQRScannerReturn {
  isScanning: boolean
  isSupported: boolean
  error: string | null
  startScanning: () => void
  stopScanning: () => void
  retry: () => void
}

export const useQRScanner = ({
  onScan,
  onError,
  autoStart = false
}: UseQRScannerOptions): UseQRScannerReturn => {
  const [isScanning, setIsScanning] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if device supports camera
  useEffect(() => {
    const checkSupport = async () => {
      try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setIsSupported(false)
          setError('Camera not supported on this device')
          return
        }

        // Check if device is mobile
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          navigator.userAgent.toLowerCase()
        )

        // For mobile devices, check if camera permissions are available
        if (isMobile) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true })
            stream.getTracks().forEach(track => track.stop())
            setIsSupported(true)
          } catch (err) {
            setIsSupported(false)
            setError('Camera access denied. Please grant camera permissions.')
          }
        } else {
          setIsSupported(true)
        }
      } catch (err) {
        setIsSupported(false)
        setError('Failed to check camera support')
      }
    }

    checkSupport()
  }, [])

  const startScanning = useCallback(() => {
    if (!isSupported) {
      setError('Camera not supported')
      onError?.('Camera not supported')
      return
    }

    setIsScanning(true)
    setError(null)
  }, [isSupported, onError])

  const stopScanning = useCallback(() => {
    setIsScanning(false)
  }, [])

  const retry = useCallback(() => {
    setError(null)
    startScanning()
  }, [startScanning])

  // Auto-start scanning if enabled
  useEffect(() => {
    if (autoStart && isSupported && !isScanning) {
      startScanning()
    }
  }, [autoStart, isSupported, isScanning, startScanning])

  return {
    isScanning,
    isSupported,
    error,
    startScanning,
    stopScanning,
    retry
  }
}

// Mobile-specific utilities
export const useMobileOptimization = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      )
      setIsMobile(mobile)
    }

    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    checkMobile()
    checkOrientation()

    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  return { isMobile, orientation }
} 