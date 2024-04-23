const express = require("express")
const dotenv = require("dotenv").config()
const cors = require("cors");
const authRoutes = require("./src/routes/AuthRoutes");
const userRoutes = require("./src/routes/UserRoutes")
const port = process.env.PORT || 4004

const app = express();
app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
    res.json({
        status: "success"
    })
})
app.use("/auth", authRoutes)
app.use("/user", userRoutes)

app.listen(port, () => console.log(`server started on port ${port}`))