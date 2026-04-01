import { Autonomous, z } from "@botpress/runtime";
import { wpApiFetch } from "./wp-api-client";

export default new Autonomous.Tool({
  name: "querySource",
  description:
    "Query a specific knowledge source by its ID. Use getSources first to find the right source ID. You can optionally search within the source and specify a language for multilingual sites.",
  input: z.object({
    sourceId: z.number().describe("The ID of the source to query (from getSources)"),
    search: z
      .string()
      .optional()
      .describe("Optional search term to filter results"),
    lang: z
      .string()
      .optional()
      .describe("Language code (e.g. en, fr, de) for multilingual sites with WPML/Polylang"),
  }),
  output: z.object({
    source: z.string(),
    prompt: z.string(),
    data: z.array(z.any()),
    total: z.number(),
  }),
  handler: async ({ sourceId, search, lang }) => {
    const params: Record<string, string | number> = {};
    if (search) params.search = search;
    if (lang) params.lang = lang;

    const res = await wpApiFetch(`query/${sourceId}`, params);

    return {
      source: (res as any).source ?? "",
      prompt: (res as any).prompt ?? "",
      data: res.data,
      total: res.total,
    };
  },
});
