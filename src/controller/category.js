const { sendError, sendSuccess } = require("../constants/response")
const CategoryAction = require("../actions/CategoryAction")

module.exports.createCategory = (req, res) => {
  const { body } = req

  CategoryAction.createCategory(body)
    .then(sendSuccess(req, res))
    .catch(sendError(req, res))
}

module.exports.getCategory = (req, res) => {
  CategoryAction.getCategory()
    .then(sendSuccess(req, res))
    .catch(sendError(req, res))
}

module.exports.getCategoriesById = (req, res) => {
  const { id } = req.params
  CategoryAction.getCategoriesById(id)
    .then(sendSuccess(req, res))
    .catch(sendError(req, res))
}
