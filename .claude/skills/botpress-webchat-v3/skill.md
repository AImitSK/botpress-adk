# Botpress Webchat v3 Skill

Use this skill when working with Botpress Webchat v3.x — embedding, styling, events, methods, or React components.

TRIGGER when: code contains `botpress.init`, `cdn.botpress.cloud/webchat/v3`, webchat configuration, or user asks about webchat embed/styling.

## Quick Reference

### Embed (inject.js)

```html
<script src="https://cdn.botpress.cloud/webchat/v3.6/inject.js"></script>
<script>
  window.botpress.init({
    botId: "your-bot-id",
    clientId: "your-client-id",
    configuration: {
      botName: "Support Bot",
      botAvatar: "https://example.com/avatar.png",
      botDescription: "How can I help?",
      composerPlaceholder: "Type your message...",
      color: "#3276EA",
      variant: "soft",
      themeMode: "light",
      fontFamily: "inter",
      radius: 1,
      headerVariant: "glass",
      allowFileUpload: false,
      feedbackEnabled: false,
      footer: "",
      website: { title: "Website", link: "https://example.com" },
      email: { title: "Email", link: "mailto:info@example.com" },
      phone: { title: "Phone", link: "tel:+49123456" },
      termsOfService: { title: "ToS", link: "https://example.com/tos" },
      privacyPolicy: { title: "Privacy", link: "https://example.com/privacy" },
      additionalStylesheetUrl: "https://example.com/custom.css",
      fabImage: "custom",
      storageLocation: "localStorage",
    },
  });
</script>
```

### IMPORTANT: v3 vs v2 Breaking Changes
- `webchatId` → **`clientId`** (REQUIRED)
- `theme.color` → **`configuration.color`**
- `theme.backgroundColor` → use CSS or `themeMode`
- `theme.fontFamily` → **`configuration.fontFamily`**
- `composerPlaceholder` → **`configuration.composerPlaceholder`**
- `botName` → **`configuration.botName`**
- `botAvatar` → **`configuration.botAvatar`**
- Config is now nested under `configuration` object

---

## Configuration Reference

### `init()` Top-Level Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clientId` | string | YES | Webchat client ID (from Dashboard → Advanced Settings) |
| `botId` | string | no | Bot identifier |
| `configuration` | object | no | Styling and behavior config (see below) |

### `configuration` Object

#### Bot Identity
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `botName` | string | "Bot" | Display name in header |
| `botAvatar` | string | auto | Avatar image URL |
| `botDescription` | string | "" | Description text |
| `composerPlaceholder` | string | "Type your message..." | Input placeholder text |
| `footer` | string | "" | Custom footer text (Plus plan) |
| `fabImage` | string | "default" | FAB button image: "default" or "custom" URL |

#### Contact Info (all optional)
| Parameter | Type | Description |
|-----------|------|-------------|
| `website` | `{title, link}` | Website link |
| `email` | `{title, link}` | Email link (mailto:) |
| `phone` | `{title, link}` | Phone link (tel:) |
| `termsOfService` | `{title, link}` | Terms of Service link |
| `privacyPolicy` | `{title, link}` | Privacy Policy link |

#### Appearance
| Parameter | Type | Default | Values |
|-----------|------|---------|--------|
| `color` | string | "#3276EA" | Hex color code |
| `fontFamily` | string | "inter" | Google Fonts name |
| `themeMode` | string | "light" | "light", "dark" |
| `variant` | string | "soft" | "soft", "solid" |
| `headerVariant` | string | "glass" | "glass", "solid" |
| `radius` | number | 1 | 0 (square) to 1 (fully rounded) |

#### Features
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `allowFileUpload` | boolean | false | Allow file uploads |
| `feedbackEnabled` | boolean | false | Message feedback buttons |
| `storageLocation` | string | "localStorage" | "localStorage" or "sessionStorage" |
| `additionalStylesheetUrl` | string | "" | URL to custom CSS file |

---

## Methods (window.botpress.*)

### Window Control
```js
window.botpress.open()    // Open webchat
window.botpress.close()   // Close webchat
window.botpress.toggle()  // Toggle open/close
```

### User Management
```js
// Update user data (available after webchat:initialized)
await window.botpress.updateUser({
  name: "John Doe",
  pictureUrl: "https://example.com/photo.jpg",
  data: { email: "john@example.com", role: "customer" },
  userKey: "custom-id-123",
});

// Get user data
const user = await window.botpress.getUser();
// Returns: { id, createdAt, updatedAt, name, pictureUrl, data, userKey }
```

