import { Autonomous, z } from "@botpress/runtime";
import { wpApiFetch } from "./wp-api-client";

export default new Autonomous.Tool({
  name: "getSiteInfo",
  description:
    "Get information about the website and which data sources are available. Call this at the start of a conversation to know what tools you can use.",
  input: z.object({}),
  output: z.object({
    site_name: z.string(),
    site_url: z.string(),
    language: z.string(),
    data_sources: z.object({
      contacts: z.boolean(),
      products: z.boolean(),
      downloads: z.boolean(),
      country_reps: z.boolean(),
    }),
  }),
  handler: async () => {
    const res = await wpApiFetch("site-info");

    return res.data[0];
  },
});
