import Fastify from "fastify";

import { productRoutes } from "../../../services/products/presentation/product.routes.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "fulfillx-api",
    };
  });

  app.register(productRoutes);

  return app;
}
