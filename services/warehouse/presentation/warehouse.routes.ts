import type { FastifyInstance } from "fastify";

import { prisma } from "../../../apps/api/src/plugins/prisma.js";

import { CreateWarehouse } from "../application/create-warehouse.js";
import { GetWarehouse } from "../application/get-warehouse.js";
import { ListWarehouses } from "../application/list-warehouses.js";

import { PrismaWarehouseRepository } from "../infrastructure/prisma-warehouse-repository.js";

import {
  createWarehouseSchema,
  warehouseIdParamsSchema,
} from "./warehouse.schemas.js";

export async function warehouseRoutes(app: FastifyInstance) {
  const repository = new PrismaWarehouseRepository(prisma);

  const createWarehouseUseCase = new CreateWarehouse(repository);

  const getWarehouseUseCase = new GetWarehouse(repository);

  const listWarehousesUseCase = new ListWarehouses(repository);

  /*
   * CREATE WAREHOUSE
   */

  app.post(
    "/api/v1/warehouses",
    {
      schema: {
        tags: ["Warehouses"],
        summary: "Create a warehouse",
        description: "Creates a new warehouse for the specified tenant.",

        headers: {
          type: "object",
          required: ["x-tenant-id"],
          properties: {
            "x-tenant-id": {
              type: "string",
              format: "uuid",
              description: "Tenant UUID",
            },
          },
        },

        body: {
          type: "object",
          required: ["name", "city", "country"],
          properties: {
            name: {
              type: "string",
              minLength: 1,
              maxLength: 255,
              description: "Warehouse name",
            },

            city: {
              type: "string",
              minLength: 1,
              maxLength: 150,
              description: "Warehouse city",
            },

            country: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              description: "Warehouse country",
            },
          },
        },

        response: {
          201: {
            description: "Warehouse created successfully",
            type: "object",
            properties: {
              id: {
                type: "string",
                format: "uuid",
              },

              tenantId: {
                type: "string",
                format: "uuid",
              },

              name: {
                type: "string",
              },

              city: {
                type: "string",
              },

              country: {
                type: "string",
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
            description: "Invalid request or missing tenant ID",
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
      const body = createWarehouseSchema.parse(request.body);

      const tenantId = request.headers["x-tenant-id"];

      if (typeof tenantId !== "string") {
        return reply.status(400).send({
          error: "Tenant ID header is required",
        });
      }

      if (!tenantId) {
        return reply.status(400).send({
          error: "Tenant ID header is required",
        });
      }

      const warehouse = await createWarehouseUseCase.execute({
        tenantId,
        name: body.name,
        city: body.city,
        country: body.country,
      });

      return reply.status(201).send(warehouse);
    },
  );

  /*
   * LIST WAREHOUSES
   */

  app.get(
    "/api/v1/warehouses",
    {
      schema: {
        tags: ["Warehouses"],
        summary: "List warehouses",
        description:
          "Retrieves all warehouses belonging to the specified tenant.",

        headers: {
          type: "object",
          required: ["x-tenant-id"],
          properties: {
            "x-tenant-id": {
              type: "string",
              format: "uuid",
              description: "Tenant UUID",
            },
          },
        },

        response: {
          200: {
            description: "Warehouses retrieved successfully",
            type: "array",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                },

                tenantId: {
                  type: "string",
                  format: "uuid",
                },

                name: {
                  type: "string",
                },

                city: {
                  type: "string",
                },

                country: {
                  type: "string",
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

          400: {
            description: "Tenant ID header is missing",
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
      const tenantId = request.headers["x-tenant-id"];

      if (typeof tenantId !== "string") {
        return reply.status(400).send({
          error: "Tenant ID header is required",
        });
      }

      if (!tenantId) {
        return reply.status(400).send({
          error: "Tenant ID header is required",
        });
      }

      const warehouses = await listWarehousesUseCase.execute(tenantId);

      return reply.status(200).send(warehouses);
    },
  );

  /*
   * GET WAREHOUSE
   */

  app.get(
    "/api/v1/warehouses/:warehouseId",
    {
      schema: {
        tags: ["Warehouses"],
        summary: "Get a warehouse by ID",
        description: "Retrieves a warehouse belonging to the specified tenant.",

        headers: {
          type: "object",
          required: ["x-tenant-id"],
          properties: {
            "x-tenant-id": {
              type: "string",
              format: "uuid",
              description: "Tenant UUID",
            },
          },
        },

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

        response: {
          200: {
            description: "Warehouse retrieved successfully",
            type: "object",
            properties: {
              id: {
                type: "string",
                format: "uuid",
              },

              tenantId: {
                type: "string",
                format: "uuid",
              },

              name: {
                type: "string",
              },

              city: {
                type: "string",
              },

              country: {
                type: "string",
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
            description: "Invalid request or missing tenant ID",
            type: "object",
            properties: {
              error: {
                type: "string",
              },
            },
          },

          404: {
            description: "Warehouse not found",
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

      const tenantId = request.headers["x-tenant-id"];

      if (typeof tenantId !== "string") {
        return reply.status(400).send({
          error: "Tenant ID header is required",
        });
      }

      if (!tenantId) {
        return reply.status(400).send({
          error: "Tenant ID header is required",
        });
      }

      const warehouse = await getWarehouseUseCase.execute(
        tenantId,
        params.warehouseId,
      );

      if (!warehouse) {
        return reply.status(404).send({
          error: "Warehouse not found",
        });
      }

      return reply.status(200).send(warehouse);
    },
  );
}
