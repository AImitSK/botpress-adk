import { Autonomous, z } from "@botpress/runtime";
import { wpApiFetch } from "./wp-api-client";

export default new Autonomous.Tool({
  name: "getSources",
  description:
    "Get all available knowledge sources from this website. Call this first to understand what data you can access. Each source has an ID, name, type and a description of what it contains.",
  input: z.object({}),
  output: z.object({
    sources: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        type: z.string(),
        prompt: z.string(),
      })
    ),
  }),
  handler: async () => {
    const res = await wpApiFetch("sources");

    return {
      sources: res.data.map((s: any) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        prompt: s.prompt,
      })),
    };
  },
});
