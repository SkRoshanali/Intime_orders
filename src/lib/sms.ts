/**
 * Send SMS via textbee.dev gateway or log to console in dev mode
 */
export async function sendSms(phone: string, message: string): Promise<void> {
  const gatewayUrl = process.env.SMS_GATEWAY_URL;
  const apiKey = process.env.SMS_GATEWAY_API_KEY;

  // Dev mode: log to console
  if (!gatewayUrl) {
    console.log('[SMS/DEV] SMS (dev mode):', { phone, message });
    return;
  }

  // Production: send via gateway
  try {
    console.log('[SMS/SEND] Sending to gateway:', {
      gatewayUrl: `${gatewayUrl.substring(0, 50)}...`,
      phone: phone,
      hasApiKey: !!apiKey,
      message: message.substring(0, 50),
    });

    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey!,
      },
      body: JSON.stringify({
        recipients: [`+91${phone}`],
        message,
      }),
    });

    console.log('[SMS/RESPONSE] Status:', response.status);

    if (!response.ok) {
      throw new Error(`SMS gateway error: ${response.statusText}`);
    }
  } catch (error) {
    console.error('[SMS/ERROR] Failed to send SMS:', error);
    throw error;
  }
}
