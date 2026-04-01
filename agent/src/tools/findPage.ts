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
    lang: z
      .string()
      .optional()
      .describe("Language code (e.g. en, fr, de) for multilingual sites with WPML/Polylang"),
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
  handler: async ({ search, lang }) => {
    const params: Record<string, string | number> = { search };
    if (lang) params.lang = lang;

    const res = await wpApiFetch("pages", params);

    return { pages: res.data, total: res.total };
  },
});
