import OfferLetter from '../models/OfferLetter.js';

export async function generateOfferLetterNumber(
  prefix: string = 'GROVYN',
  format: string = '{PREFIX}/{YEAR}/OFF/{NUMBER}'
): Promise<string> {
  const year = new Date().getFullYear();
  
  const lastOffer = await OfferLetter.findOne({
    offerNumber: new RegExp(`^${prefix}/${year}/OFF/`),
  }).sort({ offerNumber: -1 });
  
  let nextNumber = 1;
  if (lastOffer) {
    const match = lastOffer.offerNumber.match(/\/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  
  const number = nextNumber.toString().padStart(4, '0');
  
  return format
    .replace('{PREFIX}', prefix)
    .replace('{YEAR}', year.toString())
    .replace('{TYPE}', 'OFF')
    .replace('{NUMBER}', number);
}
