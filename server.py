########################################################
###################### ROUTES ##########################
########################################################
# http://localhost:8000/products
# - GET: get all products
# - POST: create a new product
# http://localhost:8000/products/{product_id}
# - PUT: update a product by id
# - DELETE: delete a product by id
# http://localhost:8000/orders
# - GET: get all orders
# http://localhost:8000/checkout
# - POST: create a new checkout session

import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request  
from flask_cors import CORS
import stripe

# Load environment variables from .env file - make sure to load before using any env vars
load_dotenv()

app = Flask(__name__)
# Allow requests from both localhost:3000 and 127.0.0.1:3000
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

# setup stripe SDK will automatically pass API key in headers
stripe_api_key = os.getenv("STRIPE_SECRET_KEY")
stripe.api_key = stripe_api_key

# mock products for stripe errors
MOCK_PRODUCTS = [
    {"id": "1", "name": "Small Coffee", "price": 3, "price_id": "price_small"},
    {"id": "2", "name": "Medium Coffee", "price": 5, "price_id": "price_medium"},
    {"id": "3", "name": "Large Coffee", "price": 7, "price_id": "price_large"},
    {"id": "4", "name": "Coffee Bundle", "price": 20, "price_id": "price_bundle"}
]

@app.route("/products", methods=["GET"])
def get_products():
    try:
        # fetch products from stripe (this is technically a third-party API get request)
        stripe_products = stripe.Product.list(active=True, limit=100)
        print(f"Found {len(stripe_products.data)} products in Stripe")
        formatted_products = []
        # Fetch prices for each product

        # expected product response
        # {
        #   id: string,
        #   name: string,
        #   price: number,
        #   price_id: string,
        # }
        for product in stripe_products.data:
            print(f"Fetching prices for product: {product.id} - {product.name}")
            # required for stripe since you can set multiple prices for each product
            prices = stripe.Price.list(product=product.id, active=True, limit=1) 
            if prices.data:
                price = prices.data[0]
                formatted_product = {
                    "id": product.id,
                    "name": product.name,
                    "price": price.unit_amount / 100,
                    "price_id": price.id
                }
                formatted_products.append(formatted_product)
            else:
                print(f"No prices found for product: {product.id} - {product.name}")
        
        # no products found - return mock products
        if not formatted_products:
            print("No products found in Stripe, returning mock products")
            return jsonify(MOCK_PRODUCTS)
        
        response = jsonify(formatted_products)
        return response
    
    # stripe error - return mock products
    except stripe.error.StripeError as e:
        print(f"Stripe error fetching products: {e.user_message}")
        return jsonify(MOCK_PRODUCTS)
    # unexpected error - return mock products
    except Exception as e:
        print(f"Unexpected error fetching products: {e}")
        return jsonify(MOCK_PRODUCTS)


class InvalidProductDataException(Exception):
    pass

