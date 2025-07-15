export interface QRCodeData {
    eventId: string;
    userId: string;
    registrationId: string;
    timestamp: string;
    checkInCode: string;
}
declare class QRCodeService {
    generateCheckInCode(eventId: string, userId: string, registrationId: string): string;
    generateEventQRCode(eventId: string, userId: string, registrationId: string): Promise<{
        qrCodeData: QRCodeData;
        qrCodeUrl: string;
        checkInCode: string;
    }>;
    generateQRCode(data: string): Promise<string>;
    verifyQRCode(qrCodeString: string): QRCodeData | null;
    generateScannerQRCode(eventId: string): Promise<string>;
}
declare const _default: QRCodeService;
export default _default;
//# sourceMappingURL=qrCodeService.d.ts.map