import { getAllMarketsRegions, getRecomdoConfig } from "../api/prisma.server";
import { ShopifyGraphqlCall } from "./connection";

export const getMarketByCountryCode = async (code, session) => {
  // const marketquery = ` {
  //   markets(first: 250) {
  //     nodes {
  //       id
  //       handle
  //       regions(first:250){
  //         nodes {
  //         name
  //         ... on MarketRegionCountry {
  //           code
  //         }
  //       }
  //     }
  //     }
  //   }
  // }`;
  // const res = await ShopifyGraphqlCall(session, marketquery);
  // const markets = res.data.markets.nodes;
  // for (const market of markets) {
  //   const regions = market.regions.nodes;
  //   for (const region of regions) {
  //     if (region.code == code) {
  //       return market.handle;
  //     }
  //   }
  // }

  const markets = await getAllMarketsRegions();
  for (const market of markets) {
    const regions = market.value.split(",");
    if (regions.includes(code)) {
      return market.path.replace("market_", "");
    }
  }
};
