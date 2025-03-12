import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { Button, Card, Layout, Page, TextField } from "@shopify/polaris";
import { json } from "@remix-run/node";
import { useEffect, useState } from "react";
import {
  createConfig,
  deleteConfig,
  getAllRecomdoConfig,
  getRecomdoConfig,
  updateConfig,
  updateConfigValue,
} from "../api/prisma.server";
import prisma from "../db.server";
import { getAPIRequest, getAuthToken } from "../helper/connection";
const URL_CONNECT_BEGIN = "search/recomdoai_api/check_auth";

export const loader = async () => {
  var data = await getAllRecomdoConfig();
  return data;
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const _action = formData.get("_action");

  const base_url = formData.get("base_url");
  const client_key = formData.get("client_key");
  const access_key = formData.get("access_key");
  const access_secret = formData.get("access_secret");

  const base_url_id = formData.get("base_url_id");
  const client_key_id = formData.get("client_key_id");
  const access_key_id = formData.get("access_key_id");
  const access_secret_id = formData.get("access_secret_id");
  const is_connection_authed_id = formData.get("is_connection_authed_id");
  const access_token_id = formData.get("access_token_id");
  console.log("_action", _action);
  const fields = [];
  fields.push(
    { path: "gen_base_url", value: base_url, config_id: base_url_id },
    { path: "gen_client_key", value: client_key, config_id: client_key_id },
    { path: "gen_access_key", value: access_key, config_id: access_key_id },
    {
      path: "gen_access_secret",
      value: access_secret,
      config_id: access_secret_id,
    },
    { path: "gen_access_token", value: "", config_id: "" },
  );

  try {
    if (_action === "SUBMIT") {
      fields.map(async function (element) {
        await createConfig({
          path: element.path,
          value: element.value,
          shop: "",
        });
      });
      return true;
    } else if (_action === "UPDATE") {
      fields.map(async function (element) {
        if (element.path != "gen_access_token") {
          await updateConfigValue({
            path: element.path,
            value: element.value,
          });
        }
      });
      return true;
    } else if (_action === "CONNECT") {
      var authconnect = await getAPIRequest(URL_CONNECT_BEGIN);
      console.log("authconnect");
      if (
        typeof authconnect.message != "undefined" &&
        authconnect.message == "Internal Server Error"
      ) {
        authconnect = await getAPIRequest(URL_CONNECT_BEGIN);
      }
      const auth = await getRecomdoConfig({
        path: "is_connection_authed",
      });
      console.log("AUUUUUTH", auth);
      if (!auth && typeof authconnect.data !== "undefined") {
        console.log("000000");
        await createConfig({
          path: "is_connection_authed",
          value: "1",
          shop: "",
        });
        return "connected";
      } else if (typeof authconnect.data == "undefined") {
        console.log("11111");
        return false;
      } else if (auth.value === "1") {
        console.log("22222");
        return "connected";
      } else if (auth.value === "0") {
        console.log("3333333");
        await updateConfigValue({ path: "is_connection_authed", value: "1" });
        return "connected";
      }
    } else if (_action === "DISCONNECT") {
      console.log("authDISconnect");
      await deleteConfig({
        path: "is_connection_authed",
      });
      return "disconnected";
    }
  } catch (err) {
    console.log("GEN CON ERR", err);
    return err;
  }
  return null;
};

