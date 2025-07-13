import QRCode from 'qrcode'
import crypto from 'crypto'

export interface QRCodeData {
  eventId: string
  userId: string
  registrationId: string
  timestamp: string
  checkInCode: string
}

class QRCodeService {
  // Generate unique check-in code for event registration
  generateCheckInCode(eventId: string, userId: string, registrationId: string): string {
    const data = `${eventId}-${userId}-${registrationId}-${Date.now()}`
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16).toUpperCase()
  }

  // Generate QR code data for event check-in
  async generateEventQRCode(eventId: string, userId: string, registrationId: string): Promise<{
    qrCodeData: QRCodeData
    qrCodeUrl: string
    checkInCode: string
  }> {
    try {
      const checkInCode = this.generateCheckInCode(eventId, userId, registrationId)
      
      const qrCodeData: QRCodeData = {
        eventId,
        userId,
        registrationId,
        timestamp: new Date().toISOString(),
        checkInCode
      }

      // Generate QR code as data URL
      const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrCodeData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })

      return {
        qrCodeData,
        qrCodeUrl,
        checkInCode
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      throw new Error('Failed to generate QR code')
    }
  }

  // Generate simple QR code for any data
  async generateQRCode(data: string): Promise<string> {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      return qrCodeDataURL
    } catch (error) {
      console.error('Error generating QR code:', error)
      throw new Error('Failed to generate QR code')
    }
  }

  // Verify QR code data for check-in
  verifyQRCode(qrCodeString: string): QRCodeData | null {
    try {
      const qrCodeData = JSON.parse(qrCodeString) as QRCodeData
      
      // Validate required fields
      if (!qrCodeData.eventId || !qrCodeData.userId || !qrCodeData.registrationId || !qrCodeData.checkInCode) {
        return null
      }

      return qrCodeData
    } catch (error) {
      console.error('Error verifying QR code:', error)
      return null
    }
  }

  // Generate QR code for event scanner (admin use)
  async generateScannerQRCode(eventId: string): Promise<string> {
    try {
      const scannerData = {
        type: 'event-scanner',
        eventId,
        timestamp: new Date().toISOString()
      }

      return await QRCode.toDataURL(JSON.stringify(scannerData), {
        width: 200,
        margin: 2,
        color: {
          dark: '#0dcaf0',
          light: '#000000'
        },
        errorCorrectionLevel: 'H'
      })
    } catch (error) {
      console.error('Error generating scanner QR code:', error)
      throw new Error('Failed to generate scanner QR code')
    }
  }
}

export default new QRCodeService()