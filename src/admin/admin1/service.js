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
  obj.order = await order.countDocuments()//{status:"cancel"}
  obj.user = await user.countDocuments({ type: "user" })//super Admin
  obj.saloon = await saloon.countDocuments({})
  obj.Findservice = await service.countDocuments()
  obj.Findpackeges = await productPackage.countDocuments()




  return obj;
 } catch (errore) {
  console.log(errore);
 };
};

