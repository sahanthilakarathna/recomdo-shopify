import express from "express";
import SortByOption from "../controllers/sortByOptionController";

const router = express.Router();

router.get("/", (req, res) => {
  console.log("Sort BY ");
  SortByOption(req, res);
});

export default router;
