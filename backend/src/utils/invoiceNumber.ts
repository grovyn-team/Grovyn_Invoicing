import Invoice from '../models/Invoice.js';

export async function generateInvoiceNumber(
  invoiceType: string,
  prefix: string = 'GROVYN',
  format: string = '{PREFIX}/{YEAR}/{TYPE}/{NUMBER}'
): Promise<string> {
  const year = new Date().getFullYear();
  const typeMap: Record<string, string> = {
    'Standard Invoice': 'INV',
    'Proforma Invoice': 'PRO',
    'Tax Invoice': 'INV',
    'Credit Note': 'CN',
    'Debit Note': 'DN',
    'Recurring Invoice': 'REC',
    'Advance Invoice': 'ADV',
    'Final Settlement Invoice': 'FS',
  };
  const typeCode = typeMap[invoiceType] || 'INV';
  
  const lastInvoice = await Invoice.findOne({
    invoiceNumber: new RegExp(`^${prefix}/${year}/${typeCode}/`),
  }).sort({ invoiceNumber: -1 });
  
  let nextNumber = 1;
  if (lastInvoice) {
    const match = lastInvoice.invoiceNumber.match(/\/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  
  const number = nextNumber.toString().padStart(4, '0');
  
  return format
    .replace('{PREFIX}', prefix)
    .replace('{YEAR}', year.toString())
    .replace('{TYPE}', typeCode)
    .replace('{NUMBER}', number);
}
