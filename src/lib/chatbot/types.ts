export type Lang = "tr" | "en";

export type Localized<T = string> = Record<Lang, T>;

export interface IntentLink {
  label: Localized;
  href: string;
}

export interface Intent {
  id: string;
  category: string;
  /** Higher priority intents are suggested first and win ties. */
  priority: number;
  /** Short question shown on suggestion chips, e.g. "Hangi okulda okudun?" */
  title: Localized;
  answer: Localized;
  /** Example phrasings users might type, per language. */
  patterns: Localized<string[]>;
  /** Language-independent single words that strongly hint at this intent. */
  keywords: string[];
  links: IntentLink[];
  /** Intent ids suggested after this answer. */
  followUps: string[];
}

export interface IntentOption {
  id: string;
  title: string;
}

export interface ChatLink {
  label: string;
  href: string;
}

export type ChatResponse =
  | {
      type: "answer";
      intentId: string;
      answer: string;
      links: ChatLink[];
      followUps: IntentOption[];
    }
  | { type: "clarify"; message: string; options: IntentOption[] }
  | { type: "fallback"; message: string; options: IntentOption[] };

export interface ChatRequest {
  message?: string;
  intentId?: string;
  lang?: Lang;
}
