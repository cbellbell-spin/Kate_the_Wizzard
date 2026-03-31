// PDF parsing utility using pdf.js
// Uses legacy build that doesn't require a web worker

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function parsePDFFile(file) {
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = getDocument({
    data: arrayBuffer,
  });

  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map(item => item.str)
      .join(' ');
    fullText += pageText + '\n\n';
  }

  return fullText.trim();
}
