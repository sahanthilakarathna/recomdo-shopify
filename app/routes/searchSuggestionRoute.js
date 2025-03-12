import express from "express";
import searchSuggestion from "../controllers/searchSuggestionController";

const router = express.Router();

router.post("/", (req, res) => {
  console.log("HOTE RRRRR");
  console.log(req.body);
  searchSuggestion(req, res);
});

export default router;
