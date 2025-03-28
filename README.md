# Coffee Store Application

A full-stack e-commerce application for a coffee store with product management, Stripe payment integration, and order history.

## Features

- 🛒 Display coffee products with pricing
- 💳 Process payments through Stripe
- 👨‍💼 Admin panel for product management (add, edit, delete products)
- 📊 View order history
- 🌟 Responsive design

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components

### Backend

- Flask (Python)
- Stripe API for payment processing

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- Python 3.9+
- Stripe account with API keys

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd APIs/coffee-store
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your Stripe secret key:

   ```
   STRIPE_SECRET_KEY=sk_test_your_stripe_test_key_here
   ```

5. Start the Flask server:
   ```bash
   python server.py
   ```

### Frontend Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Using the Application

### Customer View

- Browse coffee products on the home page
- Click "Buy Coffee" to purchase a product
- Complete payment through Stripe checkout
- See success/cancel pages after payment

### Admin View

- Access the admin panel at `/admin`
- Add new products
- Edit existing products (name, price)
- Delete products

## Testing Payments

Use Stripe's test cards for payment testing:

- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002

## License

MIT
