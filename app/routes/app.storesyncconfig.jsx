import { Card, Form, Page, Spinner } from "@shopify/polaris";
import {
  ShopifyGraphqlCall,
  postAPIRequest,
  shopifyAPICall,
} from "../helper/connection";
import { useActionData, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import { generateJson } from "../helper/generateproductjson";
import { authenticate } from "../shopify.server";
import {
  createConfig,
  getRecomdoConfig,
  updateConfig,
  updateConfigValue,
} from "../api/prisma.server";

const STORE_UPDATE_ENDPOINT = "api/recomdoai_api/store_code_update";

export const loader = async () => {
  return null;
};
export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  // const data = await shopifyAPICall("shop", request)
  const query = ` {
    markets(first: 250) {
      nodes {
        id
        name
        handle
        regions(first:250){
          nodes {
          name
          ... on MarketRegionCountry {
            code
          }
        }
      }
        currencySettings{
          baseCurrency{
            currencyCode
          }
        }
      }
    }
  }`;
  const response = await ShopifyGraphqlCall(session, query);

  var body = [];
  for (const market of response.data.markets.nodes) {
    body.push({
      name: market.name,
      code: market.handle,
      currency_code: market.currencySettings.baseCurrency.currencyCode,
      show_out_of_stock: "1",
      backorders: "1",
      root_category_id: "1",
      search_fields: [],
    });

    const shop_market = market.handle;
    const regions_nodes = market.regions.nodes;
    const regions = regions_nodes.map((node) => node.code);
    const commaSeparatedCodes = regions.join(",");

    // Update db with countries for each market
    const region_result = await getRecomdoConfig({
      path: "market_" + shop_market,
    });
    if (region_result == null) {
      await createConfig({
        path: "market_" + shop_market,
        value: commaSeparatedCodes,
        shop: "",
      });
    } else {
      await updateConfigValue({
        path: "market_" + shop_market,
        value: commaSeparatedCodes,
      });
    }
  }
  //END Update db with countries for each market
  console.log("BODY", body);
  const data = await postAPIRequest(
    STORE_UPDATE_ENDPOINT,
    JSON.stringify(body),
  );
  console.log("store update response", JSON.parse(data));

  return JSON.parse(data);
};

const StoreSyncConfig = () => {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = useSubmit();
  const actionData = useActionData();

  if (actionData) {
    console.log("actionData", actionData.data);
  }
  useEffect(() => {
    if (
      typeof actionData != "undefined" &&
      typeof actionData.data == "undefined"
    ) {
      setIsLoading(false);
      setError("Stores Synced Failed!");
      setMessage("");
    } else if (
      typeof actionData != "undefined" &&
      actionData.message == "Success"
    ) {
      setIsLoading(false);
      setError("");
      setMessage("Stores Successfully Synced!");
      setInfo(JSON.stringify(actionData.data));
    } else {
      setIsLoading(false);
      setError("");
      setMessage("");
    }
  }, [actionData]);
  const generateConfig = (e) => {
    setIsLoading(true);
    submit({}, { replace: true, method: "POST" });
  };
  // const generateConfig = () => submit({}, { replace: true, method: 'POST' })

  if (isLoading) {
    return <Spinner size="large" />;
  }
  return (
    <Page>
      <ui-title-bar title="Sync Stores"></ui-title-bar>
      <Card>
        <span>{error}</span>
        <span>{message}</span>
        <br></br>
        <span>{info}</span>
        <Form onSubmit={generateConfig} method="post">
          <button name="syncstore">Sync Stores</button>
        </Form>
      </Card>
    </Page>
  );
};

export default StoreSyncConfig;
