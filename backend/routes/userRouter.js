import express from "express";
import { register, login, logout, getUser } from "../controllers/userControllers.js"; // Import the necessary functions
import { isAuthenticated } from "../middlewares/auth.js"; // Import the authorization middleware

const router = express.Router(); // Declare the router first

router.post("/register", register); // Corrected the function name
router.post("/login", login);
router.get("/logout", isAuthenticated,logout); // Ensure the middleware is correctly applied
router.get("/getuser",isAuthenticated, getUser);
export default router;
