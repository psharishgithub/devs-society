import React, { useRef, useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, QrCode, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => Promise<'success' | 'invalid' | 'already_checked_in' | 'error'> | void;
  title?: string;
}

type StatusType = 'idle' | 'scanning' | 'processing' | 'success' | 'invalid' | 'already_checked_in' | 'error';

const statusMessages: Record<StatusType, string> = {
  idle: 'Position the QR code within the frame',
  scanning: 'Position the QR code within the frame',
  processing: 'Processing... Please wait.',
  success: 'Check-in successful!',
  invalid: 'Invalid QR code. Please try again.',
  already_checked_in: 'Already checked in.',
  error: 'An error occurred. Please try again.'
};

const statusIcons: Record<StatusType, React.ReactNode> = {
  idle: <QrCode className="h-6 w-6 text-gray-400 mx-auto mb-2" />,
  scanning: <QrCode className="h-6 w-6 text-gray-400 mx-auto mb-2" />,
  processing: <Loader2 className="h-6 w-6 text-purple-500 mx-auto mb-2 animate-spin" />,
  success: <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />,
  invalid: <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />,
  already_checked_in: <AlertCircle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />,
  error: <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
};

const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, onScan, title = 'QR Code Scanner' }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<StatusType>('idle');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      getCameras();
      setStatus('scanning');
    } else {
      stopScanner();
      setStatus('idle');
    }
    return () => {
      stopScanner();
      setStatus('idle');
    };
    // eslint-disable-next-line
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedCamera && !isScanning) {
      startScanner();
    }
    // eslint-disable-next-line
  }, [selectedCamera, isOpen]);

  const getCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices);
      const backCamera = devices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      if (backCamera) {
        setSelectedCamera(backCamera.id);
      } else if (devices.length > 0) {
        setSelectedCamera(devices[0].id);
      }
    } catch (err) {
      setError('Unable to access cameras. Please ensure camera permissions are granted.');
      setStatus('error');
    }
  };

  const startScanner = async () => {
    if (!selectedCamera) {
      setError('No camera selected');
      setStatus('error');
      return;
    }
    try {
      setError('');
      setIsScanning(true);
      setStatus('scanning');
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2,
      };
      await html5QrCode.start(
        selectedCamera,
        config,
        async (decodedText) => {
          setStatus('processing');
          try {
            const result = await onScan(decodedText);
            if (result === 'success') {
              setStatus('success');
            } else if (result === 'already_checked_in') {
              setStatus('already_checked_in');
            } else if (result === 'invalid') {
              setStatus('invalid');
            } else {
              setStatus('error');
            }
          } catch {
            setStatus('error');
          }
          setTimeout(() => {
            stopScanner();
            onClose();
            setStatus('idle');
          }, 1500);
        },
        (errorMessage) => {
          if (!errorMessage.includes('No QR code found')) {
            setStatus('invalid');
          }
        }
      );
    } catch (err: any) {
      setError(`Failed to start camera: ${err.message || 'Unknown error'}`);
      setIsScanning(false);
      setStatus('error');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        // Ignore
      }
    }
    setIsScanning(false);
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex(camera => camera.id === selectedCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    if (isScanning) {
      await stopScanner();
      setSelectedCamera(nextCamera.id);
      setTimeout(() => {
        setSelectedCamera(nextCamera.id);
        startScanner();
      }, 500);
    } else {
      setSelectedCamera(nextCamera.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">{title}</h3>
          </div>
          <button
            onClick={() => { stopScanner(); onClose(); setStatus('idle'); }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Camera Selection */}
        {cameras.length > 0 && (
          <div className="flex justify-end p-2">
            <button
              className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
              onClick={switchCamera}
              title="Switch camera"
              disabled={cameras.length <= 1}
            >
              <Camera className="w-4 h-4" />
              Switch
            </button>
          </div>
        )}

        {/* QR Reader */}
        <div 
          id="qr-reader" 
          ref={scannerContainerRef} 
          className="w-full max-w-md mx-auto"
          style={{ 
            display: isScanning ? 'block' : 'none',
            border: '2px solid #8B5CF6',
            borderRadius: '12px',
            overflow: 'hidden',
            minHeight: 260
          }}
        />

        {/* Status Message */}
        <div className="text-center py-4">
          {statusIcons[status]}
          <p className={`text-base font-medium ${status === 'success' ? 'text-green-600' : status === 'invalid' ? 'text-red-600' : status === 'already_checked_in' ? 'text-yellow-600' : status === 'processing' ? 'text-purple-600' : 'text-gray-600'}`}>{statusMessages[status]}</p>
        </div>
        {error && (
          <div className="text-center text-red-600 mt-2 text-sm">{error}</div>
        )}
        {!isScanning && cameras.length === 0 && (
          <div className="text-center py-8">
            <Camera size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">No cameras detected</p>
            <button
              onClick={getCameras}
              className="btn-secondary text-sm"
            >
              Retry Camera Detection
            </button>
          </div>
        )}
        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={() => { stopScanner(); onClose(); setStatus('idle'); }}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScanner; 