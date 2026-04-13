/**
 * Send OTP email via Resend HTTP API when RESEND_API_KEY is set;
 * otherwise log in development (no email sent).
 */
export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim() || "Jumpa <onboarding@resend.dev>";

  if (!key) {
    // if (process.env.NODE_ENV === "development") {
    //   console.log(`[email-otp] (dev, no RESEND_API_KEY) OTP for ${to}: ${code}`);
    // } else {
    //   console.warn("[email-otp] RESEND_API_KEY missing — OTP not emailed");
    // }
    console.warn("[email-otp] RESEND_API_KEY missing — OTP not emailed");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Your Jumpa verification code",
      html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend failed: ${res.status} ${text}`);
  }
}
