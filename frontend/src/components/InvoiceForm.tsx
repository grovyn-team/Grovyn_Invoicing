// @ts-nocheck - This file is unused and uses an old schema
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { InvoiceFormData, InvoiceItem } from '../types';

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormData>;
  onSubmit: (data: InvoiceFormData) => void;
  isSubmitting?: boolean;
}

export default function InvoiceForm({ initialData, onSubmit, isSubmitting }: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceDate: initialData?.invoiceDate || new Date().toISOString().split('T')[0],
    dueDate: initialData?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    projectName: initialData?.projectName || '',
    // @ts-ignore - Old schema fields
    clientName: initialData?.clientName || '',
    // @ts-ignore - Old schema fields
    clientEmail: initialData?.clientEmail || '',
    // @ts-ignore - Old schema fields
    clientAddress: initialData?.clientAddress || '',
    // @ts-ignore - Old schema fields
    clientCity: initialData?.clientCity || '',
    // @ts-ignore - Old schema fields
    clientState: initialData?.clientState || '',
    // @ts-ignore - Old schema fields
    clientZip: initialData?.clientZip || '',
    // @ts-ignore - Old schema fields
    clientCountry: initialData?.clientCountry || 'USA',
    // @ts-ignore - Old schema fields
    items: initialData?.items || [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    // @ts-ignore - Old schema fields
    taxRate: initialData?.taxRate || 0,
    notes: initialData?.notes || '',
    invoiceType: initialData?.invoiceType || 'Tax Invoice',
    currency: initialData?.currency || 'INR',
    exchangeRate: initialData?.exchangeRate || 1,
    taxDetails: initialData?.taxDetails || { isExportOfServices: false },
    status: initialData?.status || 'draft',
  });

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    // @ts-ignore - Old schema uses 'rate' instead of 'unitPrice'
    if (field === 'quantity' || field === 'rate') {
      // @ts-ignore - Old schema uses 'rate' instead of 'unitPrice'
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      // @ts-ignore - Old schema uses 'rate' instead of 'unitPrice'
      items: [...formData.items, { description: '', quantity: 1, rate: 0, amount: 0 }],
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
  // @ts-ignore - Old schema uses 'taxRate' instead of 'taxDetails'
  const taxAmount = (subtotal * formData.taxRate) / 100;
  const total = subtotal + taxAmount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Invoice Date
            </label>
            <input
              type="date"
              value={formData.invoiceDate}
              onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project Name
          </label>
          <input
            type="text"
            value={formData.projectName}
            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {/* @ts-ignore - Old schema field */}
            Client Name
          </label>
          <input
            type="text"
            // @ts-ignore - Old schema field
            value={formData.clientName}
            // @ts-ignore - Old schema field
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {/* @ts-ignore - Old schema field */}
            Client Email
          </label>
          <input
            type="email"
            // @ts-ignore - Old schema field
            value={formData.clientEmail}
            // @ts-ignore - Old schema field
            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {/* @ts-ignore - Old schema field */}
            Client Address
          </label>
          <input
            type="text"
            // @ts-ignore - Old schema field
            value={formData.clientAddress}
            // @ts-ignore - Old schema field
            onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {/* @ts-ignore - Old schema field */}
              City
            </label>
            <input
              type="text"
              // @ts-ignore - Old schema field
              value={formData.clientCity}
              // @ts-ignore - Old schema field
              onChange={(e) => setFormData({ ...formData, clientCity: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {/* @ts-ignore - Old schema field */}
              State
            </label>
            <input
              type="text"
              // @ts-ignore - Old schema field
              value={formData.clientState}
              // @ts-ignore - Old schema field
              onChange={(e) => setFormData({ ...formData, clientState: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {/* @ts-ignore - Old schema field */}
              ZIP Code
            </label>
            <input
              type="text"
              // @ts-ignore - Old schema field
              value={formData.clientZip}
              // @ts-ignore - Old schema field
              onChange={(e) => setFormData({ ...formData, clientZip: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {/* @ts-ignore - Old schema field */}
            Country
          </label>
          <input
            type="text"
            // @ts-ignore - Old schema field
            value={formData.clientCountry}
            // @ts-ignore - Old schema field
            onChange={(e) => setFormData({ ...formData, clientCountry: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Items
          </label>
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {/* @ts-ignore - Old schema uses 'rate' instead of 'unitPrice' */}
                    Rate
                  </label>
                  <input
                    type="number"
                    // @ts-ignore - Old schema uses 'rate' instead of 'unitPrice'
                    value={item.rate}
                    // @ts-ignore - Old schema uses 'rate' instead of 'unitPrice'
                    onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={item.amount}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 transition-colors"
            >
              + Add Item
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {/* @ts-ignore - Old schema uses 'taxRate' instead of 'taxDetails' */}
              Tax Rate (%)
            </label>
            <input
              type="number"
              // @ts-ignore - Old schema uses 'taxRate' instead of 'taxDetails'
              value={formData.taxRate}
              // @ts-ignore - Old schema uses 'taxRate' instead of 'taxDetails'
              onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="0"
              max="100"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-medium text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax Amount:</span>
                <span className="font-medium text-gray-900 dark:text-white">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-primary-600 dark:text-primary-400">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}