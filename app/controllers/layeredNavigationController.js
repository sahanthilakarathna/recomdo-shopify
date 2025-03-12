import { type } from "os";
import { getSession } from "../api/prisma.server";
import { getAPIRequest } from "../helper/connection";
import { getMarketByCountryCode } from "../helper/getMarketByCountry";

const LayeredNavigation = async (req, res) => {
  const country = req.query.country
  const CategoryId =  req.query.CategoryId
  const session = await getSession();
  const { shop } = session;

  const selectedMarket = await getMarketByCountryCode(country, session);
  console.log("selectedMarket", selectedMarket);
  const LAYERED_NAV_ENDPOINT = `search/recomdoai_api/rest/${selectedMarket}/layered_navigation_filter?Category-Id=`;
  try {
   
    console.log("URL-", LAYERED_NAV_ENDPOINT,CategoryId);
    const result = await getAPIRequest(
      LAYERED_NAV_ENDPOINT+CategoryId
    );
    console.log("layered_navigation_filter ", result);
    if (result.data) {
      const layerednavsort = result.data;

      res.status(201).json({ layerednavsort });
    } else {
      res.status(201).json({});
    }
  } catch (err) {
    console.log("ERRR-", err);
    res.status(500).json({ error: err });
  }
};

export default LayeredNavigation;
