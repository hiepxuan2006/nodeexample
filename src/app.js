const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const passport = require("passport")
const session = require("express-session")
var cors = require("cors")
require("dotenv").config()
const app = express()
app.use(cors())

const PORT = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(passport.initialize())
app.use(passport.session())

app.use(express.static(path.join(__dirname, "/../", "public")))
setTimeout(async () => {
  await require("./connection/db").connectDB()
  await require("./connection/redisConnection").connectRedis()
  // app.use("/api/", require("./app.routes"))
}, 0)

app.use(require("./app.routes"))
app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
