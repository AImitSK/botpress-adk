import { Autonomous, z } from "@botpress/runtime";
import { wpApiFetch } from "./wp-api-client";

export default new Autonomous.Tool({
  name: "querySource",
  description:
    "Query a specific knowledge source by its ID. Use getSources first to find the right source ID. You can optionally search within the source.",
  input: z.object({
    sourceId: z.number().describe("The ID of the source to query (from getSources)"),
    search: z
      .string()
      .optional()
      .describe("Optional search term to filter results"),
  }),
  output: z.object({
    source: z.string(),
    prompt: z.string(),
    data: z.array(z.any()),
    total: z.number(),
  }),
  handler: async ({ sourceId, search }) => {
    const res = await wpApiFetch(`query/${sourceId}`, {
      search: search ?? "",
    });

    return {
      source: (res as any).source ?? "",
      prompt: (res as any).prompt ?? "",
      data: res.data,
      total: res.total,
    };
  },
});
