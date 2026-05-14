const user = require("../../models/userModel");
const Newsletters = require("../../models/newsletterModel");
const mongoose = require("mongoose");


exports.Newsletter = async ({ body, file, headers }) => {
    try {
        const tendentId = headers.tendentId;
        const findData = await Newsletters.findOne({ email: body.email, tendentId });
        if (findData) {
            return {
                statusCode: 400,
                status: false,
                message: "your are allready register !",
                data: [findData]
            };
        };
        const LetterDtaile = new Newsletters({
            email: body.email,
            tendentId
        });
        const result = await LetterDtaile.save();
        if (result) {
            return {
                statusCode: 200,
                status: true,
                message: "Newsletters registration successfully !",
                data: [result]
            };
        };
    } catch (error) {
        console.log(error);
    };
};
