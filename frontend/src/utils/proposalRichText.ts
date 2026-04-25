import DOMPurify from 'dompurify';
import { marked } from 'marked';

const LIST_LINE_REGEX = /^(\s*[-*+]\s+|\s*\d+\.\s+)/;

export const isLikelyHtml = (content: string): boolean => /<[^>]+>/.test(content);

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export const plainTextToHtml = (input: string): string => {
  if (!input?.trim()) return '';

  const blocks = input.trim().split(/\n\s*\n/);
  return blocks
    .map((block) => {
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
      if (lines.length === 0) return '';

      const allListLines = lines.every((line) => LIST_LINE_REGEX.test(line));
      if (allListLines) {
        const items = lines
          .map((line) => line.replace(LIST_LINE_REGEX, '').trim())
          .filter(Boolean)
          .map((line) => `<li>${escapeHtml(line)}</li>`)
          .join('');
        return `<ul>${items}</ul>`;
      }

      return `<p>${escapeHtml(lines.join(' '))}</p>`;
    })
    .filter(Boolean)
    .join('');
};

export const normalizeToHtml = (content: string): string => {
  if (!content?.trim()) return '';
  return isLikelyHtml(content) ? content : plainTextToHtml(content);
};

export const sanitizeProposalHtml = (content: string): string =>
  DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true },
  });

export const markdownToSanitizedHtml = (markdownContent: string): string => {
  const parsed = marked.parse(markdownContent, {
    breaks: true,
    gfm: true,
    async: false,
  });
  const html = typeof parsed === 'string' ? parsed : '';
  return sanitizeProposalHtml(html);
};

export interface MarkdownSectionData {
  projectName?: string;
  problemStatement?: string;
  solution?: string;
  scope?: string;
  deliverables?: string;
  timelineEstimate?: string;
  exclusions?: string;
  nextSteps?: string;
}

const sectionMatchers: Array<{ key: keyof MarkdownSectionData; regex: RegExp }> = [
  { key: 'problemStatement', regex: /problem|challenge|pain point/i },
  { key: 'solution', regex: /solution|approach|strategy/i },
  { key: 'scope', regex: /scope|in-scope|high[-\s]?level/i },
  { key: 'deliverables', regex: /deliverables|outputs|what you get/i },
  { key: 'timelineEstimate', regex: /timeline|duration|milestone/i },
  { key: 'exclusions', regex: /exclusions|out of scope|not included/i },
  { key: 'nextSteps', regex: /next steps|path forward|follow[-\s]?up/i },
];

export const parseMarkdownToProposalSections = (markdownContent: string): MarkdownSectionData => {
  const lines = markdownContent.split('\n');
  const extracted: MarkdownSectionData = {};
  let currentKey: keyof MarkdownSectionData | null = null;
  let buffer: string[] = [];

  const flushBuffer = () => {
    if (!currentKey || buffer.length === 0) return;
    const value = buffer.join('\n').trim();
    if (!value) return;
    const asHtml = markdownToSanitizedHtml(value);
    if (asHtml) {
      extracted[currentKey] = asHtml;
    }
  };

  for (const rawLine of lines) {
    const headingMatch = rawLine.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      flushBuffer();
      buffer = [];
      const heading = headingMatch[1].trim();
      currentKey = null;

      const match = sectionMatchers.find((matcher) => matcher.regex.test(heading));
      if (!match && !extracted.projectName) {
        extracted.projectName = heading;
      }
      if (match) currentKey = match.key;
      continue;
    }

    if (currentKey) {
      buffer.push(rawLine);
    }
  }

  flushBuffer();

  if (!Object.keys(extracted).some((key) => key !== 'projectName')) {
    extracted.solution = markdownToSanitizedHtml(markdownContent);
  }

  return extracted;
};
