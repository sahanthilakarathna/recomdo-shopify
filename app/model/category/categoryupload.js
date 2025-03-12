import { ShopifyGraphqlCall, postAPIRequest } from "../../helper/connection";
import { generateJson } from "../../helper/generatecategoryjson";
const { deltaSyncLogger } = require("../../helper/logger");

const ENDPOINT = "api/recomdoai_api/selected_category_update";

export const CategoryUpdate = async (payload, session) => {
  try {
    console.log("CATEGORY UPLOAD START");
    const marketquery = ` {
      markets(first: 50) {
        nodes {
          id
          handle
        }
      }
    }`;
    const res = await ShopifyGraphqlCall(session, marketquery);
    const markets = res.data.markets.nodes;
    const json = await generateJson(payload, session, markets);
    const response = await postAPIRequest(ENDPOINT, json);
    deltaSyncLogger.info("CATEGORY DELTA SYNC RESPONSE:" + response);
    console.log("CATEGORY DELTA SYNC RESPONSE ", response);
    console.log("CATEGORY UPLOAD END");
  } catch (err) {
    deltaSyncLogger.info("CATEGORY DELTA SYNC ERR :" + response);
    console.log("CATEGORY UPLOAD ERR", err);
  }
};
