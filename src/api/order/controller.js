const cart = require("../../models/cartModel");
const order = require("../../models/orderModel");
const Schedule = require("../../models/scheduleModel");
const mongoose = require("mongoose")
const saloon = require("../../models/saloonStoreModel")
const { addcart } = require("../cart/controller");
const { query } = require("express");
const coupon = require("../../models/couponModel")

exports.userOrder = async ({ query, user, headers }) => {
    try {
        let userId;
        let obj = {};
        const tendentId = headers.tendentId;
        const paymentMode = String(query.paymentMode || "online").toLowerCase();
        if (user._id) {
            userId = user._id;
            const findcart = await cart.findOne({ _id: mongoose.Types.ObjectId(query.cartId), userId, tendentId });
            if (findcart) {
                if (findcart.addressId != undefined) {
                    obj.addressId = findcart.addressId;
                }
                obj.saloonId = findcart.saloonId;
                obj.cartdata = findcart.cartdata;
                obj.totalamount = findcart.totalamount;
            } else {
                return {
                    statusCode: 400,
                    status: false,
                    message: "Your Cart Is Empty !",
                    data: []
                };
            };
            if (paymentMode === "offline") {
                obj.paymentStatus = "offline-store";
            } else if (query.PaymentId != undefined && query.PaymentId != "") {
                obj.PaymentId = query.PaymentId
                obj.paymentStatus = "Payment successful";
            } else {
                return {
                    statusCode: 400,
                    status: false,
                    message: "PaymentId is must !",
                    data: []
                };
            }
            const findSchedule = await Schedule.findOne({ userId, tendentId });
            if (findSchedule) {
                let Schedule = {}
                Schedule.date = findSchedule.date
                Schedule.timeslot = findSchedule.timeslot
                obj.Schedule = Schedule;

            } else {
                return {
                    statusCode: 400,
                    status: false,
                    message: "Please Choice is Time And Date !",
                    data: []
                };
            };
        };
        let orderId = Math.floor(Math.random() * 10 ** 15);
        obj.userId = userId;
        obj.orderId = orderId;
        obj.tendentId = tendentId;
        // obj.paymentStatus = "Payment successful"
        if (query.couponId != undefined && query.couponId != "") {
            const findCoupon = await coupon.findOne({ _id: mongoose.Types.ObjectId(query.couponId), tendentId })
            obj.couponId = findCoupon._id;
            obj.Discount = findCoupon.Discount
            obj.finalTotalAmount = obj.totalamount - findCoupon.Discount
        }
        const orderdetails = new order(obj);
        const result = await orderdetails.save();
        if (result) {
            const deletcart = await cart.findOneAndRemove({ _id: mongoose.Types.ObjectId(query.cartId), userId, tendentId });
            const findSchedule = await Schedule.findOneAndRemove({ userId, tendentId });
            if (deletcart && findSchedule) {
                return {
                    statusCode: 200,
                    status: true,
                    message: "order  successful !",
                    data: [result]
                };
            };
        };
    } catch (error) {
        console.log(error)
        throw error
    };
};

/*
exports.getUserOrder = async ({ user, query }) => {
    try {
        let condition = [];
        let finalData = [];
        if (query.id) {
            condition.push({
                '$match': {
                    '_id': mongoose.Types.ObjectId(query.id)
                }
            })
        } else {
            // let userId = user._id;
            // condition.userId = userId;
            condition.push({
                '$match': {
                    'userId': user._id
                    // 'userId': mongoose.Types.ObjectId("63edcfe963019ceacb729327")
                }
            })
        };
        condition.push({
            '$unwind': {
                'path': '$cartdata'
            }
        }, {
            '$lookup': {
                'from': 'saloonservices',
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
                'userId': 1,
                'saloonId': 1,
                'ServiceName': '$result.ServiceName',
                'ServicePrice': '$result.ServicePrice',
                'timePeriod_in_minits': '$result.timePeriod_in_minits',
                'totalamount': 1,
                'addressId': 1,
                'Schedule': 1,
                'paymentStatus': 1,
                'status': 1,
                'orderId': 1,
                'createdAt': 1,
                'updatedAt': 1
            }

        }, {
            "$group": {
                _id: "$_id",
                data: {
                    $push: {
                        _id: "$_id",
                        userId: "$userId",
                        saloonId: "$saloonId",
                        ServiceName: "$ServiceName",
                        ServicePrice: "$ServicePrice",
                        timePeriod_in_minits: "$timePeriod_in_minits",
                        totalamount: "$totalamount",
                        addressId: "$addressId",
                        Schedule: "$Schedule",
                        paymentStatus: "$paymentStatus",
                        status: "$status",
                        orderId: "$orderId",
                        createdAt: "$createdAt",
                        updatedAt: "$updatedAt",
                    },
                },
            }
        }, {
            "$project": {
                _id: 0,
                saloonId: {
                    $arrayElemAt: ["$data.saloonId", 0],
                },
                addressId: {
                    $arrayElemAt: ["$data.addressId", 0],
                },
                data: 1,
            }
        }, {
            '$unset': 'data.saloonId'
        }, {
            '$unset': 'data.addressId'
        })


        const findData = await order.aggregate(condition);
        const findAllSaloon = await saloon.find()
        // const findAllSaloon = await saloon.find({}, { image: 1, storeName: 1, location: 1 })

        for (const order of findData) {
            for (const Saloon of findAllSaloon) {
                if (order.saloonId.toString() === Saloon._id.toString()) {
                    Saloon._doc.item = order
                    finalData.push(Saloon)
                };
            };
        };

        if (finalData.length > 0) {
            return {
                statusCode: 200,
                status: true,
                message: "Find Your Order  successful Done !",
                data: [finalData]
            };
        } else {
            return {
                statusCode: 400,
                status: false,
                message: "Not Find Your Order !",
                data: []
            };
        };
    } catch (error) {
        console.log(error);
    };
};*/


