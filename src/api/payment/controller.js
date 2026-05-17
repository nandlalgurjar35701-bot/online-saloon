const users = require("../../models/userModel");
const servish = require("../../models/productModel");
const razorpay = require("razorpay");
const payments = require("../../models/paymentModel");
const { findOne, findOneAndUpdate } = require("../../models/paymentModel");
const { default: mongoose } = require("mongoose");

var instance = new razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret
});

exports.createOrderId = async (req) => {
    try {
        let { amount } = req.body;
        let userId;
        var options = {
            amount: amount * 100,
            currency: "INR",
            receipt: "rc_1"
        };
        const order = await instance.orders.create(options)
        if (order) {
            if (req.user) {
                userId = req.user._id
            } else {
                userId = null
            }
            const tendentId = req.headers.tendentId;
            const paymentDitail = new payments({
                userId: userId,
                tendentId,
                orderData: {
                    id: order.id,
                    entity: order.entity,
                    amount: order.amount,
                    amount_paid: order.amount_paid,
                    amount_due: order.amount_due,
                    currency: order.currency,
                    receipt: order.receipt,
                    offer_id: order.offer_id,
                    status: order.status,
                    attempts: order.attempts,
                    notes: order.notes,
                    created_at: order.created_at,
                }
            });
            const result = await paymentDitail.save();
            if (result) {
                return {
                    statusCode: 200,
                    status: true,
                    message: "User orderid created  Successfully !",
                    data: [result]
                }
            } else {
                return {
                    statusCode: 400,
                    status: false,
                    message: "orderid Not created !",
                    data: []
                }
            }
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 400,
            status: false,
            message: error.message,
            data: []
        }
    };
};

exports.apiPaymentVerify = async (req, res) => {
    try {
        let body = req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;
        let orderID;
        if (req.query.orderId != undefined && req.query.orderId != "") {
            orderID = req.query.orderId
        } else {
            return {
                statusCode: 400,
                status: false,
                message: "orderId is must  !",
                data: []
            }
        }
        var crypto = require("crypto");
        var expectedSignature = crypto.createHmac('sha256', process.env.key_secret)
            .update(body.toString())
            .digest('hex');
        var response = { "signatureIsValid": "false" };
        if (expectedSignature === req.body.response.razorpay_signature) {
            const tendentId = req.headers.tendentId;
            const result = await payments.findOneAndUpdate({ "orderData.id": req.body.response.razorpay_order_id, tendentId }, {
                payment: "Payment Successfully",
                orderId: orderID,
                "payment_detail.razorpay_payment_id": req.body.response.razorpay_payment_id,
                "payment_detail.razorpay_order_id": req.body.response.razorpay_order_id,
                "payment_detail.razorpay_signature": req.body.response.razorpay_signature
            }, { new: true });

            if (result) {
                response = { "signatureIsValid": "true" };
                return {
                    statusCode: 200,
                    status: true,
                    message: "User orderid signature Successfully !",
                    data: [{
                        "signature": response,
                        "data": req.body.response
                    }]
                }
            };
        };
    } catch (error) {
        console.log(error);

    };
};

exports.paymentsRefund = async ({ query, headers }) => {
    try {
        const tendentId = headers.tendentId;
        if (query.id != undefined && query.id != "" || query._id != undefined && query._id != "") {
            let result;
            if (query._id != undefined && query._id != "") {
                result = await payments.findOne({ _id: query._id, tendentId })
            } else {
                result = await payments.findOne({ "payment_detail.razorpay_payment_id": query.id, tendentId })
            }

            if (result) {
                if (result.payment == "Payment Refund") {
                    return {
                        statusCode: 400,
                        status: false,
                        message: "Your payment allready Refund !",
                        data: []
                    };
                };
                let Refund = await instance.payments.refund(result.payment_detail.razorpay_payment_id, {
                    "amount": result.orderData.amount,
                    "speed": "optimum"
                });
                if (Refund) {
                    const data = await payments.findOneAndUpdate({ _id: result._id, tendentId }, {
                        payment: "Payment Refund",
                    }, { new: true });
                    if (data) {
                        return {
                            statusCode: 200,
                            status: true,
                            message: "User Refund  Successfully !",
                            data: [data]
                        };
                    };
                } else {
                    return {
                        statusCode: 400,
                        status: false,
                        message: "refund is fail !",
                        data: []
                    };
                }
            } else {
                return {
                    statusCode: 400,
                    status: false,
                    message: "Enter valid razorpay_payment_id !",
                    data: []
                };
            };
        } else {
            return {
                statusCode: 400,
                status: false,
                message: "Enter razorpay_payment_id ! !",
                data: []
            };
        };
    } catch (error) {
        console.log(error);
    };
};
