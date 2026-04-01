import { Action, z } from "@botpress/runtime";
import { wpApiFetch } from "../tools/wp-api-client";

export default new Action({
  name: "sendEmail",
  description:
    "Forward a visitor's message to the team. The message is stored in WordPress and notifications are sent automatically.",
  input: z.object({
    senderName: z
      .string()
      .describe("Name of the website visitor sending the message"),
    senderContact: z
      .string()
      .describe("Email address or phone number of the visitor for callback"),
    message: z.string().describe("The visitor's message to forward"),
  }),
  output: z.object({
    success: z.boolean(),
    error: z.string().optional(),
  }),
  async handler({ input }) {
    try {
      // Determine if contact is email or phone
      const isEmail = input.senderContact.includes("@");

      const res = await wpApiFetch("inquiry", {}, {
        method: "POST",
        body: {
          name: input.senderName,
          email: isEmail ? input.senderContact : "",
          phone: isEmail ? "" : input.senderContact,
          message: input.message,
        },
      });

      if ((res as any).success) {
        return { success: true };
      }

      return {
        success: false,
        error: (res as any).message || "Failed to forward message",
      };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
});
