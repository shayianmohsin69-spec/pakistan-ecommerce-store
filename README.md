# Pakistan E-commerce Store

I built this store demo to practise a shopping flow with PKR prices. Visitors can browse and search products, add items to a cart, and submit a demo order. The Express backend validates orders and saves them to a local JSON database. The admin area supports adding products and viewing orders.

## Requirements
- Node.js 18 or newer
- npm

## Run locally
```bash
npm install
npm start
```
Open http://localhost:3000.

## Admin access
The demo key defaults to `change-this-admin-key`. Set a private `ADMIN_KEY` environment variable before deployment. Enter the key in the Admin section to add products or view orders.

## Current limits
Checkout records an order but does not collect payment. Connect a payment provider in test mode before accepting real payments. The demo uses a local JSON file, so use persistent database storage and stronger admin authentication before production deployment.