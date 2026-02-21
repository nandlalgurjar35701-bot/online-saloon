const order = require("../../models/orderModel")
const user = require("../../models/userModel");
const saloon = require("../../models/saloonStoreModel");
const service = require("../../models/productModel");
const payment = require("../../models/paymentModel");
const Artice = require("../../models/artistModel");
const veconcy = require("../../models/vacancyModel");

exports.AllDetail = async (req, res) => {
 try {
  let obj = {}

  if (req.user.type == "admin") {
   let condition = []
   condition.push({
    '$lookup': {
     'from': 'saloons',
     'localField': 'saloonId',
     'foreignField': '_id',
     'pipeline': [
      {
       '$match': {
        'userId': req.user._id
       }
      }
     ],
     'as': 'saloon'
    }
   }, {
    '$unwind': {
     'path': '$saloon'
    }
   })
   const findOrder = await order.aggregate(condition)//{status:"cancel"}
   obj.order = findOrder.length
  } else {
   obj.order = await order.countDocuments()//{status:"cancel"}
  }
  obj.user = await user.countDocuments({ type: "user" })//super Admin
  let condition = {};
  if (req.user.type == "admin") {
   condition.userId = req.user._id
  } else {
   condition = {}
  }
  obj.saloon = await saloon.countDocuments(condition)

  if (req.user.type == "admin") {
   let condition = []
   let match = {};
   match.userId = req.user._id
   condition.push({
    '$match': match
   }, {
    '$lookup': {
     'from': 'saloonservices',
     'localField': '_id',
     'foreignField': 'saloonStore',
     'pipeline': [
      {
       '$match': {
        'ServicesType': 0
       }
      }
     ],
     'as': 'stores'
    }
   }, {
    '$unwind': {
     'path': '$stores'
    }
   })
   const findservice = await saloon.aggregate(condition)
   obj.Findservice = findservice.length
   condition = []
   condition.push({
    '$match': match
   }, {
    '$lookup': {
     'from': 'saloonservices',
     'localField': '_id',
     'foreignField': 'saloonStore',
     'pipeline': [
      {
       '$match': {
        'ServicesType': 1
       }
      }
     ],
     'as': 'stores'
    }
   }, {
    '$unwind': {
     'path': '$stores'
    }
   })
   const findpackeges = await saloon.aggregate(condition)
   obj.Findpackeges = findpackeges.length

  } else {
   obj.Findservice = await service.countDocuments({ ServicesType: 0 })
   obj.Findpackeges = await service.countDocuments({ ServicesType: 1 })
  }




  return obj;
 } catch (errore) {
  console.log(errore);
 };
};

