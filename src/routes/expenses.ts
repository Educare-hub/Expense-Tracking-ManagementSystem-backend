import express from "express";
import auth from "../middleware/authMiddleware";
import * as controller from "../controllers/expenseController";

const router = express.Router();

router.post("/", auth.authMiddleware, controller.createExpense);
router.get("/", auth.authMiddleware, controller.listExpenses);
router.get("/:id", auth.authMiddleware, controller.getExpense);
router.put("/:id", auth.authMiddleware, controller.updateExpense);
router.delete("/:id", auth.authMiddleware, controller.deleteExpense);

export default router;
