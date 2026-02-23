import generatePayload from 'promptpay-qr'
import QRCode from 'qrcode'

/**
 * Generate a PromptPay QR Code as a base64 Data URL
 * @param promptpayId - Phone number (0xxxxxxxxx) or National ID (13 digits)
 * @param amount - Amount in THB (0 for no amount)
 * @returns Data URL string (image/png base64)
 */
export async function generatePromptPayQR(promptpayId: string, amount: number): Promise<string> {
    const payload = generatePayload(promptpayId, { amount })
    const dataUrl = await QRCode.toDataURL(payload, {
        width: 300,
        margin: 2,
        color: { dark: '#1e293b', light: '#ffffff' },
        errorCorrectionLevel: 'M',
    })
    return dataUrl
}
