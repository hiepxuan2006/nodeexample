const { getModel } = require("../connection/database")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const saltRounds = 10
const salt = bcrypt.genSaltSync(saltRounds)
const falcon = require("../helper/falcon")
const Account = getModel("Account")

module.exports.registerAccount = async (args = {}) => {
  const Account = getModel("Account")
  const { email, password } = args

  const account = await Account.findOne({ email }).lean()

  if (account) throw new Error("Email already exists")
  const hashPassword = await bcrypt.hashSync(password, salt)

  const newAccount = new Account({
    email,
    password: hashPassword,
  })

  const result = await newAccount.save()
  return { message: "Register success", email: result.email }
}

module.exports.login = async (args = {}) => {
  const { password, email } = args
  const _prefix = "refresh:token"

  const _getKeyRefreshToken = (email) => {
    return `${_prefix}:${email}`
  }

  const account = await Account.findOne({ email }).lean()
  if (!account) {
    throw new Error("Email or password fail")
  }
  const { email: emailDb, _id, is_admin, roles, password: passwordDb } = account
  const validatorPassword = await bcrypt.compareSync(password, passwordDb)
  if (!validatorPassword) throw new Error("Email or password fail")

  const token = await jwt.sign(
    { id: _id, email, role: roles, is_admin },
    process.env.SECRET_KEY_TOKEN,
    {
      expiresIn: "1d",
    }
  )
  const refreshToken = await jwt.sign(
    { id: _id, email, role: roles },
    process.env.SECRET_KEY_REFRESH_TOKEN
  )
  const keySaveCateRefreshToken = _getKeyRefreshToken(email)
  await falcon.set({
    key: keySaveCateRefreshToken,
    value: refreshToken,
  })
  return {
    email: emailDb,
    roles,
    is_admin,
    access_token: token,
  }
}

module.exports.settingRole = async (args = {}) => {
  const { accountId, role } = args
  const account = await Account.findOneAndUpdate(
    { _id: accountId },
    { $addToSet: { roles: "admin" } }
  ).lean()
  return accountId
}

module.exports.getAccount = async () => {
  const accounts = await Account.find().lean()
  return accounts
}

module.exports.authGoogle = async (args = {}) => {
  const { email, familyName, givenName, googleId, imgUrl, name } = args

  const renderAccessToken = async (id, email, roles, is_admin) => {
    return await jwt.sign(
      { id, email, role: roles, is_admin },
      process.env.SECRET_KEY_TOKEN,
      {
        expiresIn: "1d",
      }
    )
  }
  const isExitsAccount = await Account.findOne({
    id_google: googleId,
    auth_type: "google",
  })
    .select("-password")
    .lean()
  if (isExitsAccount) {
    const { _id, email, roles, is_admin } = isExitsAccount
    const access_token = await renderAccessToken(_id, email, roles, is_admin)

    return { profile: isExitsAccount, access_token, roles, is_admin }
  }

  const isExitAccountLocal = await Account.findOne({
    email: email,
    auth_type: "local",
  }).lean()
  if (isExitAccountLocal) {
    await Account.updateOne(
      { email: profile.emails[0].value },
      {
        $push: { auth_type: "google" },
        id_google: profile.id,
        name: profile.displayName,
        avatar: profile.photos[0].value,
      }
    )
    const { _id, email, roles, is_admin } = isExitAccountLocal
    const access_token = await renderAccessToken(_id, email, roles, is_admin)

    const profile = await Account.findOne({ email: profile.emails[0].value })
      .select("-password")
      .lean()
    return { profile, access_token, roles, is_admin }
  }
  const account = new Account({
    auth_type: "google",
    id_google: googleId,
    name: name,
    avatar: imgUrl,
    email,
  })
  const profile = await account.save()
  const { _id, email: emailRel, roles, is_admin } = account
  const access_token = await renderAccessToken(_id, emailRel, roles, is_admin)

  return { profile, access_token, roles, is_admin }
}

module.exports.secretAccount = async (args) => {
  const { id } = args
  return true
}
