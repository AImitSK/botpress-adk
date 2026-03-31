import { Trigger, user } from "@botpress/runtime";

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
  },
});
