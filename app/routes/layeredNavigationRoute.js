import express from "express";
import layeredNavigation from "../controllers/layeredNavigationController";

const router = express.Router();

router.get("/", (req, res) => {
  console.log("Layered Nav");
  layeredNavigation(req, res);
});

export default router;
