import { GenerateAttributesJson } from "../helper/generateattributejson";
import fs from "fs";
const { fileGenerateLogger } = require("../helper/logger");

export const SyncAllAttributes = async (session, productOptions) => {
  try {
    const attributes = processOptions(JSON.parse(productOptions));
    console.log(JSON.stringify(attributes));
    const allAtrributesJson = await GenerateAttributesJson(attributes);
    fs.writeFile(
      "app/cron/product_attribute.json",
      allAtrributesJson,
      function (err) {
        if (err) {
          fileGenerateLogger.info("Attribute Json generate error:" + err);
          throw err;
        }
        fileGenerateLogger.info("Attribute Json Saved!");
        console.log("Attribute Json Saved!");
      },
    );
  } catch (err) {
    console.log("Error", err);
  }
};

function processOptions(data) {
  if (!Array.isArray(data)) {
    console.error("Input data is not an array.");
    return [];
  }

  // Step 1: Remove duplicates from the array
  const uniqueData = Array.from(new Set(data.map(JSON.stringify))).map(
    JSON.parse,
  );

  // Step 2: Merge objects with the same "name"
  const mergedData = uniqueData.reduce((acc, curr) => {
    // Check if the current object has 'options' property and it's an array with at least one item
    if (
      !curr.options ||
      !Array.isArray(curr.options) ||
      curr.options.length === 0
    ) {
      console.error("Invalid object format found:", curr);
      return acc;
    }

    for (const option of curr.options) {
      const existingOption = acc.find((opt) => opt.name === option.name);
      if (existingOption) {
        existingOption.values.push(...option.values);
      } else {
        acc.push({ name: option.name, values: option.values });
      }
    }

    return acc;
  }, []);

  // Step 3: Remove duplicates within "values" arrays
  const finalData = mergedData.map((option) => ({
    options: [{ name: option.name, values: [...new Set(option.values)] }],
  }));

  return finalData;
}