const Config = () => {
  const [base_url, setBaseUrl] = useState("");
  const [base_url_id, setBaseUrlId] = useState("");

  const [client_key, setClientKey] = useState("");
  const [client_key_id, setClientKeyId] = useState("");

  const [access_key, setAccessKey] = useState("");
  const [access_key_id, setAccessKeyId] = useState("");

  const [access_secret, setAccessSecret] = useState("");
  const [access_secret_id, setAccessSecretId] = useState("");

  const [isConnectionAuthed, setIsConnectionAuthed] = useState("0");
  const [isConnectionAuthedId, setIsConnectionAuthedId] = useState("");

  const [access_token_id, setAccessTokenId] = useState("");

  const [change, setChnaged] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const formData = useLoaderData();

  useEffect(() => {
    console.log("formDataGENE", formData);
    setChnaged(false);
    if (formData.length) {
      // const hasConnectionObj = formData.some(function (o) {
      //   return o["path"] == "is_connection_authed";
      // });
      // console.log("hasConnectionObj", hasConnectionObj);
      // if (hasConnectionObj) {
      //   setIsConnectionAuthed("1");
      // } else {
      //   setIsConnectionAuthed("0");
      // }
      formData.map((item) => {
        if (item.path == "gen_base_url") {
          setBaseUrl(item.value);
          setBaseUrlId(item.config_id);
        } else if (item.path == "gen_client_key") {
          setClientKey(item.value);
          setClientKeyId(item.config_id);
        } else if (item.path == "gen_access_key") {
          setAccessKey(item.value);
          setAccessKeyId(item.config_id);
        } else if (item.path == "gen_access_secret") {
          setAccessSecret(item.value);
          setAccessSecretId(item.config_id);
        } else if (item.path == "is_connection_authed") {
          setIsConnectionAuthed(item.value);
          setIsConnectionAuthedId(item.config_id);
        } else if (item.path == "gen_access_token") {
          setAccessTokenId(item.config_id);
        }
      });
    }
  }, [formData]);

  const submit = useSubmit();
  const actionData = useActionData();

  useEffect(() => {
    console.log("actionDataGENE", actionData);
    setChnaged(false);
    if (typeof actionData != "undefined" && !actionData) {
      setError("Connection Failed!");
      setIsConnectionAuthed("0");
      setMessage("");
    } else if (actionData == "connected") {
      console.log("msg con");
      setIsConnectionAuthed("1");
      setError("");
      setMessage("Connected Successfully!");
    } else if (actionData == "disconnected") {
      console.log("msg discon");
      setIsConnectionAuthed("0");
      setMessage("Disonnected!");
    } else if (typeof actionData != "undefined" && actionData) {
      setError("");
      setMessage("Successfully Updated!");
    } else {
      setError("");
      setMessage("");
    }
  }, [actionData, change]);

  const generateConfig = () => {
    // Your custom function logic here
    setChnaged(true);

    return submit({}, { replace: true, method: "POST" });
  };
  console.log("CONNEC", isConnectionAuthed);
  const connectBtn =
    isConnectionAuthed === "1" && formData.length ? (
      <button name="_action" value="DISCONNECT" type="submit">
        Disconnect
      </button>
    ) : (
      <button name="_action" value="CONNECT" type="submit">
        Connect
      </button>
    );

  const saveBtn =
    formData && formData.length ? (
      <button variant="primary" name="_action" value="UPDATE" type="submit">
        Update Config
      </button>
    ) : (
      <button variant="primary" name="_action" value="SUBMIT" type="submit">
        Save Config
      </button>
    );
  return (
    <Page>
      <ui-title-bar title="General Configurations"></ui-title-bar>
      <Card>
        <span>{error}</span>
        <span>{message}</span>
        <Form onSubmit={generateConfig} method="post">
          <TextField
            id="base_url"
            name="base_url"
            label="Base Url"
            autoComplete="off"
            value={base_url}
            onChange={(value) => setBaseUrl(value)}
          />
          <input
            id="base_url_id"
            name="base_url_id"
            type="hidden"
            value={base_url_id}
          />

          <TextField
            id="client_key"
            name="client_key"
            label="Client Key"
            autoComplete="off"
            value={client_key}
            onChange={(value) => setClientKey(value)}
          />
          <input
            id="client_key_id"
            name="client_key_id"
            type="hidden"
            value={client_key_id}
          />

          <TextField
            type="password"
            id="access_key"
            name="access_key"
            label="Access Key"
            autoComplete="off"
            value={access_key}
            onChange={(value) => setAccessKey(value)}
          />
          <input
            id="access_key_id"
            name="access_key_id"
            type="hidden"
            value={access_key_id}
          />

          <TextField
            type="password"
            id="access_secret"
            name="access_secret"
            label="Access Secret"
            autoComplete="off"
            value={access_secret}
            onChange={(value) => setAccessSecret(value)}
          />
          <input
            id="access_secret_id"
            name="access_secret_id"
            type="hidden"
            value={access_secret_id}
          />
          <input
            id="is_connection_authed_id"
            name="is_connection_authed_id"
            type="hidden"
            value={isConnectionAuthedId}
          />

          <input
            id="access_token_id"
            name="access_token_id"
            type="hidden"
            value={access_token_id}
          />

          {saveBtn}
          {connectBtn}
        </Form>
      </Card>
    </Page>
  );
};

export default Config;
