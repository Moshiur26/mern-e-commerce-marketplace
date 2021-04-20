import Shop from '../models/shop.model';
import defaultImage from './../../client/assets/images/default.jpg';
import extend from 'lodash/extend'
import formidable from 'formidable'
import fs from 'fs'
import dbErrorHandler from './../helpers/dbErrorHandler'


const shopByID = async (req, res, next, id) => {
  try {
    let shop = await Shop.findById(id).populate('owner', '_id name').exec()
    if (!shop) {
      console.log("Shop not found");
      return res.status(400).json({
        error: 'Shop not found'
      })
    }
    req.shop = shop
    // console.log("shopById-image: ",shop.image);
    next()
  } catch (err) {
    return res.status(400).json({
      error: "Could not retrieve shop"
    })
  }
}

const create = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          error: "Image could not be uploaded"
        })
      }
      let shop = new Shop(fields)
      shop.owner= req.profile
      if(files.image){
        shop.image.data = fs.readFileSync(files.image.path)
        shop.image.contentType = files.image.type
      }
      try {
        let result = await shop.save()
        res.json(result)
      }catch (err){
        return res.status(400).json({
          error: dbErrorHandler.getErrorMessage(err)
        })
      }
    })
  }

const update = (req, res) => {
  let form = new formidable.IncomingForm()
  form.keepExtensions = true

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded"
      })
    }
    
    let shop = req.shop

    shop = extend(shop, fields)
    shop.updated= Date.now()
    
    if(files.image){
      shop.image.data = fs.readFileSync(files.image.path)
      shop.image.contentType = files.image.type
    }


    try {
      let result = await shop.save()
      res.json(result)
    } catch (err) {
      return res.status(400).json({
        error: dbErrorHandler.getErrorMessage(err)
      })
    }
  })
}
  
const remove = async (req, res) => {
  try {
    let shop = req.shop
    let deleteShop = shop.remove()
    res.json(deleteShop)
  } catch (err) {
    return res.status(400).json({
      error: dbErrorHandler.getErrorMessage(err)
    })
  }

}

const photo = (req, res, next) => {
  if (req.shop.image && req.shop.image.data){
    res.set("Content-Type", req.shop.image.contentType)
    return res.send(req.shop.image.data)
  }
  next()
}

const defaultPhoto = (req, res) => {
  return res.sendFile(process.cwd() + defaultImage)
}

const read = (req, res) => {
  req.shop.image = undefined
  return res.json(req.shop)
}

const list = async (req, res) => {
  try {
    let shops = await Shop.find()
    res.json(shops)
  } catch (err) {
    return res.status(400).json({
      error: dbErrorHandler.getErrorMessage(err)
    })
  }
}

const listByOwner = async (req, res) => {
  try {
    let shops = await Shop.find({owner: req.profile._id}).populate('owner', '_id name')
    res.json(shops)
  } catch(err) {
    return res.status(400).json({
      error: dbErrorHandler.getErrorMessage(err)
    })
  }
}

const isOwner = async (req, res, next) => {
  let isOwner = req.shop && req.auth && req.shop.owner._id == req.auth._id
  if (!isOwner) 
    return res.status(403).json({
      error: 'User is not authorized'
    })
  
  next()
}

export default { shopByID, create, update, remove, read, list, listByOwner, isOwner, photo, defaultPhoto }