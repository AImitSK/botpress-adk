import { Autonomous, z } from "@botpress/runtime";
import { wpApiFetch } from "./wp-api-client";

export default new Autonomous.Tool({
  name: "searchContacts",
  description:
    "Search for company contacts and staff members. Use when the user asks about a person, department, or who is responsible for something.",
  input: z.object({
    search: z
      .string()
      .optional()
      .describe("Name or keyword to search for"),
    department: z
      .string()
      .optional()
      .describe("Department to filter by, e.g. Vertrieb, Technik"),
    role: z
      .string()
      .optional()
      .describe("Role to filter by, e.g. Geschäftsführer, Projektleiter"),
  }),
  output: z.object({
    contacts: z.array(
      z.object({
        id: z.number(),
        title: z.string(),
        email: z.string(),
        phone: z.string(),
        department: z.string(),
        role: z.string(),
        location: z.string(),
        photo_url: z.string(),
      })
    ),
    total: z.number(),
  }),
  handler: async ({ search, department, role }) => {
    const res = await wpApiFetch("contacts", {
      search: search ?? "",
      department: department ?? "",
      role: role ?? "",
    });

    return { contacts: res.data, total: res.total };
  },
});
