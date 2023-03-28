const OrderAction = require("../actions/OrderAction")
const { sendError, sendSuccess } = require("../constants/response")
module.exports.createOrder = (req, res) => {
  const { body } = req
  OrderAction.createOrder(body)
    .then(sendSuccess(req, res))
    .catch(sendError(req, res))
}

module.exports.getOrderById = (req, res) => {
  const { id } = req.query

  OrderAction.getOrderById(id)
    .then(sendSuccess(req, res))
    .catch(sendError(req, res))
}

module.exports.getOrderByCodeAndPhone = (req, res) => {
  const query = req.query
  OrderAction.getOrderByCodeAndPhone(query)
    .then(sendSuccess(req, res))
    .catch(sendError(req, res))
}

module.exports.changeStatusOrder = (req, res) => {
  const { query } = req
  OrderAction.changeStatusOrder(query)
    .then(sendSuccess(req, res))
    .catch(sendError(req, res))
}
