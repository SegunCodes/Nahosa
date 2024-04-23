const express = require("express")
const AuthController = require("../controllers/AuthController")
const AuthMiddleware = require("../middlewares/AuthMiddleware")
const UserController = require("../controllers/UserController")
const authRoutes = express.Router()

authRoutes.post("/searchUser", AuthMiddleware.protectedUser, AuthController.getUserFromNodeCache) 
authRoutes.post("/UserDetails", UserController.addAccountDetails)

module.exports = authRoutes