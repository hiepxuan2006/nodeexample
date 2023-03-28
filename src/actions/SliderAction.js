const { rest } = require("lodash")
const { getModel } = require("../connection/database")

const Slider = getModel("Slider")

module.exports.createSlider = async (args = {}, file) => {
  const { title, description, link } = args
  if (!title || !description) throw new Error("Missing params")

  const newSlider = new Slider({
    title,
    description,
    image: file[0].filename,
  })

  return await newSlider.save()
}

const builtQuery = (args = {}) => {
  const { title, is_active, is_deleted } = args
  const query = {}
  if (title) {
    query.title = {
      $regex: new RegExp(title, "gi"),
    }
  }
  if (is_deleted) {
    query.is_deleted = is_deleted
    query.is_active = false
  } else {
    query.is_active = is_active
  }
  return query
}

module.exports.getSlider = async (args = {}) => {
  const { page, limit, ...rest } = args
  const skip = (page - 1) * limit
  const query = builtQuery(rest)
  console.log(query)
  const _getSliders = Slider.find(query)
    .limit(limit)
    .skip(skip)
    .sort({ _id: -1 })
    .lean()
  const _getTotal = Slider.countDocuments(query)

  const [sliders, total] = await Promise.all([_getSliders, _getTotal])

  const pages = Math.ceil(total / limit) || 1

  return { sliders, total, pages, page, limit }
}

module.exports.deleteSlider = async (id) => {
  const slider = await Slider.findOne({ _id: id }).lean()

  if (!slider) throw new Error("Slider not found")

  const result = await Slider.updateOne(
    { _id: id },
    {
      $set: { is_deleted: true, is_active: false },
    }
  )
  return result
}

module.exports.searchSlider = async (args = {}) => {
  const { limit, page, search } = args
  const skip = (page - 1) * limit
  const query = {}

  if (search) {
    query.title = {
      $regex: new RegExp(search, "gi"),
    }
  }

  const sliders = await Slider.find(query).skip(skip).limit(limit).lean()
  return sliders
}

module.exports.getSliderById = async (id) => {
  if (!id) throw new Error("Id not exits")

  return await Slider.findOne({ _id: id }).lean()
}
