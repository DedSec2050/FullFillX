import type { FastifyInstance } from "fastify";

import { prisma } from "../../../apps/api/src/plugins/prisma.js";

import { CreateInventory } from "../application/create-inventory.js";
import { GetInventory } from "../application/get-inventory.js";
import { ListInventory } from "../application/list-inventory.js";
import { AddStock } from "../application/add-stock.js";
import { ReserveStock } from "../application/reserve-stock.js";
import { ReleaseReservation } from "../application/release-reservation.js";
import { FulfillReservation } from "../application/fulfill-reservation.js";

import { PrismaWarehouseLookupRepository } from "../infrastructure/prisma-warehouse-lookup-repository.js";
import { PrismaSKULookupRepository } from "../infrastructure/prisma-sku-lookup-repository.js";

import {
  InsufficientReservedStockError,
  InsufficientStockError,
  InventoryAlreadyExistsError,
  InventoryNotFoundError,
} from "../application/errors.js";
import { PrismaInventoryRepository } from "../infrastructure/prisma-inventory-repository.js";

import {
  createInventorySchema,
  warehouseIdParamsSchema,
  inventoryIdParamsSchema,
  stockOperationSchema,
} from "./inventory.schemas.js";

export async function inventoryRoutes(app: FastifyInstance) {
  const repository = new PrismaInventoryRepository(prisma);

  const warehouseRepository = new PrismaWarehouseLookupRepository(prisma);

  const skuRepository = new PrismaSKULookupRepository(prisma);

  const createInventoryUseCase = new CreateInventory(
    repository,
    warehouseRepository,
    skuRepository,
  );

  const getInventoryUseCase = new GetInventory(repository);

  const listInventoryUseCase = new ListInventory(repository);

  const addStockUseCase = new AddStock(repository);

  const reserveStockUseCase = new ReserveStock(repository);

  const releaseReservationUseCase = new ReleaseReservation(repository);

  const fulfillReservationUseCase = new FulfillReservation(repository);

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

          404: {
            description: "Warehouse or SKU not found",
            type: "object",
            properties: {
              error: {
                type: "string",
              },
            },
          },

          409: {
            description: "Inventory already exists for this warehouse and SKU",
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
      try {
        const params = warehouseIdParamsSchema.parse(request.params);

        const body = createInventorySchema.parse(request.body);

        const inventory = await createInventoryUseCase.execute({
          warehouseId: params.warehouseId,
          skuId: body.skuId,
          available: body.available,
        });

        return reply.status(201).send(inventory);
      } catch (error) {
        if (error instanceof InventoryAlreadyExistsError) {
          return reply.status(409).send({
            error: error.message,
          });
        }

        if (
          error instanceof Error &&
          (error.message === "Warehouse not found" ||
            error.message === "SKU not found")
        ) {
          return reply.status(404).send({
            error: error.message,
          });
        }

        if (error instanceof InventoryNotFoundError) {
          return reply.status(404).send({
            error: error.message,
          });
        }

        return reply.status(400).send({
          error: "Invalid inventory request",
        });
      }
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
  /*
   * ADD STOCK
   */

  app.post(
    "/api/v1/warehouses/:warehouseId/inventory/:inventoryId/add-stock",
    {
      schema: {
        tags: ["Inventory"],
        summary: "Add stock",
        description: "Adds stock to an existing inventory record.",

        params: {
          type: "object",
          required: ["warehouseId", "inventoryId"],
          properties: {
            warehouseId: {
              type: "string",
              format: "uuid",
              description: "Warehouse UUID",
            },

            inventoryId: {
              type: "string",
              format: "uuid",
              description: "Inventory UUID",
            },
          },
        },

        body: {
          type: "object",
          required: ["quantity"],
          properties: {
            quantity: {
              type: "integer",
              minimum: 1,
              description: "Quantity to add",
            },
          },
        },

        response: {
          200: {
            description: "Stock added successfully",
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

      const body = stockOperationSchema.parse(request.body);

      try {
        const inventory = await addStockUseCase.execute({
          warehouseId: params.warehouseId,

          inventoryId: params.inventoryId,

          quantity: body.quantity,
        });

        return reply.status(200).send(inventory);
      } catch (error) {
        if (error instanceof InventoryNotFoundError) {
          return reply.status(404).send({
            error: error.message,
          });
        }

        throw error;
      }
    },
  );

  /*
   * RESERVE STOCK
   */

  app.post(
    "/api/v1/warehouses/:warehouseId/inventory/:inventoryId/reserve",
    {
      schema: {
        tags: ["Inventory"],
        summary: "Reserve stock",
        description: "Reserves available stock from an inventory record.",

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

        body: {
          type: "object",
          required: ["quantity"],
          properties: {
            quantity: {
              type: "integer",
              minimum: 1,
              description: "Quantity of stock to reserve",
            },
          },
        },

        response: {
          200: {
            description: "Stock reserved successfully",
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

          409: {
            description: "Insufficient available stock",
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

      const body = stockOperationSchema.parse(request.body);

      try {
        const inventory = await reserveStockUseCase.execute({
          warehouseId: params.warehouseId,

          inventoryId: params.inventoryId,

          quantity: body.quantity,
        });

        return reply.status(200).send(inventory);
      } catch (error) {
        if (error instanceof InventoryNotFoundError) {
          return reply.status(404).send({
            error: error.message,
          });
        }

        if (error instanceof InsufficientStockError) {
          return reply.status(409).send({
            error: error.message,
          });
        }

        throw error;
      }
    },
  );

  /*
   * RELEASE RESERVATION
   */

  app.post(
    "/api/v1/warehouses/:warehouseId/inventory/:inventoryId/release",
    {
      schema: {
        tags: ["Inventory"],
        summary: "Release reservation",
        description:
          "Releases previously reserved inventory and returns it to available stock.",

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

        body: {
          type: "object",
          required: ["quantity"],
          properties: {
            quantity: {
              type: "integer",
              minimum: 1,
            },
          },
        },

        response: {
          200: {
            description: "Reservation released successfully",
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

          409: {
            description: "Insufficient reserved stock",
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

      const body = stockOperationSchema.parse(request.body);

      try {
        const inventory = await releaseReservationUseCase.execute({
          warehouseId: params.warehouseId,

          inventoryId: params.inventoryId,

          quantity: body.quantity,
        });

        return reply.status(200).send(inventory);
      } catch (error) {
        if (error instanceof InventoryNotFoundError) {
          return reply.status(404).send({
            error: error.message,
          });
        }

        if (error instanceof InsufficientReservedStockError) {
          return reply.status(409).send({
            error: error.message,
          });
        }

        throw error;
      }
    },
  );

  /*
   * FULFILL RESERVATION
   */

  app.post(
    "/api/v1/warehouses/:warehouseId/inventory/:inventoryId/fulfill",
    {
      schema: {
        tags: ["Inventory"],
        summary: "Fulfill reservation",
        description: "Fulfills previously reserved inventory.",

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

        body: {
          type: "object",
          required: ["quantity"],
          properties: {
            quantity: {
              type: "integer",
              minimum: 1,
            },
          },
        },

        response: {
          200: {
            description: "Reservation fulfilled successfully",
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

          409: {
            description: "Insufficient reserved stock",
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

      const body = stockOperationSchema.parse(request.body);

      try {
        const inventory = await fulfillReservationUseCase.execute({
          warehouseId: params.warehouseId,

          inventoryId: params.inventoryId,

          quantity: body.quantity,
        });

        return reply.status(200).send(inventory);
      } catch (error) {
        if (error instanceof InventoryNotFoundError) {
          return reply.status(404).send({
            error: error.message,
          });
        }

        if (error instanceof InsufficientReservedStockError) {
          return reply.status(409).send({
            error: error.message,
          });
        }

        throw error;
      }
    },
  );
}