@app.route("/products", methods=["POST"])
def create_product():
    try:
        data = request.json
        product_name = data.get("name")
        product_price = data.get("price")

        if not product_name:
            raise InvalidProductDataException("Name is required")
        
        if not product_price:
            raise InvalidProductDataException("Price is required")
        
        # make post request to stripe to initialize price
        new_product = stripe.Price.create(
            currency="usd",
            unit_amount=int(product_price * 100),  # Convert to cents and ensure it's an integer
            product_data={"name": product_name},
        )

        if not new_product:
            raise InvalidProductDataException("Failed to create product: Invalid product data")

        # If product creation is successful, return the new product details
        return jsonify({
            "id": new_product.product,
            "name": product_name,
            "price_id": new_product.id,
            "price": product_price
        }), 201

    except InvalidProductDataException as e:
        print(f"Invalid product data: {e}")
        return jsonify({"error": f"Invalid data: {e}"}), 400
    except stripe.error.StripeError as e:
        print(f"Stripe error creating product: {e.user_message}")
        return jsonify({"error": f"Stripe error: {e.user_message}"}), 500
    except Exception as e:
        print(f"Unexpected error creating product: {e}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


    
        
@app.route("/products/<product_id>", methods=["PUT"])
def update_product(product_id):
    
    try:
        # can update name or price
        data = request.json
        print(data)
        product_name = data.get("name")
        product_price = data.get("price")
        product_id = data.get("id")
        price_id = data.get("price_id")

        if not product_name or not product_price:
            raise InvalidProductDataException("Name and price are required")
    
        stripe_product = stripe.Product.retrieve(product_id)
        stripe_price = stripe.Price.retrieve(price_id)
        
        if not stripe_product or not stripe_price:
            raise InvalidProductDataException("Product or price not found")
        
        # if name is changed, update product name
        if product_name != stripe_product.name:
           stripe.Product.modify(
                product_id,
                name=product_name,
            )

        # if price is changed, update price
        if product_price != stripe_price.unit_amount / 100:
            # Create a new price
            new_price = stripe.Price.create(
                product=product_id,
                unit_amount=int(product_price * 100),  # Convert to cents and ensure it's an integer
                currency="usd",
            )
            
            # Set the new price as the default price for the product
            stripe.Product.modify(
                product_id,
                default_price=new_price.id,
            )

            stripe.Price.modify(
                price_id,
                active=False,
            )
            
            # Use the new price ID
            price_id = new_price.id

        return jsonify({
            "id": product_id,
            "name": product_name,
            "price_id": price_id,
            "price": product_price
        }), 200
    
    except InvalidProductDataException as e:
        return jsonify({"error": f"Invalid data: {e}"}), 400
    except stripe.error.StripeError as e:
        print(f"Stripe error updating product: {e.user_message}")
        return jsonify({"error": f"Stripe error: {e.user_message}"}), 500
    except Exception as e:
        print(f"Unexpected error updating product: {e}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500
    
    

@app.route("/products/<product_id>", methods=["DELETE"])
def delete_product(product_id):
    try:
        # can't delete product with prices attached, so we'll just archive it
        stripe.Product.modify(
            product_id,
            active=False
        )
        return jsonify({"success": True, "message": "Product deleted successfully"}), 200
    except stripe.error.StripeError as e:
        print(f"Stripe error deleting product: {e.user_message}")
        return jsonify({"error": f"Stripe error: {e.user_message}"}), 500
    except Exception as e:
        print(f"Unexpected error deleting product: {e}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@app.route("/orders", methods=["GET"])
def get_orders():
    try:
        # get all orders from stripe
        sessions = stripe.checkout.Session.list(
            limit=10, 
            status='complete'
        )

        # format we need
        # {
        # id: "1",
        # product_name: "Small Coffee",
        # amount: 3,
        # timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        # customer_email: "john@example.com",
        # }

        formatted_orders = []
        for session in sessions.data:
            # get line items for each session (will only be one line item per session for our purposes)
            line_items = stripe.checkout.Session.list_line_items(session.id)
            order = {
                "id": session.id,
                "product_name": line_items.data[0].description,
                "amount": session.amount_total / 100,
                "timestamp": session.created,
                "customer_email": session.customer_details.email
            }
            formatted_orders.append(order)
        print(formatted_orders)
        return jsonify(formatted_orders)
        
    except stripe.error.StripeError as e:
        print(f"Stripe error getting orders: {e.user_message}")
        return jsonify({"error": f"Stripe error: {e.user_message}"}), 500
    except Exception as e:
        print(f"Unexpected error getting orders: {e}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@app.route("/checkout", methods=["POST"])
def create_checkout_session():
    try:
        data = request.json
        price_id = data.get("price_id")
        
        if not price_id:
            raise InvalidProductDataException("Price ID is required")
            
        # Create a Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                },
            ],
            mode="payment",
            success_url="http://localhost:3000/success",
            cancel_url="http://localhost:3000/cancel",
        )
        
        # return the checkout URL to the frontend to handle payment
        return jsonify({"url": checkout_session.url})
    except InvalidProductDataException as e:
        print(f"Invalid data: {e}")
        return jsonify({"error": f"Invalid data: {e}"}), 400
    except stripe.error.StripeError as e:
        print(f"Stripe error creating checkout session: {e.user_message}")
        return jsonify({"error": f"Stripe error: {e.user_message}"}), 500
    except Exception as e:
        print(f"Unexpected error creating checkout session: {e}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)