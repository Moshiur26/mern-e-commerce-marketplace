import mongoose from 'mongoose'

const ShopSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Name is required'
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: Buffer,
    contentType: String
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Shop', ShopSchema)
