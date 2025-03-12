import { type } from "os";
import { getSession } from "../api/prisma.server";
import { getAPIRequest } from "../helper/connection";
import { getMarketByCountryCode } from "../helper/getMarketByCountry";

const SortByOption = async (req, res) => {
  const country = req.query.country;
  const CategoryId = req.query.CategoryId;
  const session = await getSession();
  const { shop } = session;

  const selectedMarket = await getMarketByCountryCode(country, session);
  console.log("selectedMarketSORT", selectedMarket);
  const SORTBY_OPTION_ENDPOINT = `search/recomdoai_api/rest/${selectedMarket}/sort_by_options?Category-Id=`;
  try {
    console.log("URL-", SORTBY_OPTION_ENDPOINT, req.query);
    const result = await getAPIRequest(SORTBY_OPTION_ENDPOINT + CategoryId);
    console.log("sort_by_options Result ", result);
    if (result.data) {
      const sortbyoptions = result.data;

      res.status(201).json({ sortbyoptions });
    } else {
      res.status(201).json({});
    }
  } catch (err) {
    console.log("ERRR-", err);
    res.status(500).json({ error: err });
  }
};

export default SortByOption;
