import type { FastifyInstance } from "fastify";

import { prisma } from "../../../apps/api/src/plugins/prisma.js";

import { CreateOrder } from "../application/create-order.js";
import { GetOrder } from "../application/get-order.js";
import { ListOrders } from "../application/list-orders.js";
import { AllocateOrder } from "../application/allocate-order.js";
import { PrismaOrderAllocationRepository } from "../infrastructure/prisma-order-allocation-repository.js";
import { FulfillOrder } from "../application/fulfill-order.js";
import { PrismaOrderFulfillmentRepository } from "../infrastructure/prisma-order-fulfillment-repository.js";
import { CancelOrder } from "../application/cancel-order.js";
import { PrismaOrderCancellationRepository } from "../infrastructure/prisma-order-cancellation-repository.js";

import {
  InsufficientInventoryError,
  InvalidOrderStatusTransitionError,
  OrderMustHaveItemsError,
  OrderNotFoundError,
  SKUNotFoundError,
  StoreNotFoundError,
} from "../application/errors.js";

import { PrismaOrderRepository } from "../infrastructure/prisma-order-repository.js";
import { PrismaStoreLookupRepository } from "../infrastructure/prisma-store-lookup-repository.js";
import { PrismaSKULookupRepository } from "../infrastructure/prisma-sku-lookup-repository.js";

import { createOrderSchema, orderIdParamsSchema } from "./order.schemas.js";
import { ConfirmOrder } from "../application/confirm-order.js";

