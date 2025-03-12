import { Card, Form, Page } from "@shopify/polaris";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { generateJson } from "../helper/generateproductjson";
import { postAPIRequest } from "../helper/connection";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const { shop, accessToken } = session;

  const webhooks = await admin.rest.resources.Webhook.all({
    session: session,
  });
  console.log("ACCESS TOKEN- ", accessToken, webhooks.data);
  return webhooks.data;
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const webhook = new admin.rest.resources.Webhook({ session: session });
  var prodbody = generateJson(null);
  const data = await postAPIRequest(STORE_UPDATE_ENDPOINT, prodbody);
  console.log("shopify data", JSON.parse(data));

  return JSON.parse(data);
};

const Automation = () => {
  const loadData = useLoaderData();
  // console.log('loaddata',loadData)
  const submit = useSubmit();
  const actionData = useActionData();

  if (actionData) {
    console.log("actionData", actionData);
  }

  const generateConfig = (e) => {
    submit({}, { replace: true, method: "POST" });
  };
  return (
    <Page>
      <Card>
        <Form onSubmit={generateConfig} method="post">
          <button name="syncstore">Sync Stores</button>
        </Form>
        {loadData.map((item, index) => {
          return (
            <ul>
              <li key={"topic"}>{item.topic}</li>
              <li key={"api_version"}>{item.api_version}</li>
              <li key={"address"}>{item.address}</li>
              <li key={"created_at"}>{item.created_at}</li>
            </ul>
          );
        })}
      </Card>
    </Page>
  );
};

export default Automation;
