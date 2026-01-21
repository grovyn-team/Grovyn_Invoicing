# Invoice Management System - Grovyn

A comprehensive, production-ready invoice management system for Grovyn Engineering & Development Systems, built with React, TypeScript, Express.js, and MongoDB.

## 🎯 Features Implemented

### Core Features
- ✅ Dashboard with financial overview and metrics
- ✅ Invoice creation with project details
- ✅ Multiple invoice types (Standard, Proforma, Tax Invoice, Credit Note, Debit Note, Recurring, Advance, Final Settlement)
- ✅ Multi-currency support (INR, USD, EUR, GBP, AED) with dropdown
- ✅ Client management system
- ✅ Company profile and settings
- ✅ Payment tracking with multiple payments per invoice
- ✅ Enhanced invoice numbering system
- ✅ GST tax system support (CGST, SGST, IGST)
- ✅ Invoice preview and PDF generation
- ✅ Print functionality
- ✅ Modern UI with Grovyn green branding
- ✅ Sidebar navigation
- ✅ Mobile responsive design
- ✅ Dashboard with revenue metrics
- ✅ **AI-Powered Invoice Generation** - Generate invoice drafts from natural language prompts using HuggingFace AI

### Backend Architecture
- ✅ RESTful API with Express.js
- ✅ MongoDB with Mongoose ODM
- ✅ TypeScript throughout
- ✅ Modular architecture (MVC pattern)
- ✅ Data models: User, Company, Client, Invoice, Payment, AuditLog
- ✅ Enhanced invoice numbering with configurable format
- ✅ GST calculation engine
- ✅ Amount in words conversion
- ✅ Payment status tracking

### Frontend Architecture
- ✅ React 18 with TypeScript
- ✅ Tailwind CSS for styling
- ✅ Framer Motion for animations
- ✅ React Router for navigation
- ✅ Responsive sidebar layout
- ✅ Dashboard with metrics cards
- ✅ Invoice list and management
- ✅ Modern, premium SaaS UI

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Install dependencies:**
```bash
npm run install:all
```

2. **Set up environment variables:**

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/invoice_generator
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:3000

# AI Configuration (Optional - for AI invoice generation)
HF_API_KEY=your-huggingface-api-key-here
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.2
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/invoice_generator
```

**AI Configuration (Optional):**
- Get your HuggingFace API key from https://huggingface.co/settings/tokens
- The AI feature will be disabled if `HF_API_KEY` is not set
- Default model: `mistralai/Mistral-7B-Instruct-v0.2` (can be changed to other models)

3. **Run the application:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
Invoice_Generator/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── invoiceController.ts
│   │   │   ├── clientController.ts
│   │   │   ├── companyController.ts
│   │   │   └── paymentController.ts
│   │   ├── models/
│   │   │   ├── Invoice.ts
│   │   │   ├── Client.ts
│   │   │   ├── Company.ts
│   │   │   ├── User.ts
│   │   │   ├── Payment.ts
│   │   │   └── AuditLog.ts
│   │   ├── routes/
│   │   │   ├── invoiceRoutes.ts
│   │   │   ├── clientRoutes.ts
│   │   │   ├── companyRoutes.ts
│   │   │   └── paymentRoutes.ts
│   │   ├── utils/
│   │   │   ├── database.ts
│   │   │   ├── invoiceNumber.ts
│   │   │   └── numberToWords.ts
│   │   └── index.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── InvoiceForm.tsx
│   │   │   └── InvoicePreview.tsx
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── CreateInvoicePage.tsx
│   │   │   └── InvoicePreviewPage.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       └── pdfGenerator.ts
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/dashboard/stats` - Get dashboard statistics
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `POST /api/invoices/:id/send` - Send invoice
- `POST /api/invoices/ai/generate` - Generate invoice draft using AI (requires `prompt` and `clientId` in body)

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Company
- `GET /api/company` - Get company settings
- `PUT /api/company` - Update company settings

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create payment
- `DELETE /api/payments/:id` - Delete payment

## 💡 Key Features Details

### Invoice Types
- Standard Invoice
- Proforma Invoice
- Tax Invoice
- Credit Note
- Debit Note
- Recurring Invoice
- Advance Invoice
- Final Settlement Invoice

### Currency Support
- INR (₹) - Indian Rupees
- USD ($) - US Dollars
- EUR (€) - Euros
- GBP (£) - British Pounds
- AED (د.إ) - UAE Dirhams

### Payment Status
- Draft
- Sent
- Partially Paid
- Paid
- Overdue
- Cancelled

### GST Support
- CGST (Central GST)
- SGST (State GST)
- IGST (Integrated GST)
- HSN/SAC codes
- Export of services support

## 🎨 Design System

- **Brand Color**: Grovyn Green (#22c55e)
- **Theme**: Light mode
- **Layout**: Sidebar navigation with header
- **Typography**: Clean, modern sans-serif
- **Responsive**: Mobile-first design

## 🔒 Security Features

- Input validation
- Type-safe API calls
- Secure data models
- Invoice locking after sent
- Audit logging support

## 📝 Notes

This is a production-ready system built for scale. The architecture supports:
- Multi-user access (RBAC ready)
- Audit trails
- Payment tracking
- Multi-currency transactions
- GST compliance for Indian clients
- International invoice support

## 🤖 AI-Powered Invoice Generation

The system includes an AI assistant that can generate invoice drafts from natural language prompts.

### Features
- **Natural Language Processing**: Describe your invoice in plain English
- **Context-Aware**: Uses client and company information for accurate generation
- **Smart Validation**: AI responses are validated against invoice schema
- **Confidence Scoring**: Shows confidence level for generated drafts
- **Auto-Fill**: Automatically fills invoice form with AI suggestions
- **Visual Indicators**: AI-filled fields are highlighted for easy review
- **Audit Logging**: All AI-generated drafts are logged for compliance

### Usage
1. Click "AI Generate" button when creating a new invoice
2. Enter a natural language prompt describing your invoice
3. Review the auto-filled form (AI-suggested fields are highlighted)
4. Adjust any fields as needed
5. Save the invoice

### Example Prompts
- "Create a tax invoice for website development services. Amount: ₹50,000. Service date: today. Use 18% GST."
- "Proforma invoice for consulting services. 3 items: Strategy (₹30k), Design (₹25k), Implementation (₹45k). Due in 30 days."
- "Tax invoice for export services. Zero-rated GST. Amount: ₹1,00,000."

### Technical Details
- **Model**: Mistral-7B-Instruct (configurable via `HF_MODEL`)
- **Provider**: HuggingFace Inference API
- **Validation**: Zod schema validation for type safety
- **Error Handling**: Graceful fallbacks and user-friendly error messages
- **Security**: API keys stored in environment variables, never exposed to frontend

## 🚧 Future Enhancements (Architecture Ready)

- User authentication & RBAC
- Email integration
- Advanced reporting & analytics
- Client portal
- Payment gateway integration
- Automated reminders
- Recurring invoices automation
- Multi-company support
- Enhanced AI features (HSN/SAC auto-suggestion, revenue anomaly detection, natural language analytics)

## 📄 License

ISC
