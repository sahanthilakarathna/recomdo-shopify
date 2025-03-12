import { deleteAPIRequest, postAPIRequest } from "./connection";
import { generateJson, generateOptionsJson } from "./generateproductjson";
const { deltaSyncLogger } = require("./logger");

const UPDATE_ENDPOINT = "api/recomdoai_api/selected_products_update";
const DELETE_ENDPOINT = "api/recomdoai_api/selected_products_delete";

const ATTR_UPDATE_ENDPOINT = "api/recomdoai_api/attribute_option_update";

export const productUpdate = async (payload, session) => {
  try {
    console.log("product update js");
    const json = await generateJson(payload, session);
    const response = await postAPIRequest(UPDATE_ENDPOINT, json);
    deltaSyncLogger.info("Product Delta Sync Response:" + response);
    console.log("Product Delta Sync Response", response);
  } catch (err) {
    deltaSyncLogger.info("Product Update Error:" + err);
    console.log("err", err);
  }
};

export const productDelete = async (payload, session) => {
  try {
    const response = await deleteAPIRequest(DELETE_ENDPOINT, session);
    deltaSyncLogger.info("Product Delta Delete Response:" + response);
    console.log("Product Delta Delete Response", response);
  } catch (err) {
    deltaSyncLogger.info("Product Delete Error:" + err);
    console.log("err", err);
  }
};

export const productOptionsUpload = async (payload, session) => {
  try {
    const json = await generateOptionsJson(payload, session);
    const response = await postAPIRequest(ATTR_UPDATE_ENDPOINT, json);
    deltaSyncLogger.info("Product Attribute Delta Sync Response:" + response);
    console.log("Product Attribute Delta Sync Response", response);
  } catch (err) {
    deltaSyncLogger.info("productOptionsUpload Error:" + err);
    console.log("err", err);
  }
};
