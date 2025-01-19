# PhonePe Integration Example

This repository provides a comprehensive example of integrating PhonePe payment gateway with merchant applications using NestJS (backend) and Next.js (frontend).

## Features

- Seamless payment initiation and processing
- Real-time payment status tracking
- Secure transaction handling
- Responsive payment form with validation
- Dark mode support
- Error handling and logging
- Type-safe implementation

## Tech Stack

- **Backend**: NestJS ( NodeJs / Express )
- **Frontend**: Next.js (React ) 
- **UI Components**: Shadcn UI
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PhonePe merchant account credentials

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Subham-Maity/phonepe-nestjs.git
```

2. Install dependencies:
```bash
# Backend
cd server
npm install

# Frontend
cd cliend
npm install
```

3. Configure environment variables:

Create `.env` files in both backend and frontend directories:

```env
# Backend .env
PHONEPE_MERCHANT_ID=your_merchant_id
PHONEPE_SALT_KEY=your_salt_key
PHONEPE_API_BASE_URL=https://api.phonepe.com/apis/hermes
REDIRECT_BASE_URL=http://localhost:3000
```

## Usage

### Backend Setup

The backend provides two main endpoints:

1. `POST /payment/order`: Creates a new payment order
2. `POST /payment/status`: Checks payment status

Start the backend server:
```bash
npm start:dev
```

### Frontend Setup

> Main file `client/app/page.tsx`

The frontend includes a user-friendly payment form with:

- Input validation
- Loading states
- Error handling
- Dark mode toggle

Start the frontend development server:
```bash
npm run dev
```

## API Documentation

### Create Payment

```typescript
POST /payment/order
Content-Type: application/json

{
  "transactionId": string,
  "name": string,
  "amount": number,
  "phone": string
}
```

### Check Payment Status

```ts
POST /payment/status?id={transactionId}
```

## Security Considerations

- All sensitive data is handled securely
- Server-side validation implemented
- Error logging for debugging
- Proper error handling on both frontend and backend

