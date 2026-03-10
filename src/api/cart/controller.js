const service = require("../../models/productModel");
const mongoose = require("mongoose");
const cart = require("../../models/cartModel");
const saloon = require("../../models/saloonStoreModel");
const package = require("../../models/packageModel");

exports.removeserviceFromCart = async ({ body, user, query }) => {
    try {
        if (query.id) {
            const _id = mongoose.Types.ObjectId(query.id);
            const findData = await cart.findOne({ _id });
            let cartdata = [];
            let Amount = [];
            let obj = {};
            if (findData) {
                if (query.serviceId) {
                    if (findData.cartdata.length > 0) {
                        let isUpdated = false;
                        for (const item of findData.cartdata) {
                            if (!isUpdated && item.serviceId.toString() === query.serviceId) {
                                const currentQty = Number(item.quantity || 1);
                                const lineAmount = Number(item.Amount || 0);
                                const unitPrice = currentQty > 0 ? lineAmount / currentQty : lineAmount;

                                if (currentQty > 1) {
                                    const updatedQty = currentQty - 1;
                                    const updatedAmount = Number(unitPrice) * updatedQty;
                                    cartdata.push({
                                        serviceId: item.serviceId,
                                        quantity: updatedQty,
                                        Amount: updatedAmount,
                                        timePeriod_in_minits: item.timePeriod_in_minits,
                                    });
                                    Amount.push(updatedAmount);
                                }
                                isUpdated = true;
                            } else {
                                cartdata.push(item);
                                Amount.push(Number(item.Amount));
                            };
                        };
                        const serviceId = mongoose.Types.ObjectId(query.serviceId);
                        obj.cartdata = cartdata;
                        if (Amount.length > 0) {
                            const sum = Amount.reduce(add, 0);
                            function add(accumulator, a) {
                                return accumulator + a;
                            };
                            obj.totalamount = sum;
                        } else { obj.totalamount = 0 }
                        const result = await cart.findByIdAndUpdate({ _id }, { $set: obj }, { new: true });
                        if (result) {
                            return {
                                statusCode: 200,
                                status: true,
                                message: "Remove-Servish-From-User-Cart- Succesfuuly !",
                                data: [result]
                            };
                        };

                    } else {
                        return {
                            statusCode: 200,
                            status: true,
                            message: "Cart Is already Empty !",
                            data: []
                        };
                    };
                } else {
                    return {
                        statusCode: 400,
                        status: false,
                        message: "Please-Enter-Valid-sarvice -Id !",
                        data: []
                    };
                };
            } else {
                return {
                    statusCode: 200,
                    status: true,
                    message: "Please-Enter-Valid-Cart-Id !",
                    data: []
                };
            };
        } else {
            return {
                statusCode: 400,
                status: false,
                message: "please-Enter-Valid-Cart-Id !",
                data: []
            };
        };
    } catch (error) {
        console.log(error);
    };
};

