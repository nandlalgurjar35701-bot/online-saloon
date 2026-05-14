
const coupon = require("../../models/couponModel");
const mongoose = require("mongoose")
const saloon = require("../../models/saloonStoreModel");
const { query } = require("express");


/*
exports.createCoupon = async ({ body }) => {
    try {
        if (body.CouponCode != undefined && body.CouponCode != "") {
            const findData = await coupon.findOne({ CouponCode: body.CouponCode });
            if (!findData) {
                body.CouponCode = body.CouponCode;
            } else {
                return {
                    statusCode: 400,
                    status: false,
                    message: "CouponCode must bhi unique ",
                    data: []
                };
            };
        };
        const couponditail = new coupon(body);
        const result = await couponditail.save();
        if (result) {
            return {
                statusCode: 200,
                status: true,
                message: "coupon created succesfully",
                data: [result]
            };
        };
    } catch (error) {
        console.log(error);
    };
};


exports.editCoupon = async ({ query, body }) => {
    try {
        
        if (query.id != undefined && query.id != "") {
            const _id = mongoose.Types.ObjectId(query.id)
            const updateData = await coupon.findByIdAndUpdate({ _id }, body, { new: true })
            if (updateData) {
                return {
                    statusCode: 200,
                    status: true,
                    message: "coupon update succesfully",
                    data: [updateData]
                };
            };
        } else {
            return {
                statusCode: 400,
                status: false,
                message: "Enter valid coupon Id",
                data: []
            };
        };

    } catch (error) {
        console.log(error);
    };
};

*/


exports.getCoupon = async (req) => {
    try {
        const tendentId = req.headers.tendentId;
        const findData = await coupon.find({ tendentId });
        if (findData.length > 0) {
            return {
                statusCode: 200,
                status: true,
                message: "data find  succesfully",
                data: findData
            };
        } else {
            return {
                statusCode: 400,
                status: false,
                message: "data not Found ",
                data: []
            };
        };
    } catch (error) {
        console.log(error);
    };
};
