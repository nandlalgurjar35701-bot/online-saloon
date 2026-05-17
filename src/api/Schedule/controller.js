const saloonservice = require("../../models/productModel");
const mongoose = require("mongoose");
const cart = require("../../models/cartModel");
const schedule = require("../../models/scheduleModel");
const order = require("../../models/orderModel");
const saloon = require("../../models/saloonStoreModel");
const moment = require("moment");

exports.scheduleYourVisit = async ({ query, body, user, headers }) => {
    try {
        const tendentId = headers.tendentId;
        
        let findcart = await cart.findOne({ userId: user._id, tendentId });
        if (!findcart || !Array.isArray(findcart.cartdata) || findcart.cartdata.length === 0) {
            return {
                statusCode: 400,
                status: false,
                message: "Your Cart in empty!",
                data: []
            };
        }

        let findSchedul = await schedule.findOne({ cartId: findcart._id, tendentId });

        if (query.saloonId) {
            let OrderDay = moment(body.date).format('dddd');
            const findSaloon = await saloon.findOne({ _id: mongoose.Types.ObjectId(query.saloonId), tendentId });
            const workingDays = findSaloon?.ProfileInfo?.workingday || [];
            if (workingDays.length > 0 && !workingDays.includes(OrderDay)) {
                return {
                    statusCode: 400,
                    status: false,
                    message: `saloon-is-close-this-Date ${body.date}!`,
                    data: workingDays
                };
            };
        }

        const findUserOrder = await order.find({ userId: user._id, tendentId, status: "pending" });
        for (const element of findUserOrder) {
            if (element.Schedule.date == body.date) {
                if (element.Schedule.timeslot == body.timeslot) {
                    return {
                        statusCode: 400,
                        status: false,
                        message: `user-Allready-take-order-this-Date ${body.date}!`,
                        data: [element]
                    };
                };
            };
        };

        if (!findSchedul) {
            body.cartId = findcart._id
            body.userId = findcart.userId;
            if (query.saloonId) {
                body.saloonId = query.saloonId;
            }
            body.tendentId = tendentId;

            let scheduleCart = new schedule(body);
            const result = await scheduleCart.save();
            if (result) {
                return {
                    statusCode: 200,
                    status: true,
                    message: "schedule-Succesfuuly !",
                    data: [result]
                };
            };
        } else {
            let obj = {};
            if (body.date) {
                obj.date = body.date;
            };
            if (body.timeslot) {
                obj.timeslot = body.timeslot;
            };
            const result = await schedule.findOneAndUpdate({ _id: findSchedul._id, tendentId }, { $set: obj }, { new: true })
            if (result) {
                return {
                    statusCode: 200,
                    status: true,
                    message: "schedule updated Succesfuuly",
                    data: [result]
                };
            };
        };
    } catch (error) {
        console.log(error);
    };
};
