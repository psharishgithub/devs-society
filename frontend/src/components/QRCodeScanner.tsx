import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { 
  QrCode, 
  Camera, 
  X, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Calendar,
  Clock,
  Hash
} from 'lucide-react'

interface QRCodeScannerProps {
  eventId: string
  eventTitle: string
  onCheckIn: (qrData: string, notes?: string) => Promise<{ success: boolean; message: string; checkIn?: any }>
  onClose: () => void
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  eventId,
  eventTitle,
  onCheckIn,
  onClose
}) => {
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('manual')
  const [manualCode, setManualCode] = useState('')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastResult, setLastResult] = useState<{
    success: boolean
    message: string
    checkIn?: any
  } | null>(null)
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([])

  const handleManualCheckIn = async () => {
    if (!manualCode.trim()) {
      setLastResult({
        success: false,
        message: 'Please enter a check-in code'
      })
      return
    }

    setIsProcessing(true)
    try {
      const result = await onCheckIn(manualCode.trim(), notes.trim() || undefined)
      setLastResult(result)
      
      if (result.success && result.checkIn) {
        setRecentCheckIns(prev => [result.checkIn, ...prev.slice(0, 4)])
        setManualCode('')
        setNotes('')
      }
    } catch (error) {
      setLastResult({
        success: false,
        message: 'Failed to process check-in'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleManualCheckIn()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Event Check-In</h2>
                <p className="text-gray-400">{eventTitle}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Scan Mode Toggle */}
          <div className="flex gap-2 p-1 bg-gray-800 rounded-lg">
            <Button
              variant={scanMode === 'manual' ? 'cyan' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setScanMode('manual')}
            >
              <Hash className="h-4 w-4" />
              Manual Code
            </Button>
            <Button
              variant={scanMode === 'camera' ? 'cyan' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setScanMode('camera')}
            >
              <Camera className="h-4 w-4" />
              Camera Scan
            </Button>
          </div>

          {/* Manual Code Entry */}
          {scanMode === 'manual' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Check-in Code
                </label>
                <Input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter 16-character check-in code"
                  className="font-mono text-center tracking-wider"
                  maxLength={16}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-20 px-4 py-3 rounded-lg border border-gray-700 bg-black/30 backdrop-blur-sm text-white placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 resize-none"
                  placeholder="Add any notes about this check-in..."
                />
              </div>

              <Button
                variant="gradient"
                className="w-full"
                onClick={handleManualCheckIn}
                disabled={isProcessing || !manualCode.trim()}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Check In
                  </div>
                )}
              </Button>
            </div>
          )}

          {/* Camera Scanner */}
          {scanMode === 'camera' && (
            <div className="text-center py-8">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Camera scanning will be available in a future update</p>
              <p className="text-sm text-gray-500">For now, please use manual code entry</p>
            </div>
          )}

          {/* Result Display */}
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${
                lastResult.success
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {lastResult.success ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span className="font-medium">
                  {lastResult.success ? 'Check-in Successful!' : 'Check-in Failed'}
                </span>
              </div>
              <p className="text-sm">{lastResult.message}</p>
              
              {lastResult.success && lastResult.checkIn && (
                <div className="mt-3 pt-3 border-t border-green-500/20">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {lastResult.checkIn.userName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(lastResult.checkIn.checkInTime).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Recent Check-ins */}
          {recentCheckIns.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Recent Check-ins</h3>
              <div className="space-y-2">
                {recentCheckIns.map((checkIn, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-green-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{checkIn.userName}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(checkIn.checkInTime).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default QRCodeScanner