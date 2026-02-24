import dotenv from "dotenv";

dotenv.config();

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = req.body;

  // Validate input
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Send email via MailerSend REST API
    console.log("Sending email via MailerSend API...");
    const response = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: {
          email: "noreply@thedirectorbala.com",
          name: "thedirectorbala.com Contact Form",
        },
        to: [
          {
            email: "houseofeleven11films@gmail.com",
            name: "House of Eleven 11 Films",
          },
        ],
        subject: `New Contact Form Submission from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #d4af37; margin-bottom: 20px;">New Contact Form Submission</h2>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 10px 0;"><strong>Name:</strong> ${escapeHtml(name)}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
              <p style="margin: 10px 0;"><strong>Message:</strong></p>
              <p style="white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(message)}</p>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              This is an automated notification from your portfolio website.
            </p>
          </div>
        `,
        text: `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        reply_to: {
          email: email,
          name: name,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("MailerSend API error:", error);
      throw new Error(error.message || "Failed to send email via MailerSend");
    }

    console.log("Email sent successfully via MailerSend API");
    return res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error: any) {
    console.error("Error sending email:", error);
    const errorMessage = error?.message || "Unknown error";
    return res.status(500).json({
      error: "Failed to send email",
      details: errorMessage,
    });
  }
}
