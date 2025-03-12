import { type } from "os";
import { getSession } from "../api/prisma.server";
import { getAPIRequest } from "../helper/connection";
import { getMarketByCountryCode } from "../helper/getMarketByCountry";

const searchSuggestion = async (req, res) => {
  const { keyword, country } = req.body;

  const session = await getSession();
  const { shop } = session;

  const selectedMarket = await getMarketByCountryCode(country, session);
  const SUGGESTION_ENDPOINT = `search/recomdoai_api/${selectedMarket}/suggestions`;
  try {
    if (!keyword) {
      res.status(400).json({ error: "query required" });
    }
    const result = await getAPIRequest(
      SUGGESTION_ENDPOINT + "?keyword=" + keyword,
    );
    if (result.data) {
      const suggests = result.data.suggest;

      // Initialize an empty set to store unique options
      const uniqueOptions = new Set();

      Object.keys(suggests).forEach((key) => {
        suggests[key].forEach((obj) => {
          obj.options.forEach((option) => {
            uniqueOptions.add(JSON.stringify(option));
          });
        });
      });

      const allUniqueOptions = Array.from(uniqueOptions).map((option) =>
        JSON.parse(option),
      );

      res.status(201).json({ allUniqueOptions });
    } else {
      res.status(201).json({});
    }
  } catch (err) {
    console.log("ERRR-", err);
    res.status(500).json({ error: err });
  }
};

export default searchSuggestion;
