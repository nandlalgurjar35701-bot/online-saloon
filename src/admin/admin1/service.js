const order = require("../../models/orderModel")
const user = require("../../models/userModel");
const saloon = require("../../models/saloonStoreModel");
const service = require("../../models/productModel");
const productPackage = require("../../models/productPackageModel");
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
   const adminSaloons = await saloon.find({ userId: req.user._id }, { _id: 1 }).lean();
   const saloonIds = adminSaloons.map((item) => item._id);
   obj.Findservice = await service.countDocuments({ saloonStore: { $in: saloonIds } })
   obj.Findpackeges = await productPackage.countDocuments({ saloonStore: { $in: saloonIds } })

  } else {
   obj.Findservice = await service.countDocuments()
   obj.Findpackeges = await productPackage.countDocuments()
  }




  return obj;
 } catch (errore) {
  console.log(errore);
 };
};

