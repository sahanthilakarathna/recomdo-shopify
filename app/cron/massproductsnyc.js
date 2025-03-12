import { ShopifyGraphqlCall, shopifyAPICall } from "../helper/connection";
import fs from "fs";
import { generateAllProductsJson } from "../helper/generateproductjson";
import { response } from "express";
const { fileGenerateLogger } = require("../helper/logger");
const readline = require("readline");

export const SyncAllProducts = async (session) => {
  try {
    const marketquery = ` {
      markets(first: 250) {
        nodes {
          id
        }
      }
    }`;
    const res = await ShopifyGraphqlCall(session, marketquery);
    if (res.data.markets.nodes.length > 1) {
      //For multiple markets go with bulk operations
      const query = `""" {
        markets {
          edges{
          node {
            id
            handle
            enabled
            priceList{
              catalog{
                id
                publication{
                  id
                  products{
                    pageInfo{
                      hasNextPage
                    }
                    edges{
                    node{
                       id
                    title
                    priceRangeV2{
                      maxVariantPrice{
                        amount
                        currencyCode
                      }
                      minVariantPrice{
                          amount
                        currencyCode
                      }
                    }
                    status
                    productType
                    description
                    handle
                    featuredImage{
                      url
                    }
                    options{
                      name
                      values
                    }
                    collections{
                      edges{
                        node{
                          id
                          handle
                        }
                      }
                    }
                    totalInventory
                  }
                    }
                  }
                }
              }
            }
          }
        }
      }
      }"""`;

      const bulkQuery = `mutation {
        bulkOperationRunQuery(
         query: ${query}
        ) {
          bulkOperation {
            id
            status
            completedAt
            errorCode
            fileSize
            objectCount
            url
          }
          userErrors {
            field
            message
          }
        }
      }
      `;
      await ShopifyGraphqlCall(session, bulkQuery);
    } else {
      //If has single market
      const query1 = `"""{
        products {
          pageInfo{
            hasNextPage
            
          }
          edges {
            node {
              id
              title
              priceRangeV2{
                maxVariantPrice{
                  amount
                  currencyCode
                }
                minVariantPrice{
                    amount
                  currencyCode
                }
              }
              status
              productType
              description
              handle
              featuredImage{
                url
              }
              options{
                name
                values
              }
              collections{
                edges{
                  node{
                    handle
                  }
                }
              }
              totalInventory
              resourcePublicationOnCurrentPublication {
                isPublished
              }
            }
          }
        }
      }"""`;
      const bulkQuery = `mutation {
        bulkOperationRunQuery(
         query: ${query1}
        ) {
          bulkOperation {
            id
            status
            completedAt
            errorCode
            fileSize
            objectCount
            url
          }
          userErrors {
            field
            message
          }
        }
      }
      `;
      await ShopifyGraphqlCall(session, bulkQuery);
    }
  } catch (err) {
    console.log("Product sync BULK ERROR", err);
  }
};

export const syncBulkOperationResult = async (session, payload) => {
  try {
    if (payload.status == "completed") {
      const marketquery = ` {
        markets(first: 250) {
          nodes {
            id
          }
        }
      }`;
      const res = await ShopifyGraphqlCall(session, marketquery);
      const markets = res.data.markets.nodes;
      const id = payload.admin_graphql_api_id;
      const query = `query {
        node(id: "${id}") {
          ... on BulkOperation {
            url
            partialDataUrl
          }
        }
      }
      `;
      var response = await ShopifyGraphqlCall(session, query);
      console.log("BULD URL RESPONSE", response);
      const productsOptions = await fetchJSONL(response.data.node.url)
        .then((data) => {
          data = JSON.parse(data);
          const nestedData = nestData(data);
          const managedData = manageData(nestedData, session, markets);
          const managedProdOptions = manageProductOptions(
            nestedData,
            session,
            markets,
          );
          fs.writeFile(
            "app/cron/full_products_update.json",
            managedData,
            function (err) {
              if (err) {
                fileGenerateLogger.info("Products Json generate error:" + err);
                throw err;
              }
              fileGenerateLogger.info("Products Json Saved!");
              console.log("Products Json Saved!");
            },
          );
          return managedProdOptions;
        })
        .catch((error) => {
          console.error("Error fetching JSONL:", error);
        });
      return productsOptions;
    }
  } catch (err) {
    console.log("Errrrrr", err);
  }
};

