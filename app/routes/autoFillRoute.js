import express from "express";
import autoFill from "../controllers/autoFillController";

const router = express.Router();

router.post("/", (req, res) => {
  autoFill(req, res);
});

export default router;
