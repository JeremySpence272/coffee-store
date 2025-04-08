# Coffee Store Application

A modern e-commerce application for a coffee store with product management, Stripe payment integration, and order history tracking.

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Python 3.9+
- Stripe account with API keys

### Frontend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/JeremySpence272/coffee-store.git
   cd coffee-store
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend Configuration

1. Create a `.env` file in the project root with your Stripe secret key:

   ```
   STRIPE_SECRET_KEY=sk_test_your_stripe_test_key_here
   ```

2. Install Python dependencies:

   ```bash
   pip install flask stripe flask-cors python-dotenv
   ```

3. Start the Flask server:

   ```bash
   python server.py
   ```

## Testing Payments

Use Stripe's test cards for payment testing:

- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
