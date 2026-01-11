import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import InvoiceForm from '../components/InvoiceForm';
import { invoiceAPI } from '../services/api';
import { InvoiceFormData } from '../types';

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    try {
      const invoice = await invoiceAPI.create(data);
      navigate(`/invoices/${invoice._id}`);
    } catch (error) {
      console.error('Failed to create invoice:', error);
      alert('Failed to create invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // @ts-expect-error - Layout component requires props, but this page is unused
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Invoice
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Fill in the project details to generate an invoice
          </p>
        </div>
        <InvoiceForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </motion.div>
    </Layout>
  );
}
