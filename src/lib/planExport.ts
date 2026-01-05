export const exportBankReadyPDF = async (planDraft: Record<string, string>) => {
  // Placeholder: integrate a real PDF generator (e.g., Puppeteer, PDFMake) on backend.
  console.info('Exporting bank-ready PDF (placeholder)', planDraft);
  // Return a blob/file-like placeholder for now
  const blob = new Blob([JSON.stringify(planDraft, null, 2)], { type: 'application/json' });
  // trigger client download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'business-plan.json';
  a.click();
  URL.revokeObjectURL(url);
};

export const exportGrantAppendix = async (planDraft: Record<string, string>) => {
  console.info('Exporting grant appendix (placeholder)');
};

export const exportCommunitySummary = async (planDraft: Record<string, string>) => {
  console.info('Exporting community summary (placeholder)');
};
