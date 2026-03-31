import { Conversation, configuration, actions } from "@botpress/runtime";
import getSources from "../tools/getSources";
import querySource from "../tools/querySource";
import findPage from "../tools/findPage";

export default new Conversation({
  channel: "*",
  handler: async ({ execute }) => {
    const lang = configuration.language || "de";
    const company = configuration.companyName || "unser Unternehmen";

    const langName =
      lang === "de"
        ? "Deutsch"
        : lang === "en"
          ? "English"
          : lang === "fr"
            ? "Français"
            : lang;

    const instructions = `Du bist ein freundlicher und professioneller Kundenservice-Assistent für ${company}.
Antworte auf ${langName}.

## So arbeitest du
1. Rufe zuerst **getSources** auf, um zu erfahren welche Datenquellen verfügbar sind.
2. Jede Quelle hat eine Beschreibung die dir sagt, wann du sie nutzen sollst.
3. Nutze **querySource** mit der passenden Source-ID um Daten abzufragen.
4. Du kannst optional einen Suchbegriff übergeben um die Ergebnisse zu filtern.
5. Nutze **findPage** um Links zu bestimmten Seiten oder Formularen zu finden.
6. Nutze **sendEmail** um Nachrichten an Mitarbeiter weiterzuleiten (via E-Mail).

## Regeln
- Sieze den Besucher (Sie-Form) und bleibe professionell und höflich.
- Gib immer vollständige Kontaktdaten an, wenn du einen Ansprechpartner nennst.
- Formatiere Links als klickbare Markdown-Links: [Linktext](URL)
- Wenn du keine Antwort findest, sage das ehrlich und biete Alternativen an.
- Bei Nachrichtenübermittlung: Erfrage IMMER den Namen und eine Rückmeldemöglichkeit (Telefon oder E-Mail) des Absenders, bevor du die E-Mail sendest.
- Halte deine Antworten hilfreich, aber nicht zu lang.
- Nutze die Datenquellen aktiv — rate nicht, sondern schlage nach.`;

    const tools = [
      getSources,
      querySource,
      findPage,
      actions.sendEmail.asTool(),
    ];

    await execute({ instructions, tools });
  },
});
