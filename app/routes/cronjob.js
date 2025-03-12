const remix = require("@remix-run/express");
const cron = require("node-cron");
const express = require("express");
const cors = require("cors");
const { getSession, getRecomdoConfig } = require("../api/prisma.server");
const { SyncAllProducts } = require("../cron/massproductsnyc");
const { UploadFileToS3 } = require("../helper/uploadtos3");
const { SyncAllCategories } = require("../cron/masscategorysync");
const { SyncAllAttributes } = require("../cron/massattributesync");
const { CronTime } = require("cron-time-generator");
const { autoFill } = require("../controllers/autoFillController");

import autoFillRoute from "./autoFillRoute";
import autoCompleteRoute from "./autoCompleteRoute";
import searchSuggestionRoute from "./searchSuggestionRoute";
import layedredNavigationRoute from "./layeredNavigationRoute";
import sortByOptionRoute from "./sortByOptionRoute";

const app = express();

var corsOptions = {
  origin: ["*"],
  credentials: true,
};

app.use(cors());
app.use(express.json());

const PRODUCTS_S3_KEY =
  "Recomdoai/product_json_export/full_products_update.json";
const PRODUCTS_FILE = "full_products_update.json";

const CATEGORY_S3_KEY = "Recomdoai/category_json_export/product_category.json";
const CATEGORY_FILE = "product_category.json";

const ATTRIBUTES_S3_KEY =
  "Recomdoai/attribute_json_export/product_attribute.json";
const ATTRIBUTES_FILE = "product_attribute.json";

async function startCron() {
  const cronExpression = await getConfig("prodsync_time");
  const cronExpressionCat = await getConfig("catsync_time");
  console.log(
    "Scheduled to run with expression:",
    cronExpression,
    cronExpressionCat,
  );
  const session = await getSession();
  var productCronTime = cronExpression ? cronExpression : "0 0 * * *";
  var categoryCronTime = cronExpressionCat ? cronExpressionCat : "0 0 * * *";
  cron.schedule(productCronTime, async function () {
    console.log("---------------------");
    var today = new Date();
    console.log("running product task at", today);
    await SyncAllProducts(session);
  });

  cron.schedule(categoryCronTime, async function () {
    console.log("---------------------");
    var today = new Date();
    console.log("running cat task at", today);
    await SyncAllCategories(session);
    await UploadFileToS3(CATEGORY_S3_KEY, CATEGORY_FILE);
  });
}

async function getConfig(path) {
  const productSheduleTime = await getRecomdoConfig({ path: path });
  if (productSheduleTime) {
    var time = productSheduleTime.value.split(":");
    time = CronTime.everyDayAt(time[0], time[1]);
    return time.toString();
  }
  return null;
}

startCron();

//Routes
app.get("/", (req, res) => {
  res.send("<html><body><h1>Recomdo SHopify API</h1></body></html>");
});
app.get("/cronupdate", (req, res) => {
  console.log("cron updated");
  startCron();
  res.send("cron updated");
});
app.use("/autofill", (req, res, next) => {
  console.log("autofill", req.body);
  autoFillRoute(req, res, next);
});

app.use("/autocomplete", (req, res, next) => {
  console.log("autocomp", req.body);
  autoCompleteRoute(req, res, next);
});

app.use("/searchsuggestions", (req, res, next) => {
  searchSuggestionRoute(req, res, next);
});

app.use("/layered_navigation_filter", (req, res, next) => {
  console.log("llllllll", req.query);
  layedredNavigationRoute(req, res, next);
});
app.use("/sort_by_options", (req, res, next) => {
  console.log("sort_by_options_REQ", req);
  sortByOptionRoute(req, res, next);
});

//END ROUTES

app.listen(3000, () => {
  console.log("Application listening on port 3000");
});
