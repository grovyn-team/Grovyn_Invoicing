import jsPDF from 'jspdf';
import { Invoice } from '../types';

export const generatePDF = (invoice: Invoice): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  doc.setFontSize(24);
  doc.setTextColor(34, 197, 94);
  doc.text('GROVYN', margin, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Software & Platform Engineering', margin, yPos);
  
  yPos += 20;
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', pageWidth - margin, yPos, { align: 'right' });

  yPos += 15;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 6;
  doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 6;
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, pageWidth - margin, yPos, { align: 'right' });

  yPos += 15;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', margin, yPos);
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.clientName, margin, yPos);
  yPos += 6;
  doc.text(invoice.clientAddress, margin, yPos);
  yPos += 6;
  doc.text(`${invoice.clientCity}, ${invoice.clientState} ${invoice.clientZip}`, margin, yPos);
  yPos += 6;
  doc.text(invoice.clientCountry, margin, yPos);
  yPos += 6;
  doc.text(invoice.clientEmail, margin, yPos);

  yPos += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Project: ${invoice.projectName}`, margin, yPos);

  yPos += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', margin, yPos);
  doc.text('Qty', margin + 100, yPos);
  doc.text('Rate', margin + 120, yPos);
  doc.text('Amount', pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 8;
  doc.setLineWidth(0.5);
  doc.line(margin, yPos - 3, pageWidth - margin, yPos - 3);
  
  doc.setFont('helvetica', 'normal');
  invoice.items.forEach((item) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }
    
    const descriptionLines = doc.splitTextToSize(item.description, 80);
    doc.text(descriptionLines, margin, yPos);
    doc.text(item.quantity.toString(), margin + 100, yPos);
    doc.text(`$${item.unitPrice.toFixed(2)}`, margin + 120, yPos);
    doc.text(`$${item.amount.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += Math.max(descriptionLines.length * 6, 8);
  });

  yPos += 10;
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', pageWidth - margin - 50, yPos);
  doc.text(`$${invoice.subtotal.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  const taxRatePercent = invoice.taxAmount > 0 && invoice.subtotal > 0 
    ? ((invoice.taxAmount / (invoice.subtotal - invoice.discountTotal)) * 100).toFixed(1)
    : '0';
  doc.text(`Tax (${taxRatePercent}%):`, pageWidth - margin - 50, yPos);
  doc.text(`$${invoice.taxAmount.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setLineWidth(1);
  doc.line(pageWidth - margin - 50, yPos - 3, pageWidth - margin, yPos - 3);
  doc.text('Total:', pageWidth - margin - 50, yPos);
  doc.text(`$${invoice.total.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });

  if (invoice.notes) {
    yPos += 20;
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(invoice.notes, contentWidth);
    doc.text(notesLines, margin, yPos);
  }

  doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
};
