import { ShopifyGraphqlCall } from "../helper/connection";
import { GenerateAllCategoryJson } from "../helper/generatecategoryjson";
import fs from "fs";
const { fileGenerateLogger } = require("../helper/logger");

export const SyncAllCategories = async (session) => {
  try {
    const marketquery = ` {
      markets(first: 250) {
        nodes {
          id
          handle
        }
      }
    }`;
    const res = await ShopifyGraphqlCall(session, marketquery);
    const markets = res.data.markets.nodes;
    console.log("cat sync start");
    const query = `query {
      collections(first: 5) {
        edges {
          node {
            id
            title
            handle
            updatedAt
            productsCount
            sortOrder
          }
        }
      }
    }`;
    var collections = await ShopifyGraphqlCall(session, query);
    console.log(
      "All categories",
      JSON.stringify(collections.data.collections.edges),
    );
    const allCategoryJson = await GenerateAllCategoryJson(
      markets,
      collections.data.collections.edges,
      session,
    );

    fs.writeFile(
      "app/cron/product_category.json",
      allCategoryJson,
      function (err) {
        if (err) {
          fileGenerateLogger.info("Category Json generate error:" + err);
          throw err;
        }
        fileGenerateLogger.info("Category Json Saved!");
        console.log("Category JSON Saved!");
      },
    );
  } catch (err) {
    console.log("Errrrrr", err);
  }
};
