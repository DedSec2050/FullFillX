# FulfillX Web (React)

This frontend is a backend-driven operations dashboard for the FulfillX API.

It is designed to match the current route structure in the backend and lets you run the full flow from product creation to order lifecycle transitions.

## Stack

- React 19
- TypeScript
- Vite

## Local setup

1. Start the API server on port `3000` from the project root.

```bash
pnpm dev
```

2. Start the web app in this directory.

```bash
pnpm dev
```

3. Open the Vite URL shown in terminal (typically `http://localhost:5173`).

The Vite config includes proxy rules for:

- `/api` -> `http://localhost:3000`
- `/health` -> `http://localhost:3000`

So frontend requests work without CORS setup during local development.

## Step-by-step usage flow

1. Set `x-tenant-id` in the Tenant Context card.
2. Create a product.
3. Create a SKU under that product.
4. Create a warehouse.
5. Create inventory for the warehouse + SKU.
6. Run inventory actions: `add-stock`, `reserve`, `release`, `fulfill`.
7. Create an order and then move it through `confirm`, `allocate`, `fulfill`, or `cancel`.

Every action writes the raw API response to the response panel for quick debugging.

## Supported backend routes

- Health: `GET /health`
- Products: create/list/get
- SKUs: create/list
- Warehouses: create/list/get
- Inventory: create/list/get/add-stock/reserve/release/fulfill
- Orders: create/list/get/confirm/allocate/fulfill/cancel

## Build check

```bash
pnpm build
```

This runs:

- `tsc -b`
- `vite build`
