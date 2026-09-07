// Utility for cleaning text and removing markdown heading symbols (#) and bold asterisks (**)
// As requested by the user:
// "Do not use Markdown heading symbols such as # or ##."
// "Do not use bold formatting using **."
// "Do not use decorative markdown formatting."
// "Use clean plain-text section titles, cards, tabs, tables, bullet points, code blocks, and UI components instead."

export function cleanPlainText(text: string): string {
  if (!text) return '';

  return text
    // Remove markdown heading hashes: # Title, ## Title, ### Title -> Title (uppercase or plain)
    .replace(/^#{1,6}\s*(.*)$/gm, (_match, title) => {
      return title.trim().toUpperCase();
    })
    // Remove bold asterisks: **text** -> text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove single asterisks: *text* -> text
    .replace(/\*(.*?)\*/g, '$1')
    // Remove __text__ bold
    .replace(/__(.*?)__/g, '$1')
    // Remove _text_ italic
    .replace(/_(.*?)_/g, '$1')
    // Normalize bullets: * bullet -> - bullet
    .replace(/^\s*\*\s+/gm, '- ')
    // Remove decorative markdown horizontal lines
    .replace(/^---+$/gm, '')
    .replace(/^===+$/gm, '')
    // Clean excessive blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function parseFormattedBlocks(text: string): Array<{
  type: 'heading' | 'paragraph' | 'bullet' | 'code' | 'label_value';
  content: string;
  codeLang?: string;
  label?: string;
  value?: string;
}> {
  if (!text) return [];

  const cleaned = cleanPlainText(text);
  const lines = cleaned.split('\n');
  const blocks: Array<{
    type: 'heading' | 'paragraph' | 'bullet' | 'code' | 'label_value';
    content: string;
    codeLang?: string;
    label?: string;
    value?: string;
  }> = [];

  let inCode = false;
  let codeBuffer: string[] = [];
  let codeLang = 'python';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCode) {
        blocks.push({
          type: 'code',
          content: codeBuffer.join('\n'),
          codeLang
        });
        codeBuffer = [];
        inCode = false;
      } else {
        inCode = true;
        codeLang = line.trim().replace('```', '').trim() || 'python';
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if line is a bullet
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      blocks.push({
        type: 'bullet',
        content: trimmed.replace(/^[-•]\s*/, '')
      });
      continue;
    }

    // Check if line is Label: Value
    const labelMatch = trimmed.match(/^([A-Za-z0-9\s/_-]{3,35}):\s+(.+)$/);
    if (labelMatch && !trimmed.startsWith('http')) {
      blocks.push({
        type: 'label_value',
        content: trimmed,
        label: labelMatch[1].trim(),
        value: labelMatch[2].trim()
      });
      continue;
    }

    // Check if line is a standalone uppercase section title
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 60 && !trimmed.includes('.')) {
      blocks.push({
        type: 'heading',
        content: trimmed
      });
      continue;
    }

    // Default paragraph
    blocks.push({
      type: 'paragraph',
      content: trimmed
    });
  }

  if (inCode && codeBuffer.length > 0) {
    blocks.push({
      type: 'code',
      content: codeBuffer.join('\n'),
      codeLang
    });
  }

  return blocks;
}
