import { getSession } from "../api/prisma.server";
import { getAPIRequest } from "../helper/connection";
import { getMarketByCountryCode } from "../helper/getMarketByCountry";

const autoFill = async (req, res) => {
  const { keyword, country } = req.body;

  const session = await getSession();
  const { shop } = session;

  const selectedMarket = await getMarketByCountryCode(country, session);
  console.log("selectedMarketAutofill", selectedMarket);
  const AUTOFILL_ENDPOINT = `search/recomdoai_api/rest/${selectedMarket}/autofill_name`;
  try {
    console.log("qqqqqq", keyword);
    if (!keyword) {
      res.status(400).json({ error: "query required" });
    }
    const result = await getAPIRequest(
      AUTOFILL_ENDPOINT + "?keyword=" + keyword,
    );
    res.status(201).json({ result });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export default autoFill;
