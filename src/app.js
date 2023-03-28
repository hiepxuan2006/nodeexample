const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const passport = require("passport")
const session = require("express-session")
var cors = require("cors")
const port = 3000
app.use(cors())
// body-parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(require("./app.routes"))
app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