// new code 
exports.getUserOrder = async ({ user, query, headers }) => {
    try {
        let condition = [];
        let tendentId = mongoose.Types.ObjectId(headers.tendentId);
        if (query.id) {
            condition.push({
                '$match': {
                    '_id': mongoose.Types.ObjectId(query.id),
                    'tendentId': tendentId
                }
            })
        } else {
            condition.push({
                '$match': {
                    'userId': user._id,
                    'tendentId': tendentId
                }
            })
        };

        condition.push({
            '$unwind': {
                'path': '$cartdata'
            }
        }, {
            '$lookup': {
                'from': 'products',
                'localField': 'cartdata.serviceId',
                'foreignField': '_id',
                'as': 'productDetail'
            }
        }, {
            '$unwind': {
                'path': '$productDetail'
            }
        }, {
            '$group': {
                '_id': '$_id',
                'services': {
                    '$push': {
                        '_id': '$productDetail._id',
                        'ServiceName': '$productDetail.ServiceName',
                        'ServicePrice': '$productDetail.ServicePrice',
                        'quantity': '$cartdata.quantity',
                        'image': '$productDetail.image'
                    }
                },
                'orderDetail': {
                    '$first': {
                        '_id': '$_id',
                        'Schedule': '$Schedule',
                        'totalamount': '$totalamount',
                        'couponId': '$couponId',
                        'paymentStatus': '$paymentStatus',
                        'status': '$status',
                        'orderId': '$orderId',
                        'addressId': '$addressId',
                        'createdAt': '$createdAt'
                    }
                }
            }
        }, {
            '$sort': {
                'orderDetail.createdAt': -1
            }
        })

        const findData = await order.aggregate(condition);

        if (findData.length > 0) {
            return {
                statusCode: 200,
                status: true,
                message: "Find Your Order  successful Done !",
                data: findData
            };
        } else {
            return {
                statusCode: 400,
                status: false,
                message: "Not Find Your Order !",
                data: []
            };
        };
    } catch (error) {
        console.log(error);
    };
};
const { paymentsRefund } = require("../payment/controller")
exports.orderCancel = async (req) => {
    try {
        const tendentId = req.headers.tendentId;
        if (req.query.id) {
            const _id = mongoose.Types.ObjectId(req.query.id);
            const findOrder = await order.findOne({ _id, tendentId, status: { $ne: "succes" } });
            if (findOrder) {
                const updateData = await order.findOneAndUpdate({ _id, tendentId }, { status: "cancel" }, { new: true })
                if (updateData) {
                    // refund paise 
                    req.query._id = updateData.PaymentId
                    const paymentRefund = await paymentsRefund(req)
                    // refund paise Successfully
                    if (paymentRefund) {
                        return {
                            statusCode: 200,
                            status: true,
                            message: `cancel order Successfully && payment refunded`,
                            data: [updateData]
                        };
                    };
                };
            } else {
                return {
                    statusCode: 400,
                    status: false,
                    message: `Enter valid pending  order id`,
                    data: []
                };
            };
        } else {
            return {
                statusCode: 400,
                status: false,
                message: `Enter a order id`,
                data: []
            };
        }
    } catch (error) {
        console.log(error);
    };
};


