import { Action, z, configuration } from "@botpress/runtime";

export default new Action({
  name: "sendEmail",
  description: "Send an email to a company contact on behalf of the website visitor",
  input: z.object({
    to: z.string().email().describe("Recipient email address"),
    subject: z.string().describe("Email subject line"),
    body: z.string().describe("Email body text"),
    senderName: z
      .string()
      .describe("Name of the website visitor sending the message"),
    senderContact: z
      .string()
      .describe("Callback number or email of the visitor"),
  }),
  output: z.object({
    success: z.boolean(),
    error: z.string().optional(),
  }),
  async handler({ input }) {
    const apiKey = configuration.sendgridApiKey;
    const fromEmail = configuration.sendgridFromEmail;

    if (!apiKey || !fromEmail) {
      return {
        success: false,
        error: "SendGrid is not configured",
      };
    }

    const fullBody = [
      `Nachricht von: ${input.senderName}`,
      `Rückmeldung an: ${input.senderContact}`,
      `---`,
      input.body,
    ].join("\n");

    try {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: input.to }] }],
          from: { email: fromEmail, name: `Website Bot` },
          subject: input.subject,
          content: [{ type: "text/plain", value: fullBody }],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        return { success: false, error: `SendGrid ${res.status}: ${text}` };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
});
