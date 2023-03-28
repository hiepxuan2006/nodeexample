const mongoose = require('mongoose')
module.exports.connectDB = async () => {
	try {
		await mongoose.connect(
			`mongodb+srv://hiepxuan98:Hiepxuan2006@cluster0.dx9k1v2.mongodb.net/?retryWrites=true&w=majority`,
			{
				useNewUrlParser: true,
				useUnifiedTopology: true
			}
		)

		console.log('MongoDB connected')
	} catch (error) {
		console.log(error.message)
		process.exit(1)
	}
}