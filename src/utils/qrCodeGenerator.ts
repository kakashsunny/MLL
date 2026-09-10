import QRCode from 'qrcode';

export interface QrCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Returns the canonical verification URL for a given certificate credential ID.
 */
export function getCertificateVerificationUrl(credentialId: string): string {
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    return `${origin}/?verify=${encodeURIComponent(credentialId)}`;
  }
  return `https://sunnyorg.com/credentials/${encodeURIComponent(credentialId)}`;
}

/**
 * Generates a Data URL (base64 PNG) of a QR code encoding the verification URL and Certificate ID.
 */
export async function generateCertificateQrCode(
  credentialId: string,
  options: QrCodeOptions = {}
): Promise<string> {
  const verificationUrl = getCertificateVerificationUrl(credentialId);
  const dataToEncode = verificationUrl;

  return QRCode.toDataURL(dataToEncode, {
    width: options.width || 256,
    margin: options.margin !== undefined ? options.margin : 1,
    color: {
      dark: options.color?.dark || '#111111',
      light: options.color?.light || '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  });
}

/**
 * Draws a generated QR code image onto an HTML5 CanvasRenderingContext2D.
 */
export async function drawQrCodeOnCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number
): Promise<void> {
  try {
    const qrDataUrl = await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: {
        dark: '#111111',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, x, y, size, size);
        resolve();
      };
      img.onerror = () => {
        console.warn('Failed to load QR image on canvas');
        resolve();
      };
      img.src = qrDataUrl;
    });
  } catch (err) {
    console.error('Error drawing QR code to canvas:', err);
  }
}