// Function to fetch JSONL data from URL
async function fetchJSONL(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch JSONL: ${response.statusText}`);
  }

  const jsonlData = await response.text(); // Read the response as text

  // Split the response text into lines and filter out empty lines
  const lines = jsonlData.split("\n").filter((line) => line.trim() !== "");

  // Parse each non-empty line as JSON and aggregate into an array
  const jsonArray = lines.map((line) => JSON.parse(line));

  // Convert the array of JSON objects into a JSON string
  const jsonString = JSON.stringify(jsonArray);

  return jsonString;
}

function nestData(data) {
  // Create a map to group objects by their parentId
  const groupedData = data.reduce((acc, obj) => {
    const parentId = obj.__parentId || "root"; // Use 'root' as key for top-level objects
    acc[parentId] = acc[parentId] || [];
    acc[parentId].push(obj);
    return acc;
  }, {});

  // Function to recursively nest collections
  function nestCollections(parentId) {
    const parentObjects = groupedData[parentId] || [];
    parentObjects.forEach((parent) => {
      parent.children = groupedData[parent.id] || []; // Set children array to empty array if no children
      nestCollections(parent.id); // Recursively nest collections for this parent
    });
  }

  // Start nesting from the 'root'
  nestCollections("root");

  // Return top-level objects
  return groupedData["root"] || [];
}

function manageData(items, session, markets) {
  const { shop, accessToken } = session;
  var marketProducts = [];
  if (markets.length > 1) {
    //FOR MULTIPLE MARKETS STORE
    for (var item in items) {
      var data = items[item];
      var products = data.children;
      for (var product in products) {
        var productData = products[product];
        // console.log("PRODUCT", productData, data.handle);
        var categoryArr = [];
        for (var category in productData.children) {
          var categoryData = productData.children[category];
          // console.log("CATEGORY", categoryData, data.handle);
          categoryArr.push(categoryData.handle);
        }
        categoryArr = [...new Set(categoryArr)];
        var productDetails = {
          description: productData.description,
          url_key: shop + "/products/" + productData.handle,
          key: productData.id.replace("gid://shopify/Product/", "").toString(),
          price: parseFloat(productData.priceRangeV2.minVariantPrice.amount),
          product_type: productData.product_type,
          name: productData.title,
          store_code: data.handle,
          status: productData.status == "ACTIVE" ? 1 : 0,
          image: productData.featuredImage
            ? productData.featuredImage.url
            : null,
          id: parseInt(productData.id.replace("gid://shopify/Product/", "")),
          visibility: 4,
          stock_status: productData.totalInventory > 0 ? true : false,
          parent_key: false,
          category_ids: categoryArr,
        };
        for (var option of productData.options) {
          productDetails[option.name.toLowerCase()] = option.values;
        }
        marketProducts.push(productDetails);
      }
    }
    return JSON.stringify(marketProducts);
  } else {
    // FOR SINGLE MARKET STORE
    for (const product of items) {
      var productData = product;
      var categoryArr = [];
      for (var category in productData.children) {
        var categoryData = productData.children[category];
        categoryArr.push(categoryData.handle);
      }
      categoryArr = [...new Set(categoryArr)];
      var productDetails = {
        description: productData.description,
        url_key: shop + "/products/" + productData.handle,
        key: productData.id.replace("gid://shopify/Product/", "").toString(),
        price: parseFloat(productData.priceRangeV2.minVariantPrice.amount),
        product_type: productData.product_type,
        name: productData.title,
        store_code: shop.replace(".myshopify.com", ""),
        status: productData.status == "ACTIVE" ? 1 : 0,
        image: productData.featuredImage ? productData.featuredImage.url : null,
        id: parseInt(productData.id.replace("gid://shopify/Product/", "")),
        visibility: 4,
        stock_status: productData.totalInventory > 0 ? true : false,
        parent_key: false,
        category_ids: categoryArr,
      };
      for (var option of productData.options) {
        productDetails[option.name.toLowerCase()] = option.values;
      }
      marketProducts.push(productDetails);
    }
    return JSON.stringify(marketProducts);
  }
}

function manageProductOptions(items, session, markets) {
  const { shop, accessToken } = session;
  var optionProducts = [];
  if (markets.length > 1) {
    //FOR MULTIPLE MARKETS STORE
    for (var item in items) {
      var data = items[item];
      var products = data.children;
      for (var product in products) {
        var productData = products[product];
        optionProducts.push({
          options: productData.options,
        });
      }
    }
    return JSON.stringify(optionProducts);
  } else {
    // FOR SINGLE MARKET STORE
    for (const product of items) {
      var productData = product;
      optionProducts.push({
        options: productData.options,
      });
    }
    return JSON.stringify(optionProducts);
  }
}

export const getProductsGraphql = async (session) => {
  var count = 50;
  var hasNextPage = true;
  var products = [];
  var options = [];
  while (hasNextPage) {
    const query = `{
      products(first: ${count}, reverse: false) {
        pageInfo{
          hasNextPage
          
        }
        edges {
          node {
            id
            title
            priceRangeV2{
              maxVariantPrice{
                amount
                currencyCode
              }
              minVariantPrice{
                  amount
                currencyCode
              }
            }
            status
            productType
            description
            handle
            featuredImage{
              url
            }
            options{
              name
              values
            }
            collections(first:100){
              edges{
                node{
                  handle
                }
              }
            }
            totalInventory
            resourcePublicationOnCurrentPublication {
              isPublished
            }
          }
        }
      }
    }`;
    var response = await ShopifyGraphqlCall(session, query);
    products = [...products, ...response.data.products.edges];
    products = [...new Set(products)];

    hasNextPage = response.data.products.pageInfo.hasNextPage;
    count = count + count;
  }
  //Remove duplicate products in array
  var jsonObject = products.map(JSON.stringify);
  var uniqueSet = new Set(jsonObject);
  var uniqueArray = Array.from(uniqueSet).map(JSON.parse);
  return uniqueArray;
};
