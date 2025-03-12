const { createLogger, format, transports, config } = require("winston");
const { combine, timestamp, json } = format;

const fileUploadLogger = createLogger({
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    json(),
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/fileupload.log", level: "info" }),
  ],
});
const fileGenerateLogger = createLogger({
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    json(),
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/filegenerate.log", level: "info" }),
  ],
});

const deltaSyncLogger = createLogger({
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    json(),
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/deltasync.log", level: "info" }),
  ],
});

module.exports = {
  fileUploadLogger: fileUploadLogger,
  fileGenerateLogger: fileGenerateLogger,
  deltaSyncLogger: deltaSyncLogger,
};
