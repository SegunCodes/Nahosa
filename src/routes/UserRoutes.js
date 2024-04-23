const express = require("express")
const AuthController = require("../controllers/AuthController")
const AuthMiddleware = require("../middlewares/AuthMiddleware")
const UserController = require("../controllers/UserController")
const userRoutes = express.Router()

userRoutes.post("/searchUser", AuthMiddleware.protectedUser, AuthController.getUserFromNodeCache) 
userRoutes.post("/UserDetails", UserController.addAccountDetails)

module.exports = userRoutes