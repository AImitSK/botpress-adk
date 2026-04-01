import { Table, z } from "@botpress/runtime";

export default new Table({
  name: "usageLogsTable",
  description: "Daily usage tracking per bot — messages, conversations, AI spend",
  columns: {
    date: z.string().describe("Date in YYYY-MM-DD format"),
    conversations: z.number().default(0).describe("Number of conversations started on this day"),
    messages: z.number().default(0).describe("Number of messages processed on this day"),
    input_tokens: z.number().default(0).describe("Total input tokens consumed"),
    output_tokens: z.number().default(0).describe("Total output tokens consumed"),
    ai_spend_usd: z.number().default(0).describe("AI spend in USD"),
  },
  keyColumn: "date",
});
