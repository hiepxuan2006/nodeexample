const express = require("express")
const router = express.Router()

router.get("/ping", (req, res) => {
  res.send("pingpong")
})

// router.get("/slider/get-sliders", sliderCtrl.getSlider)
module.exports = router
