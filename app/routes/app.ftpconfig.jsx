import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import { Card, Layout, Page, TextField } from "@shopify/polaris";
import { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";
import {
  createConfig,
  getAllFtpConfig,
  updateConfigValue,
} from "../api/prisma.server";

export const loader = async () => {
  try {
    var data = await getAllFtpConfig();

    return data;
  } catch (err) {}

  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const ftp_name = formData.get("ftp_name");
  const ftp_access_key = formData.get("ftp_access_key");
  const ftp_secret_access_key = formData.get("ftp_secret_access_key");
  const ftp_region = formData.get("ftp_region");

  const ftp_name_id = formData.get("ftp_name_id");
  const ftp_access_key_id = formData.get("ftp_access_key_id");
  const ftp_secret_access_key_id = formData.get("ftp_secret_access_key_id");
  const ftp_region_id = formData.get("ftp_region_id");

  const _action = formData.get("_action");

  const fields = [];
  fields.push(
    { path: "ftp_name", value: ftp_name, config_id: ftp_name_id },
    {
      path: "ftp_access_key",
      value: ftp_access_key,
      config_id: ftp_access_key_id,
    },
    {
      path: "ftp_secret_access_key",
      value: ftp_secret_access_key,
      config_id: ftp_secret_access_key_id,
    },
    { path: "ftp_region", value: ftp_region, config_id: ftp_region_id },
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
    }
  } catch (err) {
    return false;
  }
  return null;
};

const FtpConfig = () => {
  const [ftp_name, setFtpName] = useState("");
  const [ftp_name_id, setFtpNameId] = useState("");

  const [ftp_access_key, setFtpAccessKey] = useState("");
  const [ftp_access_key_id, setFtpAccessKeyId] = useState("");

  const [ftp_secret_access_key, setFtpSecretAccessKey] = useState("");
  const [ftp_secret_access_key_id, setFtpSecretAccessKeyId] = useState("");

  const [ftp_region, setFtpRegion] = useState("");
  const [ftp_region_id, setFtpRegionId] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const formData = useLoaderData();
  useEffect(() => {
    if (formData.length) {
      formData.map((item) => {
        if (item.path == "ftp_name") {
          setFtpName(item.value);
          setFtpNameId(item.config_id);
        } else if (item.path == "ftp_access_key") {
          setFtpAccessKey(item.value);
          setFtpAccessKeyId(item.config_id);
        } else if (item.path == "ftp_secret_access_key") {
          setFtpSecretAccessKey(item.value);
          setFtpSecretAccessKeyId(item.config_id);
        } else if (item.path == "ftp_region") {
          setFtpRegion(item.value);
          setFtpRegionId(item.config_id);
        }
      });
    }
  }, [formData]);

  const submit = useSubmit();
  const actionData = useActionData();
  console.log("actionData", actionData);
  useEffect(() => {
    if (typeof actionData != "undefined" && actionData) {
      setError("");
      setMessage("Successfully Updated!");
    } else {
      setError("");
      setMessage("");
    }
  }, [actionData]);
  const generateConfig = () => submit({}, { replace: true, method: "POST" });

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
      <ui-title-bar title="FTP Configurations"></ui-title-bar>
      <Card>
        <span>{error}</span>
        <span>{message}</span>
        <Form onSubmit={generateConfig} method="post">
          <TextField
            id="ftp_name"
            name="ftp_name"
            label="FTP Name"
            autoComplete="off"
            value={ftp_name}
            onChange={(value) => setFtpName(value)}
          />
          <input
            id="ftp_name_id"
            name="ftp_name_id"
            type="hidden"
            value={ftp_name_id}
          />

          <TextField
            id="ftp_access_key"
            name="ftp_access_key"
            label="FTP Access Key"
            autoComplete="off"
            value={ftp_access_key}
            onChange={(value) => setFtpAccessKey(value)}
          />
          <input
            id="ftp_access_key_id"
            name="ftp_access_key_id"
            type="hidden"
            value={ftp_access_key_id}
          />

          <TextField
            id="ftp_secret_access_key"
            name="ftp_secret_access_key"
            label="FTP Secret Access Key"
            autoComplete="off"
            value={ftp_secret_access_key}
            onChange={(value) => setFtpSecretAccessKey(value)}
          />
          <input
            id="ftp_secret_access_key_id"
            name="ftp_secret_access_key_id"
            type="hidden"
            value={ftp_secret_access_key_id}
          />

          <TextField
            id="ftp_region"
            name="ftp_region"
            label="FTP Region"
            autoComplete="off"
            value={ftp_region}
            onChange={(value) => setFtpRegion(value)}
          />
          <input
            id="ftp_region_id"
            name="ftp_region_id"
            type="hidden"
            value={ftp_region_id}
          />
          {saveBtn}
        </Form>
      </Card>
    </Page>
  );
};
export default FtpConfig;
