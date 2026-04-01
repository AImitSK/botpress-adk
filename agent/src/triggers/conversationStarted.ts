import { Trigger, user } from "@botpress/runtime";
import usageLogs from "../tables/usageLogs";

export default new Trigger({
  name: "webchatConversationStarted",
  events: ["webchat:conversationStarted"],
  handler: async ({ event }) => {
    // Store page context from webchat userData into user state
    // so the conversation handler can reference it.
    const userData = (event as any).userData;
    if (userData) {
      user.state = {
        ...user.state,
        pageTitle: userData.pageTitle ?? "",
        pageUrl: userData.pageUrl ?? "",
        pageType: userData.pageType ?? "",
      };
    }

    // Track new conversation in usage_logs
    try {
      const date = new Date().toISOString().split("T")[0];
      const { rows } = await usageLogs.findRows({
        filter: { date },
        limit: 1,
      });

      if (rows.length > 0) {
        await usageLogs.updateRows({
          rows: [{ id: rows[0].id, conversations: (rows[0].conversations || 0) + 1 }],
        });
      } else {
        await usageLogs.createRows({
          rows: [{ date, conversations: 1, messages: 0, input_tokens: 0, output_tokens: 0, ai_spend_usd: 0 }],
        });
      }
    } catch (err) {
      console.error("[usage-tracking] Conversation tracking failed:", err);
    }
  },
});
