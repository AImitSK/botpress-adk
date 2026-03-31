import { Autonomous, z } from "@botpress/runtime";
import { wpApiFetch } from "./wp-api-client";

export default new Autonomous.Tool({
  name: "searchCountryReps",
  description:
    "Search for international country representatives, distributors, and sales partners. Use when the user asks about representation in a specific country or region.",
  input: z.object({
    search: z
      .string()
      .optional()
      .describe("General search keyword"),
    country: z
      .string()
      .optional()
      .describe("Country name to search for, e.g. Frankreich, USA"),
    region: z
      .string()
      .optional()
      .describe("Region to filter by, e.g. Europa, Asien"),
  }),
  output: z.object({
    representatives: z.array(
      z.object({
        id: z.number(),
        title: z.string(),
        country_code: z.string(),
        country_name: z.string(),
        region: z.string(),
        rep_name: z.string(),
        rep_email: z.string(),
        rep_phone: z.string(),
        rep_company: z.string(),
        rep_website: z.string(),
      })
    ),
    total: z.number(),
  }),
  handler: async ({ search, country, region }) => {
    const res = await wpApiFetch("country-reps", {
      search: search ?? "",
      country: country ?? "",
      region: region ?? "",
    });

    return { representatives: res.data, total: res.total };
  },
});
