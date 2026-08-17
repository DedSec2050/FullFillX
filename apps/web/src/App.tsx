import { useMemo, useState } from "react";
import "./App.css";

type ApiResult = {
  status: number;
  ok: boolean;
  body: unknown;
};

type InventoryOp = "add-stock" | "reserve" | "release" | "fulfill";
type View = "home" | "catalog" | "inventory" | "orders";

function generateUuid(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof (crypto as any).randomUUID === "function"
  ) {
    return (crypto as any).randomUUID();
  }

  // Fallback v4 UUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function UuidInputRow({
  id,
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`row ${className ?? ""}`}>
      <label htmlFor={id}>{label}</label>
      <div className="input-with-icon">
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="icon-btn"
          title="Generate UUID"
          onClick={() => onChange(generateUuid())}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M20 8v6a2 2 0 0 1-2 2h-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 16V10a2 2 0 0 1 2-2h6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 7l-3 3 3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17 17l3-3-3-3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

async function callApi(
  method: string,
  path: string,
  payload?: unknown,
  tenantId?: string,
): Promise<ApiResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (tenantId) {
    headers["x-tenant-id"] = tenantId;
  }

  const response = await fetch(path, {
    method,
    headers,
    body: payload ? JSON.stringify(payload) : undefined,
  });

  const text = await response.text();
  let body: unknown;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text || null;
  }

  return {
    status: response.status,
    ok: response.ok,
    body,
  };
}

