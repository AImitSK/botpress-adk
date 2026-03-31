import { z, defineConfig } from "@botpress/runtime";

export default defineConfig({
  name: "botpress-adk",
  description: "An AI agent built with Botpress ADK",

  defaultModels: {
    autonomous: "cerebras:gpt-oss-120b",
    zai: "cerebras:gpt-oss-120b",
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
