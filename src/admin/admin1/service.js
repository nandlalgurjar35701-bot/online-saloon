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
        let filter = { tendentId: req.user.tendentId };
        let resObj = {}
        resObj.order = await order.countDocuments(filter)//{status:"cancel"}
        resObj.user = await user.countDocuments(filter) //super Admin
        resObj.saloon = await saloon.countDocuments(filter)
        resObj.Findservice = await service.countDocuments(filter)
        resObj.Findpackeges = await productPackage.countDocuments(filter)
        return resObj;
    } catch (errore) {
        console.log(errore);
    };
};