function App() {
  const [view, setView] = useState<View>("home");
  const [tenantId, setTenantId] = useState(
    "550e8400-e29b-41d4-a716-446655440000",
  );

  const [productName, setProductName] = useState("iPhone 15");
  const [productId, setProductId] = useState("");

  const [skuProductId, setSkuProductId] = useState("");
  const [skuCode, setSkuCode] = useState("IPHONE15-BLK-128");
  const [skuName, setSkuName] = useState("iPhone 15 Black 128GB");

  const [warehouseName, setWarehouseName] = useState("Central Hub");
  const [warehouseCity, setWarehouseCity] = useState("Chicago");
  const [warehouseCountry, setWarehouseCountry] = useState("USA");
  const [warehouseId, setWarehouseId] = useState("");

  const [inventoryWarehouseId, setInventoryWarehouseId] = useState("");
  const [inventoryId, setInventoryId] = useState("");
  const [inventorySkuId, setInventorySkuId] = useState("");
  const [inventoryQty, setInventoryQty] = useState(10);
  const [inventoryOp, setInventoryOp] = useState<InventoryOp>("add-stock");

  const [orderId, setOrderId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [externalId, setExternalId] = useState("ORD-1001");
  const [orderSkuId, setOrderSkuId] = useState("");
  const [orderQty, setOrderQty] = useState(1);
  const [orderUnitPrice, setOrderUnitPrice] = useState(129.99);

  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(
    "Welcome. Start from Home to check connection.",
  );

  const stepItems = useMemo(() => {
    return [
      "Create a product in Catalog.",
      "Add a SKU variant to that product.",
      "Create a warehouse in Inventory.",
      "Create an inventory record for warehouse + SKU.",
      "Run stock actions: reserve, release, fulfill.",
      "Create an order and move it through lifecycle actions.",
    ];
  }, []);

  function syncIds(method: string, path: string, body: unknown): string | null {
    const obj = asRecord(body);
    if (!obj) {
      return null;
    }

    const id = asString(obj.id);

    if (method === "POST" && path === "/api/v1/products" && id) {
      setProductId(id);
      setSkuProductId(id);
      return "Product created. Product ID moved to SKU form.";
    }

    if (
      method === "POST" &&
      /^\/api\/v1\/products\/[^/]+\/skus$/.test(path) &&
      id
    ) {
      setInventorySkuId(id);
      setOrderSkuId(id);
      return "SKU created. SKU ID moved to inventory and order forms.";
    }

    if (method === "POST" && path === "/api/v1/warehouses" && id) {
      setWarehouseId(id);
      setInventoryWarehouseId(id);
      return "Warehouse created. Warehouse ID moved to inventory form.";
    }

    if (
      method === "POST" &&
      /^\/api\/v1\/warehouses\/[^/]+\/inventory$/.test(path) &&
      id
    ) {
      setInventoryId(id);
      return "Inventory created. Inventory ID moved to stock actions.";
    }

    if (method === "POST" && path === "/api/v1/orders" && id) {
      setOrderId(id);
      return "Order created. Order ID moved to lifecycle actions.";
    }

    return null;
  }

  async function run(
    method: string,
    path: string,
    payload?: unknown,
    passTenant = true,
  ) {
    setLoading(true);
    try {
      const response = await callApi(
        method,
        path,
        payload,
        passTenant ? tenantId : undefined,
      );
      setResult(response);

      const syncNote = syncIds(method, path, response.body);
      if (syncNote) {
        setNote(syncNote);
      } else if (!response.ok) {
        setNote("Request returned an error. Check the response panel below.");
      } else {
        setNote("Done. You can continue to the next step.");
      }
    } catch (error) {
      setResult({
        status: 0,
        ok: false,
        body: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
      setNote("Network error. Ensure API and web servers are running.");
    } finally {
      setLoading(false);
    }
  }

  async function checkServerHealth() {
    setLoading(true);
    try {
      const response = await callApi("GET", "/health");
      setResult(response);

      const body = asRecord(response.body);
      const service = asString(body?.service);
      const status = asString(body?.status);

      if (response.ok && service === "fulfillx-api" && status === "ok") {
        setNote("Connected to Fastify health endpoint: /health");
      } else {
        setNote(
          "Health endpoint responded, but payload did not match expected values.",
        );
      }
    } catch (error) {
      setResult({
        status: 0,
        ok: false,
        body: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
      setNote(
        "Could not reach /health. Ensure API server is running on port 3000.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <header className="hero">
        <p className="badge">FulfillX App</p>
        <h1>Simple workflow for catalog, stock, and orders</h1>
        <p>
          Navigate by section and complete tasks in a natural order. The app
          carries IDs across forms to reduce repetitive input.
        </p>
      </header>

      <nav className="tabs" aria-label="Main sections">
        <button
          className={view === "home" ? "active" : ""}
          onClick={() => setView("home")}
        >
          Home
        </button>
        <button
          className={view === "catalog" ? "active" : ""}
          onClick={() => setView("catalog")}
        >
          Catalog
        </button>
        <button
          className={view === "inventory" ? "active" : ""}
          onClick={() => setView("inventory")}
        >
          Inventory
        </button>
        <button
          className={view === "orders" ? "active" : ""}
          onClick={() => setView("orders")}
        >
          Orders
        </button>
      </nav>

      <section className="card">
        <h2>Workspace</h2>
        <UuidInputRow
          id="tenantId"
          label="Tenant ID"
          value={tenantId}
          onChange={setTenantId}
          placeholder="Tenant UUID"
        />
        <p className="helper">{note}</p>
      </section>

      {view === "home" && (
        <section className="grid single">
          <article className="card">
            <h2>Getting started</h2>
            <ul className="steps">
              {stepItems.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
            <div className="actions">
              <button onClick={checkServerHealth}>Check server health</button>
              <button onClick={() => setView("catalog")}>
                Start with catalog
              </button>
            </div>
          </article>
        </section>
      )}

      {view === "catalog" && (
        <section className="grid">
          <article className="card">
            <h2>Products</h2>
            <p className="helper">Create and browse products.</p>
            <div className="row">
              <label htmlFor="productName">Product name</label>
              <input
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            <UuidInputRow
              id="productId"
              label="Product ID"
              value={productId}
              onChange={setProductId}
              placeholder="Product UUID"
            />
            <div className="actions">
              <button
                onClick={() =>
                  run("POST", "/api/v1/products", { name: productName })
                }
              >
                Create product
              </button>
              <button onClick={() => run("GET", "/api/v1/products")}>
                View products
              </button>
              <button
                onClick={() => run("GET", `/api/v1/products/${productId}`)}
              >
                Open product
              </button>
            </div>
          </article>

          <article className="card">
            <h2>SKUs</h2>
            <p className="helper">Add and list product variants.</p>
            <UuidInputRow
              id="skuProductId"
              label="Product ID"
              value={skuProductId}
              onChange={setSkuProductId}
              placeholder="Product UUID"
            />
            <div className="row">
              <label htmlFor="skuCode">SKU code</label>
              <input
                id="skuCode"
                value={skuCode}
                onChange={(e) => setSkuCode(e.target.value)}
              />
            </div>
            <div className="row">
              <label htmlFor="skuName">SKU name</label>
              <input
                id="skuName"
                value={skuName}
                onChange={(e) => setSkuName(e.target.value)}
              />
            </div>
            <div className="actions">
              <button
                onClick={() =>
                  run("POST", `/api/v1/products/${skuProductId}/skus`, {
                    sku: skuCode,
                    name: skuName,
                  })
                }
              >
                Create SKU
              </button>
              <button
                onClick={() =>
                  run("GET", `/api/v1/products/${skuProductId}/skus`)
                }
              >
                View SKUs
              </button>
              <button onClick={() => setView("inventory")}>
                Next: inventory
              </button>
            </div>
          </article>
        </section>
      )}

      {view === "inventory" && (
        <section className="grid">
          <article className="card">
            <h2>Warehouses</h2>
            <p className="helper">Create and browse storage locations.</p>
            <div className="row">
              <label htmlFor="warehouseName">Warehouse name</label>
              <input
                id="warehouseName"
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
              />
            </div>
            <div className="row">
              <label htmlFor="warehouseCity">City</label>
              <input
                id="warehouseCity"
                value={warehouseCity}
                onChange={(e) => setWarehouseCity(e.target.value)}
              />
            </div>
            <div className="row">
              <label htmlFor="warehouseCountry">Country</label>
              <input
                id="warehouseCountry"
                value={warehouseCountry}
                onChange={(e) => setWarehouseCountry(e.target.value)}
              />
            </div>
            <UuidInputRow
              id="warehouseId"
              label="Warehouse ID"
              value={warehouseId}
              onChange={setWarehouseId}
              placeholder="Warehouse UUID"
            />
            <div className="actions">
              <button
                onClick={() =>
                  run("POST", "/api/v1/warehouses", {
                    name: warehouseName,
                    city: warehouseCity,
                    country: warehouseCountry,
                  })
                }
              >
                Create warehouse
              </button>
              <button onClick={() => run("GET", "/api/v1/warehouses")}>
                View warehouses
              </button>
              <button
                onClick={() => run("GET", `/api/v1/warehouses/${warehouseId}`)}
              >
                Open warehouse
              </button>
            </div>
          </article>

          <article className="card">
            <h2>Stock</h2>
            <p className="helper">Create inventory and run stock actions.</p>
            <UuidInputRow
              id="inventoryWarehouseId"
              label="Warehouse ID"
              value={inventoryWarehouseId}
              onChange={setInventoryWarehouseId}
              placeholder="Warehouse UUID"
            />
            <UuidInputRow
              id="inventoryId"
              label="Inventory ID"
              value={inventoryId}
              onChange={setInventoryId}
              placeholder="Inventory UUID"
            />
            <UuidInputRow
              id="inventorySkuId"
              label="SKU ID"
              value={inventorySkuId}
              onChange={setInventorySkuId}
              placeholder="SKU UUID"
            />
            <div className="row">
              <label htmlFor="inventoryQty">Quantity</label>
              <input
                id="inventoryQty"
                type="number"
                min={1}
                value={inventoryQty}
                onChange={(e) => setInventoryQty(Number(e.target.value))}
              />
            </div>
            <div className="row">
              <label htmlFor="inventoryOp">Stock action</label>
              <select
                id="inventoryOp"
                value={inventoryOp}
                onChange={(e) => setInventoryOp(e.target.value as InventoryOp)}
              >
                <option value="add-stock">Add stock</option>
                <option value="reserve">Reserve stock</option>
                <option value="release">Release reservation</option>
                <option value="fulfill">Fulfill reservation</option>
              </select>
            </div>
            <div className="actions">
              <button
                onClick={() =>
                  run(
                    "POST",
                    `/api/v1/warehouses/${inventoryWarehouseId}/inventory`,
                    {
                      skuId: inventorySkuId,
                      available: inventoryQty,
                    },
                  )
                }
              >
                Create inventory record
              </button>
              <button
                onClick={() =>
                  run(
                    "GET",
                    `/api/v1/warehouses/${inventoryWarehouseId}/inventory`,
                  )
                }
              >
                View inventory
              </button>
              <button
                onClick={() =>
                  run(
                    "POST",
                    `/api/v1/warehouses/${inventoryWarehouseId}/inventory/${inventoryId}/${inventoryOp}`,
                    {
                      quantity: inventoryQty,
                    },
                    false,
                  )
                }
              >
                Run stock action
              </button>
              <button onClick={() => setView("orders")}>Next: orders</button>
            </div>
          </article>
        </section>
      )}

      {view === "orders" && (
        <section className="grid single">
          <article className="card">
            <h2>Orders</h2>
            <p className="helper">
              Create orders and complete lifecycle actions.
            </p>
            <UuidInputRow
              id="storeId"
              label="Store ID"
              value={storeId}
              onChange={setStoreId}
              placeholder="Store UUID"
            />
            <div className="row">
              <label htmlFor="externalId">External reference</label>
              <input
                id="externalId"
                value={externalId}
                onChange={(e) => setExternalId(e.target.value)}
              />
            </div>
            <div className="row split">
              <div>
                <label htmlFor="orderSkuId">SKU ID</label>
                <div className="input-with-icon">
                  <input
                    id="orderSkuId"
                    value={orderSkuId}
                    onChange={(e) => setOrderSkuId(e.target.value)}
                    placeholder="SKU UUID"
                  />
                  <button
                    type="button"
                    className="icon-btn"
                    title="Generate UUID"
                    onClick={() => setOrderSkuId(generateUuid())}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        d="M20 8v6a2 2 0 0 1-2 2h-6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 16V10a2 2 0 0 1 2-2h6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7 7l-3 3 3 3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17 17l3-3-3-3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="orderQty">Quantity</label>
                <input
                  id="orderQty"
                  type="number"
                  min={1}
                  value={orderQty}
                  onChange={(e) => setOrderQty(Number(e.target.value))}
                />
              </div>
              <div>
                <label htmlFor="orderUnitPrice">Unit price</label>
                <input
                  id="orderUnitPrice"
                  type="number"
                  min={0}
                  step="0.01"
                  value={orderUnitPrice}
                  onChange={(e) => setOrderUnitPrice(Number(e.target.value))}
                />
              </div>
            </div>
            <UuidInputRow
              id="orderId"
              label="Order ID"
              value={orderId}
              onChange={setOrderId}
              placeholder="Order UUID"
            />
            <div className="actions">
              <button
                onClick={() =>
                  run("POST", "/api/v1/orders", {
                    storeId,
                    externalId,
                    items: [
                      {
                        skuId: orderSkuId,
                        quantity: orderQty,
                        unitPrice: orderUnitPrice,
                      },
                    ],
                  })
                }
              >
                Create order
              </button>
              <button onClick={() => run("GET", "/api/v1/orders")}>
                View orders
              </button>
              <button onClick={() => run("GET", `/api/v1/orders/${orderId}`)}>
                Open order
              </button>
              <button
                onClick={() => run("POST", `/api/v1/orders/${orderId}/confirm`)}
              >
                Confirm
              </button>
              <button
                onClick={() =>
                  run("POST", `/api/v1/orders/${orderId}/allocate`)
                }
              >
                Allocate
              </button>
              <button
                onClick={() => run("POST", `/api/v1/orders/${orderId}/fulfill`)}
              >
                Fulfill
              </button>
              <button
                onClick={() => run("POST", `/api/v1/orders/${orderId}/cancel`)}
              >
                Cancel
              </button>
            </div>
          </article>
        </section>
      )}

      <section className="card result">
        <h2>Latest response</h2>
        <p className="status">
          Status: <strong>{result?.status ?? "-"}</strong> •
          <strong>
            {result ? (result.ok ? " success" : " error") : " waiting"}
          </strong>
          {loading && " • loading..."}
        </p>
        <pre>
          {JSON.stringify(
            result?.body ?? { message: "No request yet." },
            null,
            2,
          )}
        </pre>
      </section>
    </main>
  );
}

export default App;
