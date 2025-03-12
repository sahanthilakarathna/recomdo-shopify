import express from "express";
import autoComplete from "../controllers/autoCompleteController";

const router = express.Router();

router.post("/", (req, res) => {
  autoComplete(req, res);
});

export default router;
