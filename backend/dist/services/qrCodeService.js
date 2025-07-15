"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const qrcode_1 = __importDefault(require("qrcode"));
const crypto_1 = __importDefault(require("crypto"));
class QRCodeService {
    // Generate unique check-in code for event registration
    generateCheckInCode(eventId, userId, registrationId) {
        const data = `${eventId}-${userId}-${registrationId}-${Date.now()}`;
        return crypto_1.default.createHash('sha256').update(data).digest('hex').substring(0, 16).toUpperCase();
    }
    // Generate QR code data for event check-in
    async generateEventQRCode(eventId, userId, registrationId) {
        try {
            const checkInCode = this.generateCheckInCode(eventId, userId, registrationId);
            const qrCodeData = {
                eventId,
                userId,
                registrationId,
                timestamp: new Date().toISOString(),
                checkInCode
            };
            // Generate QR code as data URL
            const qrCodeUrl = await qrcode_1.default.toDataURL(JSON.stringify(qrCodeData), {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'M'
            });
            return {
                qrCodeData,
                qrCodeUrl,
                checkInCode
            };
        }
        catch (error) {
            console.error('Error generating QR code:', error);
            throw new Error('Failed to generate QR code');
        }
    }
    // Generate simple QR code for any data
    async generateQRCode(data) {
        try {
            const qrCodeDataURL = await qrcode_1.default.toDataURL(data, {
                errorCorrectionLevel: 'M',
                type: 'image/png',
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            return qrCodeDataURL;
        }
        catch (error) {
            console.error('Error generating QR code:', error);
            throw new Error('Failed to generate QR code');
        }
    }
    // Verify QR code data for check-in
    verifyQRCode(qrCodeString) {
        try {
            const qrCodeData = JSON.parse(qrCodeString);
            // Validate required fields
            if (!qrCodeData.eventId || !qrCodeData.userId || !qrCodeData.registrationId || !qrCodeData.checkInCode) {
                return null;
            }
            return qrCodeData;
        }
        catch (error) {
            console.error('Error verifying QR code:', error);
            return null;
        }
    }
    // Generate QR code for event scanner (admin use)
    async generateScannerQRCode(eventId) {
        try {
            const scannerData = {
                type: 'event-scanner',
                eventId,
                timestamp: new Date().toISOString()
            };
            return await qrcode_1.default.toDataURL(JSON.stringify(scannerData), {
                width: 200,
                margin: 2,
                color: {
                    dark: '#0dcaf0',
                    light: '#000000'
                },
                errorCorrectionLevel: 'H'
            });
        }
        catch (error) {
            console.error('Error generating scanner QR code:', error);
            throw new Error('Failed to generate scanner QR code');
        }
    }
}
exports.default = new QRCodeService();
//# sourceMappingURL=qrCodeService.js.map