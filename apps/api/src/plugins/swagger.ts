import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import type { FastifyPluginAsync } from "fastify";

const swaggerPlugin: FastifyPluginAsync = async (app) => {
  await app.register(swagger, {
    openapi: {
      openapi: "3.0.3",

      info: {
        title: "FulfillX API",
        description: "Fulfillment and inventory management API",
        version: "1.0.0",
      },

      servers: [
        {
          url: "http://localhost:3000",
          description: "Local development",
        },
      ],

      tags: [
        {
          name: "Products",
          description: "Product management",
        },
        {
          name: "SKUs",
          description: "SKU management",
        },
        {
          name: "Warehouses",
          description: "Warehouse management",
        },
        {
          name: "Inventory",
          description: "Inventory management",
        },
        {
          name: "Orders",
          description: "Order management",
        },
      ],
    },
  });

  await app.register(swaggerUI, {
    routePrefix: "/docs",

    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },

    staticCSP: true,
  });
};

export default fp(swaggerPlugin, {
  name: "swagger",
});
