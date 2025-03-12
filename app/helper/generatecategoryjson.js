export const generateJson = async (payload, session, markets) => {
  console.log("CATEGORY GENERATE START");
  const { shop, accessToken } = session;
  const categoryArray = [];
  for (const market of markets) {
    categoryArray.push({
      category_id: payload.id.toString(),
      category_name: payload.title,
      category_url: shop + "/collections/" + payload.handle,
      path: payload.handle,
      store_code: market.handle,
    });
  }

  console.log("CATEGORY GENERATE END");
  return JSON.stringify(categoryArray, null, 2);
};

export const GenerateAllCategoryJson = async (markets, categories, session) => {
  var allCategories = [];
  const { shop, accessToken } = session;
  for (const market of markets) {
    for (const category of categories) {
      allCategories.push({
        category_id: category.node.id
          .replace("gid://shopify/Collection/", "")
          .toString(),
        category_name: category.node.title,
        category_url: shop + "/collections/" + category.node.handle,
        path: category.node.handle,
        store_code: market.handle,
      });
    }
  }

  return JSON.stringify(allCategories);
};
