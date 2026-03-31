import { Autonomous, z } from "@botpress/runtime";
import { wpApiFetch } from "./wp-api-client";

export default new Autonomous.Tool({
  name: "searchDownloads",
  description:
    "Search for downloadable files like datasheets, brochures, and technical documents. Use when the user asks for a download, PDF, datasheet, or brochure.",
  input: z.object({
    search: z
      .string()
      .optional()
      .describe("File name or topic to search for"),
    file_type: z
      .string()
      .optional()
      .describe("File type filter, e.g. pdf, dwg"),
    product: z
      .number()
      .optional()
      .describe("Related product ID to filter by"),
  }),
  output: z.object({
    downloads: z.array(
      z.object({
        id: z.number(),
        title: z.string(),
        file_url: z.string(),
        file_type: z.string(),
        file_size: z.string(),
        related_product: z.number(),
      })
    ),
    total: z.number(),
  }),
  handler: async ({ search, file_type, product }) => {
    const res = await wpApiFetch("downloads", {
      search: search ?? "",
      file_type: file_type ?? "",
      product: product ?? 0,
    });

    return { downloads: res.data, total: res.total };
  },
});