exports.getcart = async ({ user, query }) => {
    try {
        let arr = [];
        let condition = [];
        if (query.saloonId != undefined && query.saloonId != "") {
            condition.push({
                '$match': {
                    '$and': [
                        {
                            'userId': user._id
                        },
                        {
                            'saloonId': mongoose.Types.ObjectId(query.saloonId)
                        }
                    ]
                }
            })
        } else {
            condition.push({
                '$match': {
                    '$and': [
                        {
                            'userId': user._id
                        },
                    ]
                }
            })
        }
        condition.push({
            '$unwind': {
                'path': '$cartdata'
            }
        }, {
            '$lookup': {
                'from': 'products',
                'localField': 'cartdata.serviceId',
                'foreignField': '_id',
                'as': 'result'
            }
        }, {
            '$unwind': {
                'path': '$result'
            }
        }, {
            '$project': {
                'totalamount': 1,
                'cartdata': {
                    'saloonId': '$result.saloonStore',
                    'serviceId': '$result._id',
                    'quantity': '$cartdata.quantity',
                    'Amount': '$cartdata.Amount',
                    'ServiceName': '$result.ServiceName',
                    'ServicePrice': '$result.ServicePrice',
                    'timePeriod_in_minits': '$result.timePeriod_in_minits',
                    'serviceProvider': '$result.serviceProvider',
                    'image': '$result.image',
                    'description': '$result.description'
                },
                'addressId': '$addressId'
            }
        })
        const findData = await cart.aggregate(condition)
        const findSaloon = await cart.aggregate([
            {
                '$match': {
                    'userId': user._id
                }
            }, {
                '$lookup': {
                    'from': 'saloons',
                    'localField': 'saloonId',
                    'foreignField': '_id',
                    'as': 'result'
                }
            }, {
                '$unwind': {
                    'path': '$result'
                }
            }, {
                '$replaceRoot': {
                    'newRoot': '$result'
                }
            }
        ])
        let i;
        i = 1
        let cartData = []
        for (const saloon of findSaloon) {
            cartData = []
            for (const cart of findData) {
                if (cart.cartdata.saloonId.toString() === saloon._id.toString()) {
                    cartData.push(cart)
                }
            }
            if (cartData.length > 0) {
                saloon.cart = cartData
                arr.push(saloon)
            }
        }
        if (arr) {
            return {
                statusCode: 200,
                status: true,
                message: "your cart is here !",
                data: arr
            };
        } else {
            return {
                statusCode: 400,
                status: false,
                message: "NO Cart !",
                data: []
            };
        };
    } catch (error) {
        console.log(error)
    };
};

exports.addcart = async ({ user, query }) => {
    try {
        let obj = {};
        let serviceArr = [];
        let findData = await cart.findOne({ userId: user._id });

        if (!findData) {
            obj.userId = user._id;
            findData = await cart.create(obj);
        }


        // if (query.serviceId) {
        let _id = mongoose.Types.ObjectId(query.serviceId);

        let findService = await service.findById(query.serviceId);

        if (!findService) {
            return {
                statusCode: 400,
                status: false,
                message: "service is  not Found !",
                data: []
            };
        }

        const FindCart = await cart.findOne({ userId: user._id, });

        let isMerged = false;
        if (FindCart.cartdata.length > 0) {
            for (const item of FindCart.cartdata) {
                console.log(item, '---item', findService._id)
                if (item.serviceId.toString() === findService._id.toString()) {
                    const currentQty = Number(item.quantity || 1);
                    const updatedQty = currentQty + 1;
                    const updatedAmount = Number(findService.ServicePrice || 0) * updatedQty;
                    serviceArr.push({
                        serviceId: item.serviceId,
                        Amount: updatedAmount,
                        quantity: updatedQty,
                        timePeriod_in_minits: item.timePeriod_in_minits || findService.timePeriod_in_minits,
                    });
                    isMerged = true;
                } else {
                    serviceArr.push(item)
                }
            };
        };

        if (!isMerged) {
            serviceArr.push({
                serviceId: findService._id,
                Amount: Number(findService.ServicePrice || 0),
                quantity: 1,
                timePeriod_in_minits: findService.timePeriod_in_minits,
            });
        }


        let totalamount = [];
        serviceArr.forEach(element => {
            totalamount.push(Number(element.Amount))
        });
        let sum = totalamount.reduce(function (x, y) {
            return x + y;
        }, 0);

        const result = await cart.findByIdAndUpdate(FindCart._id, { cartdata: serviceArr, totalamount: sum }, { new: true });


        return {
            statusCode: 200,
            status: true,
            message: "service added in new new cart Succesfuuly ! ",
            data: result
        };
    } catch (error) {
        console.log(error);
    };
};

exports.removeCart = async ({ query }) => {
    try {
        const _id = mongoose.Types.ObjectId(query.id);
        const result = await cart.findByIdAndRemove({ _id })
        if (result) {
            return {
                statusCode: 200,
                status: true,
                message: "cart remove succesfully !",
                data: [result]
            };
        };
    } catch (error) {
        console.log(error);
    }
}
