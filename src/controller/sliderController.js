const SliderAction = require("../actions/SliderAction")
const { sendSuccess, sendError } = require("../constants/response")
const Joi = require("joi")

module.exports.createSlider = (req, res) => {
  const { body, files } = req
  SliderAction.createSlider(body, files)
    .then(sendSuccess(req, res))
    .catch(sendError(req, res))
}

module.exports.getSlider = async (req, res) => {
  try {
    const data = req.query
    const validator = Joi.object({
      is_deleted: Joi.boolean().optional(),
      is_active: Joi.boolean().optional().default(true),
      title: Joi.string().trim(),
      limit: Joi.number().integer().max(100).default(10),
      page: Joi.number().integer().default(1),
    }).options({ stripUnknown: true })
    const validated = await validator.validateAsync(data)
    SliderAction.getSlider(validated)
      .then(sendSuccess(req, res))
      .catch(sendError(req, res))
  } catch (error) {
    sendError(req, res)(error)
  }
}

module.exports.deleteSlider = (req, res) => {
  const { id } = req.params
  SliderAction.deleteSlider(id)
    .then(sendSuccess(req, res))
    .catch(sendError(req, res))
}

module.exports.searchSlider = async (req, res) => {
  try {
    const query = req.query
    const validator = Joi.object({
      search: Joi.string().trim(),
      limit: Joi.number().integer().max(100).default(10),
      page: Joi.number().integer().default(1),
    }).options({ stripUnknown: true })
    const validated = await validator.validateAsync(query)
    SliderAction.searchSlider(validated)
      .then(sendSuccess(req, res))
      .catch(sendError(req, res))
  } catch (error) {
    sendError(req.res)(error)
  }
}

module.exports.getSliderById = (req, res) => {
  const { id } = req.params
  SliderAction.getSliderById(id)
    .then(sendSuccess(req, res))
    .catch(sendError(req, res))
}
