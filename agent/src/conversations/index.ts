import { Conversation, configuration, actions, user } from "@botpress/runtime";
import getSources from "../tools/getSources";
import querySource from "../tools/querySource";
import findPage from "../tools/findPage";
import { wpApiFetch } from "../tools/wp-api-client";
import usageLogs from "../tables/usageLogs";

/** Get today's date as YYYY-MM-DD string */
function today(): string {
  return new Date().toISOString().split("T")[0];
}

/** Get first day of current month as YYYY-MM-DD */
function monthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export default new Conversation({
  channel: "*",
  handler: async ({ execute, chat }) => {
    // --- Budget check ---
    const monthlyLimit = configuration.monthlyBudgetUsd || 0;

    if (monthlyLimit > 0) {
      try {
        const start = monthStart();
        const { rows } = await usageLogs.findRows({
          filter: { date: { $gte: start } },
        });

        const totalSpend = rows.reduce(
          (sum, r) => sum + (r.ai_spend_usd || 0),
          0,
        );

        if (totalSpend >= monthlyLimit) {
          await chat.respond(
            "Unser Chat-Assistent ist derzeit nicht verfügbar. " +
              "Bitte kontaktieren Sie uns direkt per Telefon oder E-Mail.",
          );
          return;
        }
      } catch {
        // Table might not exist yet on first run — continue
      }
    }

    // --- Load site info + prompt config from WordPress ---
    const defaultLang = configuration.language || "de";
    const company = configuration.companyName || "unser Unternehmen";

    let systemPrompt = "";
    let fallbackBehavior = "";
    let restrictions = "";
    let contactEmail = "";
    let contactPhone = "";
    let multilingual = false;
    let detectionMethod = "url_prefix";
    let availableLanguages = "";
    let wpmlActive = false;

    try {
      const siteInfo = await wpApiFetch("site-info");
      const info = siteInfo.data?.[0] ?? {};
      systemPrompt = info.system_prompt || "";
      fallbackBehavior = info.fallback_behavior || "";
      restrictions = info.restrictions || "";
      contactEmail = info.contact_email || "";
      contactPhone = info.contact_phone || "";
      multilingual = !!info.multilingual;
      detectionMethod = info.detection_method || "url_prefix";
      availableLanguages = info.available_languages || "";
      wpmlActive = !!info.wpml_active;
    } catch {
      // WordPress unreachable — use defaults
    }

    // --- Detect visitor language ---
    let visitorLang = defaultLang;

    if (multilingual) {
      const pageUrl = user.state?.pageUrl || "";

      if (detectionMethod === "url_prefix" && pageUrl) {
        const langs = availableLanguages
          .split(",")
          .map((l: string) => l.trim())
          .filter(Boolean);
        const urlMatch = pageUrl.match(/\/([a-z]{2})\//);
        if (urlMatch && langs.includes(urlMatch[1])) {
          visitorLang = urlMatch[1];
        }
      } else if (detectionMethod === "url_param" && pageUrl) {
        const langParam = new URL(pageUrl).searchParams.get("lang");
        if (langParam) {
          visitorLang = langParam;
        }
      }
      // "auto" mode: the LLM detects language from the message itself
    }

    const langNames: Record<string, string> = {
      de: "Deutsch", en: "English", fr: "Français",
      nl: "Nederlands", it: "Italiano", pl: "Polski",
      es: "Español", pt: "Português", zh: "中文", ja: "日本語",
    };
    const langName = langNames[visitorLang] || visitorLang;

    // Build instructions from configurable parts + fixed tool instructions
    const roleSection = systemPrompt
      ? systemPrompt
      : `Du bist ein freundlicher und kompetenter Support-Assistent für ${company}.`;

    const fallbackSection = fallbackBehavior
      ? `\n\n## Wenn du keine Antwort findest\n${fallbackBehavior}`
      : "";

    const restrictionSection = restrictions
      ? `\n\n## Das darfst du NIEMALS tun\n${restrictions}`
      : "";

    const contactInfo =
      contactEmail || contactPhone
        ? `\nKontaktdaten des Unternehmens: ${[contactEmail, contactPhone].filter(Boolean).join(", ")}`
        : "";

    const instructions = `${roleSection}
Deine Standard-Sprache ist ${langName}. Wenn der Besucher dich in einer anderen Sprache anschreibt, antworte in seiner Sprache.${contactInfo}${wpmlActive ? `\nWichtig: Übergib bei querySource und findPage immer den Parameter lang="${visitorLang}" damit die Daten in der richtigen Sprache geliefert werden.` : ""}

## So arbeitest du
1. Rufe zuerst **getSources** auf, um zu erfahren welche Datenquellen verfügbar sind.
2. Jede Quelle hat eine Beschreibung die dir sagt, wann du sie nutzen sollst. Die Beschreibungen sind in der Standard-Sprache (${langNames[defaultLang] || defaultLang}) — übersetze die Suchbegriffe des Besuchers in diese Sprache bevor du die Datenquellen abfragst.
3. Nutze **querySource** mit der passenden Source-ID um Daten abzufragen.
4. Du kannst optional einen Suchbegriff übergeben um die Ergebnisse zu filtern.
5. Nutze **findPage** um Links zu bestimmten Seiten oder Formularen zu finden.
6. Nutze **sendEmail** um Nachrichten an Mitarbeiter weiterzuleiten (via E-Mail).

## WICHTIG: Immer zuerst die Datenquellen nutzen!
Du MUSST bei jeder inhaltlichen Frage zuerst getSources und dann querySource aufrufen, BEVOR du antwortest oder den Fallback nutzt. Antworte NIEMALS mit "Das kann ich nicht beantworten" ohne vorher die Datenquellen abgefragt zu haben. Probiere verschiedene Suchbegriffe wenn die erste Suche keine Treffer liefert.

## Regeln
- Sieze den Besucher (Sie-Form) und bleibe professionell und höflich.
- Gib immer vollständige Kontaktdaten an, wenn du einen Ansprechpartner nennst.
- Formatiere Links als klickbare Markdown-Links: [Linktext](URL)
- Bei Nachrichtenübermittlung: Erfrage IMMER den Namen und eine Rückmeldemöglichkeit (Telefon oder E-Mail) des Absenders, bevor du die E-Mail sendest.
- Halte deine Antworten hilfreich, aber nicht zu lang.
- Nutze die Datenquellen aktiv — rate nicht, sondern schlage nach.${restrictionSection}${fallbackSection}`;

    const tools = [
      getSources,
      querySource,
      findPage,
      actions.sendEmail.asTool(),
    ];

    let result: any;
    try {
      result = await execute({ instructions, tools });
    } catch (execErr) {
      console.error("[usage-tracking] execute() threw:", execErr);
      return;
    }

    // --- Track usage after execution ---
    try {
      const date = today();
      let inputTokens = 0;
      let outputTokens = 0;
      let spendUsd = 0;

      // Extract token/spend data from execution result
      if (result) {
        // Try context.iterations (llmz result structure)
        const iterations = result.context?.iterations ?? result.iterations ?? [];
        for (const iteration of iterations) {
          const llm = (iteration as any)?.llm;
          if (llm) {
            inputTokens += llm.usage?.inputTokens ?? 0;
            outputTokens += llm.usage?.outputTokens ?? 0;
            spendUsd += llm.spend ?? 0;
          }
        }
      }

      console.log(
        `[usage-tracking] date=${date} tokens=${inputTokens}/${outputTokens} spend=$${spendUsd}`,
      );

      const { rows } = await usageLogs.findRows({
        filter: { date },
        limit: 1,
      });

      if (rows.length > 0) {
        const row = rows[0];
        await usageLogs.updateRows({
          rows: [
            {
              id: row.id,
              messages: (row.messages || 0) + 1,
              input_tokens: (row.input_tokens || 0) + inputTokens,
              output_tokens: (row.output_tokens || 0) + outputTokens,
              ai_spend_usd: (row.ai_spend_usd || 0) + spendUsd,
            },
          ],
        });
        console.log("[usage-tracking] Updated existing row:", row.id);
      } else {
        const created = await usageLogs.createRows({
          rows: [
            {
              date,
              conversations: 0,
              messages: 1,
              input_tokens: inputTokens,
              output_tokens: outputTokens,
              ai_spend_usd: spendUsd,
            },
          ],
        });
        console.log("[usage-tracking] Created new row:", created);
      }
    } catch (trackErr) {
      console.error("[usage-tracking] Tracking failed:", trackErr);
    }
  },
});
