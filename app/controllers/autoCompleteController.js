import { getSession } from "../api/prisma.server";
import { getAPIRequest } from "../helper/connection";
import { getMarketByCountryCode } from "../helper/getMarketByCountry";

const autoComplete = async (req, res) => {
  const { keyword, country } = req.body;
  const session = await getSession();
  const { shop } = session;

  var storecode = shop.replace(".myshopify.com", "");

  const selectedMarket = await getMarketByCountryCode(country, session);

  const AUTOCOMPLETE_ENDPOINT = `search/recomdoai_api/rest/${selectedMarket}/autocomplete`;
  let html = `<div id="shopify-section-predictive-search" class="shopify-section">
  <div id="suggestion-container" class=suggestion-container>
  <div id="suggest-content-main" class="suggest-content-main">
  <p class="title">Products</p>
  <div id="suggest-content" class="suggest-content-style">`;
  try {
    console.log("qqqqqq", keyword, country);
    if (!keyword) {
      res.status(400).json({ error: "query required" });
    }
    const result = await getAPIRequest(
      AUTOCOMPLETE_ENDPOINT + "?keyword=" + keyword,
    );
    const totalCount =
      result.data.main_results.length +
      result.data.category_results.length +
      result.data.suggestions.length;
    //Generate products HTML
    for (const product of result.data.main_results) {
      html += `<a href="${product.url_key}"><div class="item-container">
        <img src="${product.image}"/>
        <div class="item-info">
        <span>${product.name}</span>
        <p>${product.price}</p>
        </div>
        </div>
        </a>`;
    }
    html += `</div></div>
    <div id="other-suggestions" class="other-suggestions">
        <div id="category-suggestions" class="category-suggestions">
        <p class="title">Categories</p>`;
    //Generate category HTML
    for (const category of result.data.category_results) {
      html += `<a href="${"https://" + category.category_url}">
            ${category.category_name}
            </a>`;
    }
    html += `</div> <div id="word-suggestions" class="word-suggestions">
    <p class="title">POPULAR SEARCHES</p>`;
    //Generate suggested words HTML
    for (const word of result.data.suggestions) {
      html += `<a href="${"https://" + shop + "/search?q=" + word.suggestion_text}">
        ${word.suggestion_text}
        </a>`;
    }
    html += `</div></div>
    <span class="hidden" data-predictive-search-live-region-count-value="">
    ${totalCount} results: ${result.data.suggestions.length} suggestions, 
    ${result.data.category_results.length} pages, ${result.data.main_results.length} products
  </span>
    </div></div>`;
    html = JSON.parse(JSON.stringify(html));
    // res.status(201).json({ html });
    res.status(201).set("Content-Type", "text/html").send(html);
  } catch (err) {
    console.log("AutoComplete Err-", err);
    res.status(500).json({ error: err });
  }
};

export default autoComplete;
