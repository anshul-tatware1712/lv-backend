import express from "express";
const router = express.Router();
import { getUser, updateUser, logout } from "../Controller/userController.js";

router.get("/user", getUser);
router.post("/user/update", updateUser);
router.post("/user/logout", logout);

export default router;
