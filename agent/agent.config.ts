import { z, defineConfig } from "@botpress/runtime";

export default defineConfig({
  name: "botpress-adk",
  description: "AI support bot for website visitors — finds contacts, products, downloads, country reps and forwards messages",

  defaultModels: {
    autonomous: "cerebras:gpt-oss-120b",
    zai: "cerebras:gpt-oss-120b",
  },

  configuration: {
    schema: z.object({
      wordpressBaseUrl: z
        .string()
        .describe("WordPress REST API base URL, e.g. https://example.com/wp-json"),
      wpApiToken: z
        .string()
        .describe("Bearer token generated in the WordPress plugin settings"),
      companyName: z
        .string()
        .default("Our Company")
        .describe("Company name used in bot responses"),
      language: z
        .string()
        .default("de")
        .describe("Response language code (de, en, fr)"),
      sendgridApiKey: z
        .string()
        .default("")
        .describe("SendGrid API key for email forwarding"),
      sendgridFromEmail: z
        .string()
        .default("")
        .describe("Sender email address for SendGrid"),
    }),
  },

  bot: {
    state: z.object({}),
  },

  user: {
    state: z.object({}),
  },

  dependencies: {
    integrations: {
      chat: {
        version: "chat@latest",
        enabled: true,
      },
      webchat: {
        version: "webchat@latest",
        enabled: true,
      },
    },
  },
});
