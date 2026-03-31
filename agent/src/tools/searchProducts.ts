import { Autonomous, z } from "@botpress/runtime";
import { wpApiFetch } from "./wp-api-client";

export default new Autonomous.Tool({
  name: "searchProducts",
  description:
    "Search the product catalog. Use when the user asks about products, product recommendations, or technical specifications.",
  input: z.object({
    search: z
      .string()
      .optional()
      .describe("Product name or keyword to search for"),
    category: z
      .string()
      .optional()
      .describe("Product category to filter by"),
  }),
  output: z.object({
    products: z.array(
      z.object({
        id: z.number(),
        title: z.string(),
        category: z.string(),
        sku: z.string(),
        inquiry_form_url: z.string(),
        datasheet_url: z.string(),
        features: z.string(),
      })
    ),
    total: z.number(),
  }),
  handler: async ({ search, category }) => {
    const res = await wpApiFetch("products", {
      search: search ?? "",
      category: category ?? "",
    });

    return { products: res.data, total: res.total };
  },
});
