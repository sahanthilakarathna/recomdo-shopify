import "@shopify/shopify-app-remix/adapters/node";
import {
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
  LATEST_API_VERSION,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-01";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: LATEST_API_VERSION,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
      callback: async (topic, shop, body, webhookId) => {
        console.log("------App Uninstalled---");
        const payload = JSON.parse(body);
        console.log(payload);
        console.log("------App Uninstalled---");
      },
    },
    CUSTOMERS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
      callback: async (topic, shop, body, webhookId) => {
        console.log("------Customer Created---");
        const payload = JSON.parse(body);
        console.log(payload);
        console.log("------Customer Created---");
      },
    },
    PRODUCTS_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
      callback: async (topic, shop, body, webhookId) => {
        console.log("------Product Updated  ");
        const payload = JSON.parse(body);
        console.log(payload);
        console.log("------Product Updated");
      },
    },
    PRODUCTS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
      callback: async (topic, shop, body, webhookId) => {
        console.log("------Product Created  ");
        const payload = JSON.parse(body);
        console.log(payload);
        console.log("------Product Created");
      },
    },
    PRODUCTS_DELETE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
      callback: async (topic, shop, body, webhookId) => {
        console.log("------Product Deleted  ");
        const payload = JSON.parse(body);
        console.log(payload);
        console.log("------Product Deleted");
      },
    },
    PRODUCT_LISTINGS_ADD: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
      callback: async (topic, shop, body, webhookId) => {
        console.log("------Product Listing Add ");
        const payload = JSON.parse(body);
        console.log(payload);
        console.log("------Product Listing Add");
      },
    },
    PRODUCT_LISTINGS_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
      callback: async (topic, shop, body, webhookId) => {
        console.log("------Product Listing Update ");
        const payload = JSON.parse(body);
        console.log(payload);
        console.log("------Product Listing Update");
      },
    },
    COLLECTIONS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
      callback: async (topic, shop, body, webhookId) => {
        console.log("------Product Collection Create ");
        const payload = JSON.parse(body);
        console.log(payload);
        console.log("------Product Collection Create");
      },
    },
    COLLECTIONS_DELETE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
      callback: async (topic, shop, body, webhookId) => {
        console.log("------Product Collection Delete ");
        const payload = JSON.parse(body);
        console.log(payload);
        console.log("------Product Collection Delete");
      },
    },
    COLLECTIONS_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
      callback: async (topic, shop, body, webhookId) => {
        console.log("------Product Collection Update ");
        const payload = JSON.parse(body);
        console.log(payload);
        console.log("------Product Collection Update");
      },
    },
    BULK_OPERATIONS_FINISH: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
      callback: async (topic, shop, body, webhookId) => {
        console.log("------Bulk Operation Finish ");
        const payload = JSON.parse(body);
        console.log(payload);
        console.log("------Bulk Operation Finish ");
      },
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
    },
  },
  future: {
    v3_webhookAdminContext: true,
    v3_authenticatePublic: true,
    unstable_newEmbeddedAuthStrategy: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});
export default shopify;
export const apiVersion = LATEST_API_VERSION;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
