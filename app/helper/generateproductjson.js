import { authenticate } from "../shopify.server";
import { shopifyAPICall } from "./connection";

export const generateJson = async (payload, session) => {
  // console.log("generate js",session)
  // const { session } = await authenticate.admin(request)
  // console.log("generate js1")
  const { shop, accessToken } = session;

  const productArray = [];
  var qty = 0;
  //Calculate total qty variant-wise
  payload.variants.map((item, index) => {
    qty = qty + item.inventory_quantity;
  });
  const collectParams = `product_id=${payload.id}`;
  const collects = await shopifyAPICall(
    `collects`,
    null,
    session,
    collectParams,
  );
  var categoryArr = [];
  //Set category url_keys (unique) to product json
  for (const collect of collects.collects) {
    try {
      const response = await shopifyAPICall(
        `collections/${collect.collection_id}`,
        null,
        session,
        null,
      );
      categoryArr.push(response.collection.handle);
    } catch (err) {
      console.error("Error fetching", err);
    }
  }

  productArray.push({
    description: payload.body_html,
    url_key: shop + "/products/" + payload.handle,
    key: payload.id.toString(),
    price: parseFloat(payload.variants[0].price),
    product_type: payload.product_type,
    name: payload.title,
    store_code: shop.replace(".myshopify.com", ""),
    status: payload.status == "active" ? 1 : 0,
    // published_scope: payload.published_scope,
    // tags: payload.tags,
    // variants:  payload.variants,
    // options: payload.options,
    // images: payload.images,
    image: payload.image.src,
    // variant_ids: payload.variant_ids,
    id: payload.id,
    visibility: 4,
    stock_status: qty > 0 ? true : false,
    parent_key: false,
    category_ids: categoryArr,
  });
  // console.log("strrrrrr",JSON.stringify(productArray))
  console.log("generate js end");
  return JSON.stringify(productArray, null, 2);
};

export const generateOptionsJson = async (payload, session) => {
  const options = payload.options;
  var atributes = [];
  for (const option of options) {
    try {
      var values = [];
      for (const value of option.values) {
        values.push({
          value: value.toLowerCase(),
          label: value,
        });
      }
      atributes.push({
        code: "shopify_" + option.name.toLowerCase().replace(" ", "_"),
        name: option.name,
        type: "select",
        is_filterable: "1",
        is_searchable: "1",
        option: values,
      });
    } catch (err) {
      console.error("Error fetching attributes", err);
    }
  }
  console.log("ATTRIBUTES", JSON.stringify(atributes, null, 2));
  return JSON.stringify(atributes, null, 2);
};

export const generateAllProductsJson = async (products, session) => {
  var allProducts = [];
  const { shop, accessToken } = session;
  for (const product of products) {
    var categoryArr = [];
    var qty = product.node.totalInventory;
    for (const collection of product.node.collections.edges) {
      categoryArr.push(collection.node.handle);
    }
    allProducts.push({
      description: product.node.description,
      url_key: shop + "/products/" + product.node.handle,
      key: product.node.id.replace("gid://shopify/Product/", "").toString(),
      price: parseFloat(product.node.priceRangeV2.minVariantPrice.amount),
      product_type: product.node.product_type,
      name: product.node.title,
      store_code: shop.replace(".myshopify.com", ""),
      status: product.node.status == "ACTIVE" ? 1 : 0,
      image: product.node.featuredImage ? product.node.featuredImage.url : null,
      id: parseInt(product.node.id.replace("gid://shopify/Product/", "")),
      visibility: 4,
      stock_status: qty > 0 ? true : false,
      parent_key: false,
      category_ids: categoryArr,
    });
  }

  return JSON.stringify(allProducts);
};
