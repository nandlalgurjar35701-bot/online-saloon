const service = require("../../models/productModel");
const mongoose = require("mongoose");
const cart = require("../../models/cartModel");
const saloon = require("../../models/saloonStoreModel");
const package = require("../../models/packageModel");

exports.removeserviceFromCart = async ({ body, user, query, headers }) => {
    try {
        if (query.id) {
            const _id = mongoose.Types.ObjectId(query.id);
            const findData = await cart.findOne({ _id, tendentId: headers.tendentId });
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
                        const result = await cart.findOneAndUpdate({ _id, tendentId: headers.tendentId }, { $set: obj }, { new: true });
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

exports.getcart = async ({ user, query, headers }) => {
    try {
        const tendentId = mongoose.Types.ObjectId(headers.tendentId);
        const condition = [
            {
                '$match': {
                    'userId': user._id,
                    'tendentId': tendentId
                }
            },
            {
                '$unwind': {
                    'path': '$cartdata'
                }
            },
            {
                '$lookup': {
                    'from': 'products',
                    'localField': 'cartdata.serviceId',
                    'foreignField': '_id',
                    'as': 'result'
                }
            },
            {
                '$unwind': {
                    'path': '$result'
                }
            },
            {
                '$group': {
                    '_id': '$_id',
                    'totalamount': { '$first': '$totalamount' },
                    'addressId': { '$first': '$addressId' },
                    'items': {
                        '$push': {
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
                        }
                    }
                }
            }
        ];

        const findData = await cart.aggregate(condition);

        if (findData && findData.length > 0) {
            return {
                statusCode: 200,
                status: true,
                message: "your cart is here !",
                data: findData
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

exports.addcart = async ({ user, query, headers }) => {
    try {
        let obj = {};
        let serviceArr = [];
        let tendentId = headers.tendentId;
        let findData = await cart.findOne({ userId: user._id, tendentId });

        if (!findData) {
            obj.userId = user._id;
            obj.tendentId = tendentId;
            findData = await cart.create(obj);
        }


        // if (query.serviceId) {
        let _id = mongoose.Types.ObjectId(query.serviceId);

        let findService = await service.findOne({ _id: mongoose.Types.ObjectId(query.serviceId), tendentId });

        if (!findService) {
            return {
                statusCode: 400,
                status: false,
                message: "service is  not Found !",
                data: []
            };
        }

        const FindCart = await cart.findOne({ userId: user._id, tendentId });

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

        const result = await cart.findOneAndUpdate({ _id: FindCart._id, tendentId }, { cartdata: serviceArr, totalamount: sum }, { new: true });


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

exports.removeCart = async ({ query, headers }) => {
    try {
        const _id = mongoose.Types.ObjectId(query.id);
        const result = await cart.findOneAndRemove({ _id, tendentId: headers.tendentId })
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
