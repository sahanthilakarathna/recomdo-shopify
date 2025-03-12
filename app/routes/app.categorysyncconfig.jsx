import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { Card, Form, Layout, Page, Select, Spinner } from "@shopify/polaris";
import { useCallback, useEffect, useRef, useState } from "react";
import { authenticate } from "../shopify.server";
import {
  createConfig,
  getAllCatSyncConfig,
  updateConfigValue,
} from "../api/prisma.server";

export const loader = async () => {
  try {
    var data = await getAllCatSyncConfig();
    console.log("loader data", data);
    return data;
  } catch (err) {}
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const time = formData.get("time");

  const time_id = formData.get("time_id");

  const _action = formData.get("_action");

  const fields = [];
  fields.push({ path: "catsync_time", value: time, config_id: time_id });
  try {
    if (_action === "SUBMIT") {
      fields.map(async function (element) {
        await createConfig({
          path: element.path,
          value: element.value,
          shop: "",
        });
      });
      await CronUpdate();
      return new Date();
    } else if (_action === "UPDATE") {
      fields.map(async function (element) {
        await updateConfigValue({
          path: element.path,
          value: element.value,
        });
      });
      await CronUpdate();
      return new Date();
    }
  } catch (err) {
    return false;
  }

  return null;
};
const CronUpdate = async () => {
  const cron = await fetch("http://shopifybackend.ai/cronupdate", {
    method: "GET",
    headers: "",
    redirect: "follow",
  });
};

const CategorySyncConfig = () => {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [time, setTime] = useState("");
  const [timeId, setTimeId] = useState("");

  const [action, setAction] = useState("");

  const formRef = useRef(null); //Add a form ref.

  console.log(time);
  // const formData = new FormData()

  const handleTimeChange = (e) => {
    setTime(e.target.value);
  };

  const submit = useSubmit();
  const actionData = useActionData();
  console.log("actionData", actionData);
  useEffect(() => {
    if (typeof actionData != "undefined" && actionData) {
      setIsLoading(false);
      setMessage("Successfully Saved!");
      setError("");
    } else if (typeof actionData != "undefined" && !actionData) {
      setIsLoading(false);
      setMessage("");
      setError("Saving Failed!");
    } else {
      setIsLoading(false);
    }
  }, [actionData]);

  const handleSubmit = (event) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.set("time", time);
    formData.set("time_id", timeId);
    formData.set("_action", action);

    submit(
      formData, //Notice this change
      { replace: true, method: "POST" },
    );
  };

  const loaderData = useLoaderData();
  console.log("catsyncloaderdata", loaderData);

  useEffect(() => {
    if (loaderData.length) {
      setAction("UPDATE");
      loaderData.map((item) => {
        if (item.path == "catsync_time") {
          setTime(item.value);
          setTimeId(item.config_id);
        }
      });
    } else {
      setAction("SUBMIT");
    }
  }, [loaderData]);
  const saveBtn =
    loaderData && loaderData.length ? (
      <button variant="primary" name="_action" value="UPDATE" type="submit">
        Update Config
      </button>
    ) : (
      <button variant="primary" name="_action" value="SUBMIT" type="submit">
        Save Config
      </button>
    );
  console.log("isLoading", isLoading);
  if (isLoading) {
    return <Spinner size="large" />;
  }
  return (
    <Page>
      <ui-title-bar title="Category Sync Configurations"></ui-title-bar>
      <Card>
        <span>{error}</span>
        <span>{message}</span>
        <Form onSubmit={handleSubmit} method="post">
          <label for="time">Full category Sync Time</label>
          <input
            id="time"
            name="time"
            type="time"
            onChange={handleTimeChange}
            value={time}
          />
          <input id="time_id" name="time_id" type="hidden" value={timeId} />

          {saveBtn}
        </Form>
      </Card>
    </Page>
  );
};

export default CategorySyncConfig;
