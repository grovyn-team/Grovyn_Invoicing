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
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/invoice_generator
```

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

## 🚧 Future Enhancements (Architecture Ready)

- User authentication & RBAC
- Email integration
- Advanced reporting & analytics
- Client portal
- Payment gateway integration
- Automated reminders
- Recurring invoices automation
- Multi-company support

## 📄 License

ISC
