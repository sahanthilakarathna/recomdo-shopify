import { authenticate } from "../shopify.server";
import db from "../db.server";
import {
  productDelete,
  productOptionsUpload,
  productUpdate,
} from "../helper/productsupload";
import { CategoryUpdate } from "../model/category/categoryupload";
import { syncBulkOperationResult } from "../cron/massproductsnyc";
import { UploadFileToS3 } from "../helper/uploadtos3";
import { SyncAllAttributes } from "../cron/massattributesync";

const PRODUCTS_S3_KEY =
  "Recomdoai/product_json_export/full_products_update.json";
const PRODUCTS_FILE = "full_products_update.json";

const ATTRIBUTES_S3_KEY =
  "Recomdoai/attribute_json_export/product_attribute.json";
const ATTRIBUTES_FILE = "product_attribute.json";

export const action = async ({ request }) => {
  const { topic, shop, session, admin, payload } =
    await authenticate.webhook(request);

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }

  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }

      break;
    case "CUSTOMERS_CREATE":
      console.log("-----hit customer webhook START");
      console.log(payload);
      console.log("-----hit customer webhook END");

      break;
    case "PRODUCTS_UPDATE":
      console.log("-----hit product update webhook START");
      console.log(payload);
      console.log("----- product sync START-----");
      await productUpdate(payload, session);
      console.log("----- product sync END-----");

      console.log("----- product attribute sync START-----");
      await productOptionsUpload(payload, session);
      console.log("----- product attribute sync END-----");

      console.log("-----hit product update webhook END");

      break;
    case "PRODUCTS_CREATE":
      console.log("-----hit product create webhook START");
      console.log(payload);
      console.log("-----hit product create webhook END");

      break;
    case "PRODUCTS_DELETE":
      console.log("-----hit product delete webhook START");
      console.log(payload);
      await productDelete(payload, session);
      console.log("-----hit product delete webhook END");

      break;
    case "PRODUCT_LISTINGS_ADD":
      console.log("-----hit product listing Add webhook START");
      console.log(payload);
      console.log("-----hit product listing Add webhook END");

      break;
    case "PRODUCT_LISTINGS_UPDATE":
      console.log("-----hit product listing Update webhook START");
      console.log(payload);
      console.log("-----hit product listing Update webhook END");

      break;
    case "COLLECTIONS_CREATE":
      console.log("-----hit collection create webhook START");
      console.log(payload.id);
      await CategoryUpdate(payload, session);
      console.log("-----hit collection create webhook END");

      break;
    case "COLLECTIONS_DELETE":
      console.log("-----hit collection delete webhook START");
      console.log(payload);
      console.log("-----hit collection delete webhook END");

      break;
    case "COLLECTIONS_UPDATE":
      console.log("-----hit collection update webhook START");
      console.log(payload.id);
      await CategoryUpdate(payload, session);
      console.log("-----hit collection Update webhook END");

      break;
    case "BULK_OPERATIONS_FINISH":
      console.log("-----hit bulk operation finish webhook START");
      console.log("BULK OPERATION PAYLOAD", payload);
      const productOptions = await syncBulkOperationResult(session, payload);
      await SyncAllAttributes(session, productOptions);
      await UploadFileToS3(PRODUCTS_S3_KEY, PRODUCTS_FILE);
      await UploadFileToS3(ATTRIBUTES_S3_KEY, ATTRIBUTES_FILE);
      console.log("-----hit bulk operation finish END");

      break;
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
