const slugify = require("slugify")
const { getModel, getConnection } = require("../connection/database")
const { Promise } = require("bluebird")
const Post = getModel("Post")
const NewsPaper = getModel("NewsPaper")
module.exports.createNewPost = async (args = {}, file) => {
  const { title, label } = args
  if (!title || !label) throw new Error("Missing params")

  const newSlider = new Post({
    title,
    label,
    slug: slugify(title, {
      replacement: "-",
      remove: undefined,
      lower: true,
      strict: true,
      locale: "vi",
      trim: true,
    }),
    image: file[0].filename,
  })
  return await newSlider.save()
}

module.exports.getAllTopic = async () => {
  return await Post.find().lean()
}

// //////////////////

module.exports.createNewPaper = async (args = {}, file) => {
  const { title, content, topicId, tags } = args
  if (!title || !content || !topicId || !tags.length)
    throw new Error("missing params")
  const newNewsPaper = new NewsPaper({
    title,
    content,
    topic_id: topicId,
    tags,
    slug: slugify(title, {
      replacement: "-",
      remove: undefined,
      lower: true,
      strict: true,
      locale: "vi",
      trim: true,
    }),
    image: file[0].filename,
  })
  return await newNewsPaper.save()
}

module.exports.getNewsPaper = async (args = {}) => {
  const { limit, page, title } = args

  const skip = (page - 1) * limit

  return await NewsPaper.find()
    .populate({
      path: "topic_id",
      model: Post,
    })
    .limit(limit)
    .sort({ created: -1 })
    .skip(skip)
    .lean()
}

module.exports.getNewsPaperById = async (id) => {
  if (!id) throw new Error("Post not found")

  console.log(id)
  const post = await NewsPaper.findOne({ _id: id })
    .populate({
      path: "topic_id",
      model: Post,
    })
    .lean()
  if (!post) throw new Error("post not found")

  return post
}

module.exports.getNewsPaperGroupTopic = async () => {
  const topics = await Post.find().lean()

  const newPaper = await Promise.map(topics, async (topic) => {
    const posts = await NewsPaper.find({ topic_id: topic._id })
      .populate({
        path: "topic_id",
        model: Post,
      })
      .lean()
    return { title: topic.title, posts: posts }
  })

  return newPaper
}
