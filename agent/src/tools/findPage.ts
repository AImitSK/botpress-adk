import { Autonomous, z } from "@botpress/runtime";
import { wpApiFetch } from "./wp-api-client";

export default new Autonomous.Tool({
  name: "findPage",
  description:
    "Find WordPress pages, forms, or landing pages by keyword. Use when the user needs a link to a specific page, contact form, or inquiry form.",
  input: z.object({
    search: z
      .string()
      .describe("Page title or keyword to search for, e.g. Kontakt, Anfrage"),
  }),
  output: z.object({
    pages: z.array(
      z.object({
        id: z.number(),
        title: z.string(),
        url: z.string(),
        excerpt: z.string(),
      })
    ),
    total: z.number(),
  }),
  handler: async ({ search }) => {
    const res = await wpApiFetch("pages", { search });

    return { pages: res.data, total: res.total };
  },
});
