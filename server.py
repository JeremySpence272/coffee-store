from flask import Flask, jsonify, request
import stripe
import os
from flask_cors import CORS
import datetime

app = Flask(__name__)


# Load environment variables from .env file
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Allow requests from both localhost:3000 and 127.0.0.1:3000
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

@app.route("/products", methods=["GET"])    
def get_products():
    try:
        product_list = stripe.Product.list(active=True)
        print(f"Found {len(product_list.data)} products")
        print(product_list.data)

        """
        list of products:
            id: "prod_id",
            name: "name",
            price: "#.##",
            price_id: "price_id",
        """

        formatted_products = []

        for product in product_list:
            print(f"Fetching prices for prod {product.name}")
            prices = stripe.Price.list(product=product.id)
            if not prices.data:
                raise Exception(f"No price data for the product {product.name}")
            
            price = prices.data[0]
            formatted_prod = {
                "id": product.id,
                "name": product.name,
                "price": price.unit_amount / 100,
                "price_id": price.id,
            }

            formatted_products.append(formatted_prod)

        if not formatted_products:
            raise Exception("No Products Available")

        return jsonify(formatted_products)

    
    except stripe.error.StripeError as e:
        print(f"Stripe error occured: {e}")
        return jsonify({"error": f"Stripe error: {e.user_message}"}), 500
    except Exception as e:
        print(f"Other error occured: {e}")
        return jsonify({"error": str(e)}), 500
    

@app.route("/products", methods=["POST"])
def create_product():
    try:
        data = request.json
        prod_name = data.get("name")
        prod_price = data.get("price")
        
        if not prod_name or not prod_price:
            raise Exception("Not enough information")
        
        new_prod = stripe.Product.create(name=prod_name)
        print(new_prod)
        new_prod_id = new_prod.id

        new_price = stripe.Price.create(
            currency="usd",
            unit_amount=prod_price * 100,
            product=new_prod_id,
        )

        if not new_price:
            raise Exception("Something else went wrong with info coming in")
        
        return jsonify({
            "id": new_prod_id,
            "name": prod_name,
            "price_id": new_price.id,
            "price": prod_price
        }), 201
    
    except stripe.error.StripeError as e:
        print(f"Stripe error occured: {e.user_message}")
        return jsonify({"error": f"Stripe error: {e.user_message}"}), 500
    except Exception as e:
        print(f"Something went wrong: {e}")
        return jsonify({"error": f"Unknown error: {str(e)}"}), 500


@app.route("/products/<product_id>", methods=["PUT"])
def update_product(product_id):
    try:
        data = request.json
        price_id = data.get("price_id")
        name = data.get("name")
        price = data.get("price")
        # print("Price ID:", price_id)
        # print("Name:", name)
        # print("Price:", price)
        # print("Product ID:", product_id)

        if not name or not price:
            raise Exception("Invalid name or price")
        
        stripe_product = stripe.Product.retrieve(product_id)
        stripe_price = stripe.Price.retrieve(price_id)

        if not stripe_price or not stripe_product:
            raise Exception("Couldnt find the price or product from Stripe")

        #check if name is new
        if name != stripe_product.name:
            print("UPDATING NAME")
            stripe.Product.modify(
                product_id,
                name=name
            )

        #check if price is new
        if price != stripe_price.unit_amount // 100:
            print("UPDATING PRICE")
            ### Stripe doesn't allow you to update unit amount on a price object
            ### Must create new one and deactivate old one
            new_price = stripe.Price.create(
                currency="usd",
                unit_amount=int(price * 100),
                product=product_id,
            )

            stripe.Product.modify(
                product_id,
                default_price=new_price.id,
            )

            stripe.Price.modify(
                price_id,
                active=False,
            )

            price_id = new_price.id

        return jsonify({
            "id": product_id,
            "name": name,
            "price_id": price_id,
            "price": price
        }), 200

    except stripe.error.StripeError as e:
        print(f"Stripe error occured: {e.user_message}")
        return jsonify({"error": f"Stripe error: {e.user_message}"}), 500
    except Exception as e:
        print(f"Something went wrong: {e}")
        return jsonify({"error": f"Unknown error: {str(e)}"}), 500

@app.route("/products/<product_id>", methods=["DELETE"])
def delete_product(product_id):
    try:
        #Stripe doesnt allow deleting products
        stripe.Product.modify(
            product_id,
            active=False,
        )
        return jsonify({"success": True, "message": "Product deleted successfully"}), 200

    except stripe.error.StripeError as e:
        print(f"Stripe error occured: {e.user_message}")
        return jsonify({"error": f"Stripe error: {e.user_message}"}), 500
    except Exception as e:
        print(f"Something went wrong: {e}")
        return jsonify({"error": f"Unknown error: {str(e)}"}), 500


"""
If I have time I will implement following
/checkout <- post
/orders <- get
"""

@app.route("/checkout", methods=["POST"])
def create_checkout_session():
    try:
        data = request.json
        print(data)
        price_id = data.get("price_id")

        if not price_id:
            raise Exception("Something unexpected happened. Try again.")

        success_url="http://localhost:3000/success"
        cancel_url="http://localhost:3000/cancel"

        checkout_session = stripe.checkout.Session.create(
            line_items=[{
                "price": price_id,
                "quantity": 1,
            }],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
        )

        if not checkout_session:
            raise Exception("Something unexpected happened. Try again.")

        return jsonify({"url": checkout_session.url}), 200

    except stripe.error.StripeError as e:
        print(f"Stripe error occured: {e.user_message}")
        return jsonify({"error": f"Stripe error: {e.user_message}"}), 500
    except Exception as e:
        print(f"Something went wrong: {e}")
        return jsonify({"error": f"Unknown error: {str(e)}"}), 500

@app.route("/orders", methods=["GET"])   
def get_orders():
    try:
        all_checkout_sessions = stripe.checkout.Session.list(status="complete")
        """
        Format
        {
            id: order_id
            product: product name
            amount: unit amount
            timestamp: timestamp
            customer_email
        }
        
        """
        formatted_orders = []
        for session in all_checkout_sessions:
            line_items = stripe.checkout.Session.list_line_items(session.id)
            #we only have one line item per order
            line_item = line_items.data[0]
            # print(session)
            if not line_item:
                raise Exception("Couldn't find line item for order:", session.id)

            formatted_order = {
                "id": session.id,
                "product_name": line_item.description,
                "amount": line_item.price.unit_amount / 100,
                "timestamp": session.created,
                "customer_email": session.customer_details.email,
            }
            formatted_orders.append(formatted_order)
        
        print(formatted_orders)
        return jsonify({"orders": formatted_orders}), 200


    except stripe.error.StripeError as e:
        print(f"Stripe error occured: {e.user_message}")
        return jsonify({"error": f"Stripe error: {e.user_message}"}), 500
    except Exception as e:
        print(f"Something went wrong: {e}")
        return jsonify({"error": f"Unknown error: {str(e)}"}), 500


if __name__ == "__main__":
    # Start the Flask server
    app.run(debug=True, port=8000)