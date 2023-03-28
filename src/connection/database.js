
const {createMongoConnection} = require('../store-schemas/createMongoConnection')
const createStore = require('../store-schemas')

const MONGODB_URI = 'mongodb+srv://hiepxuan98:Hiepxuan2006@cluster0.dx9k1v2.mongodb.net/?retryWrites=true&w=majority'
console.log('MONGODB_URI:', MONGODB_URI)

const originConnection = createMongoConnection(MONGODB_URI)

module.exports = createStore(originConnection)
