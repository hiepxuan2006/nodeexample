const slugify = require("slugify")

const { getModel } = require("../connection/database")

const Category = getModel("Category")
module.exports.createCategory = async (args = {}) => {
  const { name, parentId } = args

  const newCategory = new Category({
    name,
    parent_id: parentId ? parentId : "0",
    slug: slugify(name, {
      replacement: "-",
      remove: undefined,
      lower: true,
      strict: true,
      locale: "vi",
      trim: true,
    }),
    label: name,
  })

  const result = await newCategory.save()

  return { message: "success", result }
}

module.exports.getCategory = async () => {
  const categories = await Category.find().lean()

  const sets = (items, id = "0", link = "parent_id") =>
    items
      .filter((item) => item[link] === id)
      .map((item) => ({ ...item, children: sets(items, item._id.toString()) }))

  return sets(categories)
}

module.exports.getCategoriesById = async (category_id) => {
  const category = await Category.findOne({ _id: category_id }).lean()
  const categories = await Category.find().lean()
  console.log(category_id)
  if (!category) throw new Error("Category not found")
  const sets = (items, id, link = "parent_id") =>
    items
      .filter((item) => item[link] === id)
      .map((item) => ({ ...item, children: sets(items, item._id.toString()) }))

  return sets(categories, category._id.toString())
}
