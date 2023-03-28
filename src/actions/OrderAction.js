const { getModel, getConnection } = require("../connection/database")
const Promise = require("bluebird")
const Order = getModel("order")
const OrderItem = getModel("OrderItem")
const Product = getModel("Product")
const ProductVariant = getModel("ProductVariant")
module.exports.createOrder = async (args = {}) => {
  const session = await getConnection().startSession()
  session.startTransaction()

  try {
    const {
      name,
      address,
      product,
      note,
      deliveryType,
      phone,
      totalPrice,
      customer_id,
      pay,
    } = args

    const shipping_address = Object.values(address)
      .reverse()
      .map((item) => item)
      .join(",")

    const newOrder = new Order({
      customer_id,
      order_at: Date.now(),
      delivery_type: deliveryType,
      shipping_address,
      order_code: "HX" + Date.now(),
      name,
      phone_number: phone,
      note,
      price_total: totalPrice,
      payment_type: pay,
    })

    const newOrderItems = await Promise.map(
      product,
      async (item) => {
        const newOrderItem = new OrderItem({
          order_id: newOrder._id,
          product_id: item._id,
          product_variant_id: item.variants._id,
          discount: item.variants.sale,
          quantity: item.quantity,
          price: item.variants.retail_price,
        })
        return await newOrderItem.save()
      },
      {
        concurrency: 1,
      }
    )

    const newOrderItemsId = newOrderItems.map((item) => item._id)
    const order = Object.assign(newOrder, { order_item: newOrderItemsId })
    await order.save()
    await session.commitTransaction()
    session.endSession()

    return order
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw new Error(error)
  } finally {
    session.endSession()
  }
}

module.exports.getOrderById = async (id) => {
  if (!id) throw new Error("Params missing")
  const order = await Order.findOne({ _id: id })
    .populate({
      path: "order_item",
      populate: {
        path: "product_variant_id",
        model: ProductVariant,
      },
    })

    .lean()
  if (!order) throw new Error("Order not found")
  return order
}

module.exports.getOrderByCodeAndPhone = async (args = {}) => {
  const { orderCode, phone } = args
  const order = await Order.findOne({ order_code: orderCode, phone }).populate({
    path: "order_item",
    populate: {
      path: "product_variant_id",
      model: ProductVariant,
    },
  }).lean

  if (!order) throw new Error("order not found")
}

module.exports.changeStatusOrder = async (args) => {
  const { id, status } = args

  const order = await Order.findOne({ _id: id }).lean()

  if (!order) throw new Error("Order not found")
  let updateData
  if (status === "confirmed") {
    updateData = { status, confirmed_at: Date.now() }
  }
  if (status === "cancelled") {
    updateData = { status, cancelled_at: Date.now() }
  }
  if (status === "shipping") {
    updateData = { status, shipping_at: Date.now() }
  }
  if (status === "delivered") {
    updateData = { status, delivered_at: Date.now() }
  }

  if (!updateData) throw new Error("Fail")

  await Order.updateOne({ _id: id }, { $set: updateData }).lean()

  return true
}
