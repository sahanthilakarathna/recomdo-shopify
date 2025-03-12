import { getRecomdoConfig } from "../api/prisma.server";

const { Upload } = require("@aws-sdk/lib-storage");
const { S3 } = require("@aws-sdk/client-s3");
const { fileUploadLogger } = require("./logger");
const fs = require("fs");

export const UploadFileToS3 = async (key, file) => {
  fileUploadLogger.info("FIle uplaod starts-" + file);
  const STORAGE_ACCESS_KEY = await getRecomdoConfig({ path: "ftp_access_key" });

  const STORAGE_SECRET = await getRecomdoConfig({
    path: "ftp_secret_access_key",
  });

  const STORAGE_NAME = await getRecomdoConfig({ path: "ftp_name" });

  const STORAGE_REGION = await getRecomdoConfig({ path: "ftp_region" });

  // Create a new instance of the S3 class
  const s3 = new S3({
    region: STORAGE_REGION.value,

    credentials: {
      accessKeyId: STORAGE_ACCESS_KEY.value,
      secretAccessKey: STORAGE_SECRET.value,
    },
  });
  // Set the parameters for the file you want to upload
  const params = {
    Bucket: STORAGE_NAME.value,
    Key: key,
    Body: fs.createReadStream("app/cron/" + file),
  };
  // Upload the file to S3
  var promise = new Upload({
    client: s3,
    params,
  }).done();
  promise.then(
    function (data) {
      console.log("File uploaded successfully. File location:", data.Location);
      fileUploadLogger.info(
        "File uploaded successfully. File location:" + data.Location,
      );
    },
    function (error) {
      console.log("Error uploading file:", error);
      fileUploadLogger.info("Error uploading file:" + error);
    },
  );
  fileUploadLogger.info("FIle uplaod Ends-" + file);
};
