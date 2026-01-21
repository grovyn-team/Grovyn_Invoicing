import Quotation from '../models/Quotation.js';

export async function generateQuotationNumber(
  prefix: string = 'GROVYN',
  format: string = '{PREFIX}/{YEAR}/QUO/{NUMBER}'
): Promise<string> {
  const year = new Date().getFullYear();
  
  let searchPattern = `${prefix}/${year}/QUO/`;
  if (format.includes('{TYPE}')) {
    searchPattern = `${prefix}/${year}/QUO/`;
  }
  
  const lastQuotation = await Quotation.findOne({
    quotationNumber: new RegExp(`^${prefix}/${year}/QUO/`),
  }).sort({ quotationNumber: -1 });
  
  let nextNumber = 1;
  if (lastQuotation) {
    const match = lastQuotation.quotationNumber.match(/\/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  
  const number = nextNumber.toString().padStart(4, '0');
  
  return format
    .replace('{PREFIX}', prefix)
    .replace('{YEAR}', year.toString())
    .replace('{TYPE}', 'QUO')
    .replace('{NUMBER}', number);
}
