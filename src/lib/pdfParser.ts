import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument(arrayBuffer).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    fullText += strings.join(' ') + '\n';
  }

  return fullText;
}

export function parseMCQsFromText(text: string): any[] {
  // Simple regex-based fallback if Gemini is not used
  // Patterns like "১. প্রশ্ন? (ক) (খ) (গ) (ঘ)"
  const mcqs: any[] = [];
  const lines = text.split('\n');
  
  // This is a complex task for pure regex in Bengali due to various formats.
  // We'll primarily suggest the "Smart Extract" (Gemini) or Manual JSON Paste.
  // But here's a basic one for "Question... (A)... (B)... (C)... (D)..."
  
  return mcqs;
}