### Messaging
```js
// Send message on behalf of user (available after webchat:ready)
await window.botpress.sendMessage("Hello!");

// Send custom event to bot
await window.botpress.sendEvent({ type: "page_view", url: "/products" });
```

### Runtime Config Update
```js
// Update any configuration at runtime (partial updates supported)
window.botpress.config({
  configuration: {
    themeMode: "dark",
    color: "#FF0000",
    botName: "Night Bot",
  },
  user: {
    name: "Updated Name",
    data: { theme: "dark" },
  },
});
```

### Notifications
```js
window.botpress.setUnreadMessageCount(5); // Set badge count on FAB
```

---

## Events (window.botpress.on)

```js
// Subscribe (returns unsubscribe function)
const unsub = window.botpress.on("event-name", (data) => { ... });
unsub(); // Unsubscribe
```

| Event | Payload | When |
|-------|---------|------|
| `webchat:initialized` | none | Webchat loaded, ready to open |
| `webchat:ready` | none | First open, ready for messages |
| `webchat:opened` | none | Window opened |
| `webchat:closed` | none | Window closed |
| `conversation` | `{ conversationId }` | New conversation starts |
| `message` | `{ message }` | User or bot sends message |
| `error` | `{ error }` | Error occurs |
| `customEvent` | `{ event }` | Bot triggers custom event |
| `*` | varies | Wildcard — catches all events |

### Common Pattern: Send User Data on Init
```js
window.botpress.on("webchat:initialized", async () => {
  await window.botpress.updateUser({
    data: {
      pageUrl: window.location.href,
      pageTitle: document.title,
      language: navigator.language,
    },
  });
});
```

---

## Embed in Element (v3.3+)

Instead of floating widget, embed in a specific div:

1. Dashboard → Webchat → Deploy Settings → "Embedded"
2. Set Element ID (default: `bp-embedded-webchat`)
3. Add div to your HTML:
```html
<div id="bp-embedded-webchat" style="width: 400px; height: 600px;"></div>
```

---

## React Library (@botpress/webchat)

### Batteries-Included
```tsx
import { Webchat } from "@botpress/webchat";

function App() {
  return (
    <Webchat
      clientId="your-client-id"
      style={{ width: "400px", height: "600px" }}
      configuration={{ color: "#FF0000", themeMode: "dark" }}
      additionalStylesheetUrl="https://example.com/custom.css"
    />
  );
}
```

### Manual Build (useWebchat hook)
```tsx
import { useWebchat, Header, MessageList, Composer, Container, Fab } from "@botpress/webchat";

function CustomChat() {
  const { client, messages, isTyping, user, clientState, newConversation } = useWebchat({ clientId: "..." });

  return (
    <Container connected={clientState === "connected"}>
      <Header configuration={{}} closeWindow={() => {}} restartConversation={newConversation} />
      <MessageList messages={messages} isTyping={isTyping} sendMessage={client.sendMessage} />
      <Composer sendMessage={client.sendMessage} connected={clientState === "connected"} />
    </Container>
  );
}
```

### React Components Props

| Component | Key Props |
|-----------|-----------|
| `Webchat` | clientId, style, configuration, additionalStylesheetUrl |
| `Container` | connected, style |
| `Header` | defaultOpen, closeWindow, restartConversation, disabled, configuration |
| `MessageList` | botName, botDescription, botAvatar, isTyping, headerMessage, showMarquee, messages, sendMessage |
| `Composer` | disableComposer, isReadOnly, allowFileUpload, connected, sendMessage, uploadFile, composerPlaceholder |
| `Fab` | onClick, style |

### React Events (useWebchat hook)
Same events as inject.js plus: `webchatVisibility`, `webchatConfig`, `isTyping`

---

## Custom CSS

Use `additionalStylesheetUrl` for custom CSS. Target these CSS classes:
- `.bpw-*` — Legacy class prefix
- Webchat v3 uses Shadow DOM — custom CSS must be loaded via the configuration URL

Example custom stylesheet:
```css
/* Override primary button color */
[data-testid="composer-send-button"] {
  background-color: #FF0000 !important;
}

/* Hide powered by */
[data-testid="powered-by"] {
  display: none !important;
}
```

---

## Sources
- https://botpress.com/docs/webchat/get-started/configure-your-webchat
- https://botpress.com/docs/webchat/interact/reference
- https://botpress.com/docs/webchat/interact/listen-to-events
- https://botpress.com/docs/webchat/interact/send-user-data
- https://botpress.com/docs/webchat/interact/update-config
- https://botpress.com/docs/webchat/react-library/get-started
- https://botpress.com/docs/webchat/get-started/embed-in-element
