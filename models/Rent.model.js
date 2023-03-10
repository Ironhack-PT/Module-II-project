const mongoose = require("mongoose")

const rentSchema = new mongoose.Schema({
	renter: {
		type: mongoose.Types.ObjectId,
		ref: "User",
		required: true,
	},
	tenant: {
		type: mongoose.Types.ObjectId,
		ref: "User",
		required: true,
	},
	game: {
		type: mongoose.Types.ObjectId,
		ref: "Game",
		required: true,
	},
	start: {
		type: Date,
		default: Date.now,
		required: true,
	},
	end: {
		type: Date,
		default: Date.now,
		required: [true, "Must have end date"],
	},
	status: {
		type: String,
		enum: ["Requested", "Reserved", "Free", "Rented"],
		default: "Requested",
	}
})

rentSchema.virtual('favorites', {
  ref: 'Favorite',
  foreignField: 'rent',
  localField: '_id',
  justOne: false
})


const Rent = mongoose.model("Rent", rentSchema)

module.exports = Rent
