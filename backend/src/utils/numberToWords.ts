const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertHundreds(num: number): string {
  let result = '';
  if (num > 99) {
    result += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  if (num > 19) {
    result += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  if (num > 9 && num < 20) {
    result += teens[num - 10] + ' ';
    return result;
  }
  if (num > 0) {
    result += ones[num] + ' ';
  }
  return result;
}

export function numberToWords(num: number, currency: string = 'INR'): string {
  if (num === 0) return 'Zero Only';
  
  const currencyNames: Record<string, string> = {
    INR: 'Rupees',
    USD: 'Dollars',
    EUR: 'Euros',
    GBP: 'Pounds',
    AED: 'Dirhams',
  };
  
  const currencyName = currencyNames[currency] || 'Rupees';
  let wholePart = Math.floor(num);
  const decimalPart = Math.round((num - wholePart) * 100);
  
  let result = '';
  
  if (wholePart >= 10000000) {
    const crores = Math.floor(wholePart / 10000000);
    result += convertHundreds(crores) + 'Crore ';
    wholePart %= 10000000;
  }
  
  if (wholePart >= 100000) {
    const lakhs = Math.floor(wholePart / 100000);
    result += convertHundreds(lakhs) + 'Lakh ';
    wholePart %= 100000;
  }
  
  if (wholePart >= 1000) {
    const thousands = Math.floor(wholePart / 1000);
    result += convertHundreds(thousands) + 'Thousand ';
    wholePart %= 1000;
  }
  
  result += convertHundreds(wholePart);
  result += currencyName;
  
  if (decimalPart > 0) {
    result += ' and ' + convertHundreds(decimalPart) + (currency === 'INR' ? 'Paise' : 'Cents') + ' Only';
  } else {
    result += ' Only';
  }
  
  return result.trim();
}
