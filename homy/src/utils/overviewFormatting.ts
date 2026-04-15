const SENTENCE_SPLIT_REGEX = /(?<=[.!?])\s+(?=[A-Z0-9"'(\[])/g;

function normalizeLines(text: string): string {
    return text
        .replace(/\r\n/g, "\n")
        .replace(/\t/g, " ")
        .replace(/[ \u00A0]+/g, " ")
        .trim();
}

/**
 * Turns freeform overview text into readable display paragraphs.
 * Honors user-entered blank lines first; if none exist, it groups
 * long blocks into smaller chunks by sentence.
 */
export function formatOverviewParagraphs(rawText?: string, sentencesPerParagraph = 2): string[] {
    if (!rawText) return [];

    const normalized = normalizeLines(rawText);
    if (!normalized) return [];

    // Respect explicit paragraph breaks from the author.
    const userParagraphs = normalized
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);

    if (userParagraphs.length > 1) return userParagraphs;

    // If author used " | " separators, display each segment as its own line.
    if (normalized.includes(" | ")) {
        return normalized
            .split(/\s+\|\s+/)
            .map((part) => part.trim())
            .filter(Boolean);
    }

    // Auto-group long one-block descriptions into short paragraphs.
    const sentences = normalized
        .split(SENTENCE_SPLIT_REGEX)
        .map((s) => s.trim())
        .filter(Boolean);

    if (sentences.length <= sentencesPerParagraph) return [normalized];

    const grouped: string[] = [];
    for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
        grouped.push(sentences.slice(i, i + sentencesPerParagraph).join(" "));
    }
    return grouped;
}
