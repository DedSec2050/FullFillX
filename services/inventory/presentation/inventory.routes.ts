import type { FastifyInstance } from "fastify";

import { prisma } from "../../../apps/api/src/plugins/prisma.js";

import { CreateInventory } from "../application/create-inventory.js";
import { GetInventory } from "../application/get-inventory.js";
import { ListInventory } from "../application/list-inventory.js";

import { PrismaInventoryRepository } from "../infrastructure/prisma-inventory-repository.js";

import {
  createInventorySchema,
  warehouseIdParamsSchema,
  inventoryIdParamsSchema,
} from "./inventory.schemas.js";

export async function inventoryRoutes(app: FastifyInstance) {
  const repository = new PrismaInventoryRepository(prisma);

  const createInventoryUseCase = new CreateInventory(repository);

  const getInventoryUseCase = new GetInventory(repository);

  const listInventoryUseCase = new ListInventory(repository);

  /*
   * CREATE INVENTORY
   */

  app.post(
    "/api/v1/warehouses/:warehouseId/inventory",
    {
      schema: {
        tags: ["Inventory"],
        summary: "Create inventory",
        description: "Creates an inventory record for a SKU in a warehouse.",

        params: {
          type: "object",
          required: ["warehouseId"],
          properties: {
            warehouseId: {
              type: "string",
              format: "uuid",
              description: "Warehouse UUID",
            },
          },
        },

        body: {
          type: "object",
          required: ["skuId", "available"],
          properties: {
            skuId: {
              type: "string",
              format: "uuid",
              description: "SKU UUID",
            },

            available: {
              type: "integer",
              minimum: 0,
              description: "Initial available stock quantity",
            },
          },
        },

        response: {
          201: {
            description: "Inventory created successfully",
            type: "object",
            properties: {
              id: {
                type: "string",
                format: "uuid",
              },

              warehouseId: {
                type: "string",
                format: "uuid",
              },

              skuId: {
                type: "string",
                format: "uuid",
              },

              available: {
                type: "integer",
              },

              reserved: {
                type: "integer",
              },

              status: {
                type: "string",
                enum: ["ACTIVE", "INACTIVE"],
              },

              createdAt: {
                type: "string",
                format: "date-time",
              },

              updatedAt: {
                type: "string",
                format: "date-time",
              },
            },
          },

          400: {
            description: "Invalid inventory request",
            type: "object",
            properties: {
              error: {
                type: "string",
              },
            },
          },
        },
      },
    },

    async (request, reply) => {
      const params = warehouseIdParamsSchema.parse(request.params);

      const body = createInventorySchema.parse(request.body);

      const inventory = await createInventoryUseCase.execute({
        warehouseId: params.warehouseId,
        skuId: body.skuId,
        available: body.available,
      });

      return reply.status(201).send(inventory);
    },
  );

  /*
   * LIST INVENTORY
   */

  app.get(
    "/api/v1/warehouses/:warehouseId/inventory",
    {
      schema: {
        tags: ["Inventory"],
        summary: "List warehouse inventory",
        description: "Lists all inventory records for a warehouse.",

        params: {
          type: "object",
          required: ["warehouseId"],
          properties: {
            warehouseId: {
              type: "string",
              format: "uuid",
            },
          },
        },

        response: {
          200: {
            description: "Inventory retrieved successfully",
            type: "array",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                },

                warehouseId: {
                  type: "string",
                  format: "uuid",
                },

                skuId: {
                  type: "string",
                  format: "uuid",
                },

                available: {
                  type: "integer",
                },

                reserved: {
                  type: "integer",
                },

                status: {
                  type: "string",
                  enum: ["ACTIVE", "INACTIVE"],
                },

                createdAt: {
                  type: "string",
                  format: "date-time",
                },

                updatedAt: {
                  type: "string",
                  format: "date-time",
                },
              },
            },
          },
        },
      },
    },

    async (request, reply) => {
      const params = warehouseIdParamsSchema.parse(request.params);

      const inventory = await listInventoryUseCase.execute(params.warehouseId);

      return reply.status(200).send(inventory);
    },
  );

  /*
   * GET INVENTORY
   */

  app.get(
    "/api/v1/warehouses/:warehouseId/inventory/:inventoryId",
    {
      schema: {
        tags: ["Inventory"],
        summary: "Get inventory by ID",
        description: "Retrieves an inventory record from a warehouse.",

        params: {
          type: "object",
          required: ["warehouseId", "inventoryId"],
          properties: {
            warehouseId: {
              type: "string",
              format: "uuid",
            },

            inventoryId: {
              type: "string",
              format: "uuid",
            },
          },
        },

        response: {
          200: {
            description: "Inventory retrieved successfully",
            type: "object",
            properties: {
              id: {
                type: "string",
                format: "uuid",
              },

              warehouseId: {
                type: "string",
                format: "uuid",
              },

              skuId: {
                type: "string",
                format: "uuid",
              },

              available: {
                type: "integer",
              },

              reserved: {
                type: "integer",
              },

              status: {
                type: "string",
                enum: ["ACTIVE", "INACTIVE"],
              },

              createdAt: {
                type: "string",
                format: "date-time",
              },

              updatedAt: {
                type: "string",
                format: "date-time",
              },
            },
          },

          404: {
            description: "Inventory not found",
            type: "object",
            properties: {
              error: {
                type: "string",
              },
            },
          },
        },
      },
    },

    async (request, reply) => {
      const params = inventoryIdParamsSchema.parse(request.params);

      const inventory = await getInventoryUseCase.execute(
        params.warehouseId,
        params.inventoryId,
      );

      if (!inventory) {
        return reply.status(404).send({
          error: "Inventory not found",
        });
      }

      return reply.status(200).send(inventory);
    },
  );
}