export async function orderRoutes(app: FastifyInstance) {
  const repository = new PrismaOrderRepository(prisma);

  const storeRepository = new PrismaStoreLookupRepository(prisma);

  const skuRepository = new PrismaSKULookupRepository(prisma);

  const allocationRepository = new PrismaOrderAllocationRepository(prisma);

  const fulfillmentRepository = new PrismaOrderFulfillmentRepository(prisma);

  const cancellationRepository = new PrismaOrderCancellationRepository(prisma);

  const getOrderUseCase = new GetOrder(repository);

  const createOrderUseCase = new CreateOrder(
    repository,
    storeRepository,
    skuRepository,
  );

  const listOrdersUseCase = new ListOrders(repository);

  const confirmOrderUseCase = new ConfirmOrder(repository);

  const allocateOrderUseCase = new AllocateOrder(allocationRepository);

  const fulfillOrderUseCase = new FulfillOrder(fulfillmentRepository);

  const cancelOrderUseCase = new CancelOrder(cancellationRepository);
  /*
   * CREATE ORDER
   */

  app.post(
    "/api/v1/orders",
    {
      schema: {
        tags: ["Orders"],
        summary: "Create an order",
        description: "Creates a new order in PENDING status.",

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
          required: ["storeId", "externalId", "items"],

          properties: {
            storeId: {
              type: "string",
              format: "uuid",
            },

            externalId: {
              type: "string",
              minLength: 1,
              maxLength: 255,
            },

            items: {
              type: "array",
              minItems: 1,

              items: {
                type: "object",
                required: ["skuId", "quantity", "unitPrice"],

                properties: {
                  skuId: {
                    type: "string",
                    format: "uuid",
                  },

                  quantity: {
                    type: "integer",
                    minimum: 1,
                  },

                  unitPrice: {
                    type: "number",
                    minimum: 0,
                  },
                },
              },
            },
          },
        },

        response: {
          201: {
            description: "Order created successfully",
            type: "object",
          },

          400: {
            description: "Invalid order request",
            type: "object",
            properties: {
              error: {
                type: "string",
              },
            },
          },

          404: {
            description: "Store or SKU not found",
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

      if (typeof tenantId !== "string" || !tenantId) {
        return reply.status(400).send({
          error: "Tenant ID header is required",
        });
      }

      const body = createOrderSchema.parse(request.body);

      try {
        const order = await createOrderUseCase.execute({
          tenantId,

          storeId: body.storeId,

          externalId: body.externalId,

          items: body.items,
        });

        return reply.status(201).send(order);
      } catch (error) {
        if (error instanceof StoreNotFoundError) {
          return reply.status(404).send({
            error: error.message,
          });
        }

        if (error instanceof SKUNotFoundError) {
          return reply.status(404).send({
            error: error.message,
          });
        }

        if (error instanceof OrderMustHaveItemsError) {
          return reply.status(400).send({
            error: error.message,
          });
        }

        throw error;
      }
    },
  );

  /*
   * LIST ORDERS
   */

  app.get(
    "/api/v1/orders",
    {
      schema: {
        tags: ["Orders"],
        summary: "List orders",
        description: "Lists orders belonging to the tenant.",

        headers: {
          type: "object",
          required: ["x-tenant-id"],
          properties: {
            "x-tenant-id": {
              type: "string",
              format: "uuid",
            },
          },
        },

        response: {
          200: {
            description: "Orders retrieved successfully",
            type: "array",
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

      if (typeof tenantId !== "string" || !tenantId) {
        return reply.status(400).send({
          error: "Tenant ID header is required",
        });
      }

      const orders = await listOrdersUseCase.execute(tenantId);

      return reply.status(200).send(orders);
    },
  );

  /*
   * GET ORDER
   */

  app.get(
    "/api/v1/orders/:orderId",
    {
      schema: {
        tags: ["Orders"],
        summary: "Get order",
        description: "Retrieves an order belonging to the tenant.",

        headers: {
          type: "object",
          required: ["x-tenant-id"],
          properties: {
            "x-tenant-id": {
              type: "string",
              format: "uuid",
            },
          },
        },

        params: {
          type: "object",
          required: ["orderId"],
          properties: {
            orderId: {
              type: "string",
              format: "uuid",
            },
          },
        },

        response: {
          200: {
            description: "Order retrieved successfully",
            type: "object",
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

          404: {
            description: "Order not found",
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

      if (typeof tenantId !== "string" || !tenantId) {
        return reply.status(400).send({
          error: "Tenant ID header is required",
        });
      }

      const params = orderIdParamsSchema.parse(request.params);

      try {
        const order = await getOrderUseCase.execute(tenantId, params.orderId);

        return reply.status(200).send(order);
      } catch (error) {
        if (error instanceof OrderNotFoundError) {
          return reply.status(404).send({
            error: error.message,
          });
        }

        throw error;
      }
    },
  );

  app.post(
    "/api/v1/orders/:orderId/confirm",
    {
      schema: {
        tags: ["Orders"],
        summary: "Confirm order",
        description:
          "Confirms an order and advances it from a valid pending state to the confirmed state.",

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
          required: ["orderId"],
          properties: {
            orderId: {
              type: "string",
              format: "uuid",
              description: "Order UUID to confirm",
            },
          },
        },

        response: {
          200: {
            description: "Order confirmed successfully",
            type: "object",
          },
          400: {
            description: "Tenant ID header is missing or invalid",
            type: "object",
            properties: {
              error: {
                type: "string",
              },
            },
          },
          404: {
            description: "Order not found",
            type: "object",
            properties: {
              error: {
                type: "string",
              },
            },
          },

          409: {
            description: "Order cannot be confirmed in its current state",
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

      if (typeof tenantId !== "string" || !tenantId) {
        return reply.status(400).send({
          error: "Tenant ID header is required",
        });
      }

      const params = orderIdParamsSchema.parse(request.params);

      try {
        const order = await confirmOrderUseCase.execute(
          tenantId,
          params.orderId,
        );

        return reply.status(200).send(order);
      } catch (error) {
        if (error instanceof OrderNotFoundError) {
          return reply.status(404).send({
            error: error.message,
          });
        }

        if (error instanceof InvalidOrderStatusTransitionError) {
          return reply.status(409).send({
            error: error.message,
          });
        }

        throw error;
      }
    },
  );

  app.post(
    "/api/v1/orders/:orderId/allocate",
    {
      schema: {
        tags: ["Orders"],
        summary: "Allocate order",
        description:
          "Reserves inventory for all order items and transitions the order to ALLOCATED.",

        params: {
          type: "object",
          required: ["orderId"],
          properties: {
            orderId: {
              type: "string",
              format: "uuid",
            },
          },
        },

        response: {
          200: {
            type: "object",
          },

          404: {
            type: "object",
            properties: {
              error: {
                type: "string",
              },
            },
          },

          409: {
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
      const params = orderIdParamsSchema.parse(request.params);

      try {
        const order = await allocateOrderUseCase.execute(
          request.headers["x-tenant-id"] as string,
          params.orderId,
        );

        return reply.status(200).send(order);
      } catch (error) {
        if (error instanceof OrderNotFoundError) {
          return reply.status(404).send({
            error: error.message,
          });
        }

        if (error instanceof InvalidOrderStatusTransitionError) {
          return reply.status(409).send({
            error: error.message,
          });
        }

        if (error instanceof InsufficientInventoryError) {
          return reply.status(409).send({
            error: error.message,
          });
        }

        throw error;
      }
    },
  );

  /*
   * FULFILL ORDER
   */

  app.post(
    "/api/v1/orders/:orderId/fulfill",
    {
      schema: {
        tags: ["Orders"],
        summary: "Fulfill order",
        description:
          "Consumes reserved inventory and transitions an allocated order to fulfilled.",

        params: {
          type: "object",
          required: ["orderId"],
          properties: {
            orderId: {
              type: "string",
              format: "uuid",
            },
          },
        },

        response: {
          200: {
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
              storeId: {
                anyOf: [
                  {
                    type: "string",
                    format: "uuid",
                  },
                  {
                    type: "null",
                  },
                ],
              },
              externalId: {
                anyOf: [
                  {
                    type: "string",
                  },
                  {
                    type: "null",
                  },
                ],
              },
              status: {
                type: "string",
                enum: [
                  "PENDING",
                  "CONFIRMED",
                  "ALLOCATED",
                  "FULFILLED",
                  "CANCELLED",
                ],
              },
              createdAt: {
                type: "string",
                format: "date-time",
              },
              updatedAt: {
                type: "string",
                format: "date-time",
              },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      format: "uuid",
                    },
                    orderId: {
                      type: "string",
                      format: "uuid",
                    },
                    skuId: {
                      type: "string",
                      format: "uuid",
                    },
                    quantity: {
                      type: "integer",
                    },
                    unitPrice: {
                      type: "number",
                    },
                    createdAt: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
              },
            },
          },

          404: {
            type: "object",
            properties: {
              error: {
                type: "string",
              },
            },
          },

          409: {
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
      const params = orderIdParamsSchema.parse(request.params);

      try {
        const order = await fulfillOrderUseCase.execute(
          request.headers["x-tenant-id"] as string,
          params.orderId,
        );

        return reply.status(200).send(order);
      } catch (error) {
        if (error instanceof OrderNotFoundError) {
          return reply.status(404).send({
            error: error.message,
          });
        }

        if (error instanceof InvalidOrderStatusTransitionError) {
          return reply.status(409).send({
            error: error.message,
          });
        }

        if (error instanceof InsufficientInventoryError) {
          return reply.status(409).send({
            error: error.message,
          });
        }

        throw error;
      }
    },
  );

  /*
   * Cancellation
   */
  app.post(
    "/api/v1/orders/:orderId/cancel",
    {
      schema: {
        tags: ["Orders"],
        summary: "Cancel order",
        description:
          "Cancels a pending, confirmed, or allocated order. Allocated orders release their reserved inventory.",

        params: {
          type: "object",
          required: ["orderId"],
          properties: {
            orderId: {
              type: "string",
              format: "uuid",
            },
          },
        },

        response: {
          200: {
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

              storeId: {
                anyOf: [
                  {
                    type: "string",
                    format: "uuid",
                  },
                  {
                    type: "null",
                  },
                ],
              },

              externalId: {
                anyOf: [
                  {
                    type: "string",
                  },
                  {
                    type: "null",
                  },
                ],
              },

              status: {
                type: "string",
                enum: [
                  "PENDING",
                  "CONFIRMED",
                  "ALLOCATED",
                  "FULFILLED",
                  "CANCELLED",
                ],
              },

              createdAt: {
                type: "string",
                format: "date-time",
              },

              updatedAt: {
                type: "string",
                format: "date-time",
              },

              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      format: "uuid",
                    },

                    orderId: {
                      type: "string",
                      format: "uuid",
                    },

                    skuId: {
                      type: "string",
                      format: "uuid",
                    },

                    quantity: {
                      type: "integer",
                    },

                    unitPrice: {
                      type: "number",
                    },

                    createdAt: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
              },
            },
          },

          404: {
            type: "object",
            properties: {
              error: {
                type: "string",
              },
            },
          },

          409: {
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
      const params = orderIdParamsSchema.parse(request.params);

      try {
        const order = await cancelOrderUseCase.execute(
          request.headers["x-tenant-id"] as string,
          params.orderId,
        );

        return reply.status(200).send(order);
      } catch (error) {
        if (error instanceof OrderNotFoundError) {
          return reply.status(404).send({
            error: error.message,
          });
        }

        if (error instanceof InvalidOrderStatusTransitionError) {
          return reply.status(409).send({
            error: error.message,
          });
        }

        throw error;
      }
    },
  );
}
