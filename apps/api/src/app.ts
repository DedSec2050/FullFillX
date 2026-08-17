import Fastify from "fastify";
import swaggerPlugin from "./plugins/swagger.js";
import { productRoutes } from "../../../services/products/presentation/product.routes.js";
import { skuRoutes } from "../../../services/products/presentation/sku.routes.js";
import { warehouseRoutes } from "../../../services/warehouse/presentation/warehouse.routes.js";
import { inventoryRoutes } from "../../../services/inventory/presentation/inventory.routes.js";
import { orderRoutes } from "../../../services/order/presentation/order.routes.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(swaggerPlugin);

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "fulfillx-api",
    };
  });

  app.register(productRoutes);
  app.register(skuRoutes);
  app.register(warehouseRoutes);
  app.register(inventoryRoutes);
  app.register(orderRoutes);

  return app;
}
