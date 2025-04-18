
### Frontend Expected Data Structures

#### 1. /products [GET]
- Request URI: /products
- Incoming Data: None
- Expected Output:
```json
[
    {
        "id": "prod_id",  // Unique product identifier
        "name": "name",  // Name of the product
        "price": "#.##",  // Price of the product in USD
        "price_id": "price_id"  // Unique identifier for the price associated with the product
    },
    ...
]
```

#### 2. /products [POST]
- Request URI: /products
- Incoming Data:
```json
{
    "name": "Product Name",  // Name of the product
    "price": "#.##"  // Price of the product in USD
}
```
- Expected Output:
```json
{
    "id": "prod_id",  // Unique product identifier
    "name": "Product Name",  // Name of the newly created product
    "price_id": "price_id",  // Unique identifier for the price of the newly created product
    "price": "#.##"  // Price of the product in USD
}
```

#### 3. /products/<product_id> [PUT]
- Request URI: /products/<product_id>
- Incoming Data:
```json
{
    "name": "Updated Product Name",  // Updated name of the product
    "price": "#.##",  // Updated price of the product in USD
    "price_id": "price_id"  // Price ID that is updated (can be left empty for new price creation)
}
```
- Expected Output:
```json
{
    "id": "prod_id",  // Unique identifier for the updated product
    "name": "Updated Product Name",  // Name of the product after update
    "price_id": "new_price_id",  // Unique identifier for the updated price
    "price": "#.##"  // Updated price in USD
}
```

#### 4. /products/<product_id> [DELETE]
- Request URI: /products/<product_id>
- Incoming Data: None
- Expected Output:
```json
{
    "success": true,  // Boolean indicating the success of the operation
    "message": "Product deleted successfully"  // Confirmation message
}
```

#### 5. /orders [GET]
- Request URI: /orders
- Incoming Data: None
- Expected Output:
```json
{
    "orders": [
        {
            "id": "order_id",  // Unique order identifier
            "product_name": "Product Name",  // Name of the product ordered
            "amount": "#.##",  // Total price of the order in USD
            "timestamp": 1616161616,  // Unix timestamp representing the order creation time
            "customer_email": "customer@example.com"  // Email address of the customer who placed the order
        },
        ...
    ]
}
```
