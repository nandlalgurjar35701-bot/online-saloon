const userModel = require("../../models/userModel");
const aboutModel = require("../../models/aboutModel");
// const services = require("../user/services");
const bcrypt = require('bcrypt');
const { query } = require("express");
const jwt = require("jsonwebtoken");
const referralCodeGenerator = require("referral-code-generator");
const appServices = require("../services/appServices");
const { default: mongoose } = require("mongoose");

exports.index = async (req, res) => {
    try {
        const q = String(req.query.q || "").trim();
        const categoryId = String(req.query.categoryId || "").trim();
        const tendentId = req.headers.tendentId;
        const data = await appServices.index({ q, categoryId, tendentId })
        data.filters = { q, categoryId };
        res.render('index', { data, tendentId })
    } catch (error) {
        console.log(error);
    };
};

exports.otpSent = async ({ body, headers }) => {
    try {
        let filter = {}
        if (headers.tendentId) {
            filter.tendentId = headers.tendentId;
        }
        let user;
        if (body.phone != undefined && body.phone != "") {
            filter.phone = body.phone;
            const data = await userModel.findOne(filter);
            if (data) user = data;
        } else {
            return {
                statusCode: 400,
                status: false,
                message: "plese Enter number ",
                data: []
            };
        }

        if (user) {
            return {
                statusCode: 400,
                status: false,
                message: "User Already Exists",
                data: []
            };
        }

        body.otp = '1234'
        body.tendentId = headers.tendentId;
        const userData = await userModel(body);
        const result = await userData.save()
        return {
            statusCode: 200,
            status: true,
            message: "Otp Send",
            data: [result]
        };

    } catch (error) {
        console.log(error);
    };
};

exports.otpVerify = async ({ body, headers }) => {
    try {
        let filter = {}
        if (headers.tendentId) {
            filter.tendentId = headers.tendentId;
        }
        let user;
        if (body.phone) {
            filter.phone = body.phone;
            const data = await userModel.findOne(filter);
            if (data) user = data;
        };
        if (user) {
            if (user.otp === body.otp) {
                const data = await userModel.findOneAndUpdate({ _id: user._id, tendentId: headers.tendentId }, { $set: { verify: true } }, { new: true });
                return {
                    statusCode: 200,
                    status: true,
                    message: "Otp Matched",
                    data: [data]
                };
            } else {
                return {
                    statusCode: 400,
                    status: false,
                    message: "Otp Not Matched",
                    data: []
                };
            };
        } else {
            return {
                statusCode: 400,
                status: false,
                message: "Phone Number Not Matched!",
                data: []
            };
        };
    } catch (error) {
        console.log(error);
    };
};

exports.register = async ({ body, query, headers }) => {
    try {
        let filter = {}
        if (headers.tendentId) {
            filter.tendentId = headers.tendentId;
        }
        const { email, password } = body;
        let user;

        if (email) {
            filter.email = email;
            const data = await userModel.findOne(filter);
            if (data) user = data;
        };
        if (user) {
            return {
                statusCode: 400,
                status: false,
                message: "User Already Exists",
                data: []
            };
        } else {
            if (body.referCode != undefined && body.referCode != "" || query.referCode != undefined && query.referCode != "") {
                let obj = {};
                const findReferAmount = await userModel.findOne({ type: "super-admin", tendentId: headers.tendentId }, { referalDetails: 1 });
                if (findReferAmount && findReferAmount.referalDetails && findReferAmount.referalDetails.referaType === "point") {
                    obj['userWallet.point'] = findReferAmount.referalDetails.referalAmount;
                } else if (findReferAmount && findReferAmount.referalDetails) {
                    obj['userWallet.balance'] = findReferAmount.referalDetails.referalAmount;
                };
                const findData = await userModel.findOneAndUpdate({ $or: [{ referCode: body.referCode }, { referCode: query.referCode }], tendentId: headers.tendentId }, { $inc: obj });
                if (findData) {
                    body.referId = findData._id
                };
            };


            body.password = bcrypt.hashSync(password, 10);
            body.otp = '';
            let j = 2;
            for (let i = 0; i < j; i++) {
                body.referCode = referralCodeGenerator.custom('uppercase', 6, 6, 'Onlinesaloon')
                if (body.referCode) {
                    const findData = await userModel.findOne({ referCode: body.referCode, tendentId: headers.tendentId });
                    if (!findData) {
                        break;
                    } else {
                        j++;
                        continue;
                    };
                };
            };

            const userData = await userModel.findOneAndUpdate({ phone: body.phone, tendentId: headers.tendentId }, { $set: body }, { new: true });

            //user register hone ke baad referel user ka wallte balece badao 

            const token = jwt.sign({ _id: userData._id }, process.env.SECRET);
            if (userData) {
                return {
                    statusCode: 201,
                    status: true,
                    message: "Registration Successfully",
                    data: { auth: token, user }
                };
            };
        };
    } catch (error) {
        console.log(error);
    };
};

/*
exports.otplogin = async ({ body }) => {
    try {
        let user;
        if (body.phone) {
            const findPhone = await userModel.findOne({ phone: body.phone });
            if (findPhone) user = findPhone
        }

        // bhajeo otp

        if (user) {
            if (user.otp === body.otp) {
                const token = jwt.sign({ _id: user._id }, process.env.SECRET);
                body.token = token;
                const loggeduser = await userModel.findOne({ phone: body.phone }, body);
                return {
                    statusCode: 200,
                    status: true,
                    message: "Otp Matched",
                    data: loggeduser
                }
            }
        } else {
            return {
                statusCode: 400,
                status: false,
                message: "User Not Found!",
                data: []
            }
        }
    } catch (error) {
        
    }
}*/

exports.login = async ({ body, headers }) => {
    try {
        let filter = {}
        if (headers.tendentId) {
            filter.tendentId = headers.tendentId;
        }
        const { email, password, phone } = body;
        if (email) {
            const user = await userModel.findOne({ email: body.email, ...filter });
            if (user) {
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
                    const up = await userModel.findOneAndUpdate({ _id: user._id, tendentId: headers.tendentId }, { auth: token }, { new: true });
                    if (up) {
                        return {
                            statusCode: 200,
                            status: true,
                            message: "Login Successfully !",
                            data: [user, { auth: token }]
                        };
                    }
                } else {
                    return {
                        statusCode: 400,
                        status: false,
                        message: "Invalid Login  Details !",
                        data: []
                    };
                };
            } else {
                return {
                    statusCode: 400,
                    status: false,
                    message: "Invalid Login  Details !",
                    data: []
                };
            };
        };

        if (phone) {
            const user = await userModel.findOneAndUpdate({ phone: body.phone, ...filter }, { $set: { otp: "1234" } }, { new: true });
            const data = await userModel.findOne({ phone: body.phone, ...filter });
            if (data) {
                return {
                    statusCode: 200,
                    status: true,
                    message: "Otp Send",
                    data: [data]
                };
            } else {
                return {
                    statusCode: 400,
                    status: false,
                    message: "Invalid Phone Number Not Matched!",
                    data: []
                };
            };
        };
    } catch (error) {
        console.log(error);
    };
};

exports.loginOtpVerify = async ({ body, headers }) => {
    try {
        let tendentId = headers.tendentId;
        const { phone, otp } = body;
        const user = await userModel.findOne({ phone, tendentId });
        if (user) {
            if (otp == user.otp) {
                const user = await userModel.findOneAndUpdate({ phone: body.phone, tendentId }, { $set: { otp: "" } }, { new: true });
                const token = jwt.sign({ _id: user._id }, process.env.SECRET);
                if (user) {
                    const up = await userModel.findOneAndUpdate({ _id: user._id, tendentId }, { auth: token }, { new: true });
                    if (up) {
                        return {
                            statusCode: 200,
                            status: true,
                            message: "Phone Login Successfully !",
                            data: [user, { auth: token }]
                        };
                    }
                };
            } else {
                return {
                    statusCode: 400,
                    status: false,
                    message: "Invalid Otp",
                    data: []
                };
            };
        } else {
            return {
                statusCode: 400,
                status: false,
                message: "Invalid Phone Number Not Matched!",
                data: []
            };
        };
    } catch (error) {
        console.log(error);
    };
};

exports.user_Profile = async ({ user, query, headers }) => {
    try {
        if (user) {
            let condition = []
            condition.push({
                '$match': {
                    '_id': user._id,
                    'tendentId': mongoose.Types.ObjectId(headers.tendentId)
                }
            })
            if (query.Transaction != undefined && query.Transaction != "") {
                condition.push({
                    '$lookup': {
                        'from': 'refertransactions',
                        'localField': '_id',
                        'foreignField': 'userId',
                        'pipeline': [
                            {
                                '$lookup': {
                                    'from': 'refers',
                                    'localField': 'referPlanId',
                                    'foreignField': '_id',
                                    'as': 'referPlanId'
                                }
                            }, {
                                '$unwind': {
                                    'path': '$referPlanId'
                                }
                            }, {
                                '$replaceRoot': {
                                    'newRoot': '$referPlanId'
                                }
                            }
                        ],
                        'as': 'referTransactions'
                    }
                })
            }
            const FindData = await userModel.aggregate(condition)
            return {
                statusCode: 200,
                status: true,
                message: "user-Profile !",
                data: FindData
            };
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

exports.userEditProfile = async ({ body, user, file, headers }) => {
    try {
        let obj = {};
        const tendentId = headers.tendentId;
        if (body.name) {
            obj.name = body.name;
        };
        if (body.phone) {
            obj.phone = body.phone;
        };
        if (body.email) {
            obj.email = body.email;
        };
        if (body.gender) {
            obj.gender = body.gender;
        };
        if (body.dateOfBirth) {
            obj.dateOfBirth = body.dateOfBirth;
        };
        if (file) {
            obj.image = `${process.env.url}/uploads/${file.filename}`;
        };

        const result = await userModel.findOneAndUpdate({ _id: user._id, tendentId }, { $set: obj }, { new: true });
        if (result) {
            return {
                statusCode: 200,
                status: true,
                message: "User Profile Update Successfully !",
                data: [result]
            };
        } else {
            return {
                statusCode: 400,
                status: false,
                message: "User Profile Not Update !",
                data: []
            };
        };
    } catch (error) {
        console.log(error);
    };
};

exports.logOut = async (req, res) => {
    try {
        if (req.cookies != undefined && req.cookies) {
            res.clearCookie("", 'token', { expires: new Date(0) });
        };
        return {
            statusCode: 200,
            status: true,
            message: "User log-Out Successfully !",
            data: []
        };
    } catch (error) {
        console.log(error);
    };
};


exports.EditUserProfile = async ({ user, file, headers }) => {
    try {
        if (file.filename != undefined && file.filename != "") {
            const tendentId = headers.tendentId;
            const result = await userModel.findOneAndUpdate({ _id: user._id, tendentId }, { image: `${process.env.url}/uploads/${file.filename}` }, { new: true });
            if (result) {
                return {
                    statusCode: 200,
                    status: true,
                    message: "User Profile Update Successfully !",
                    data: [result]
                };
            } else {
                return {
                    statusCode: 400,
                    status: false,
                    message: "User Profile Not Update !",
                    data: []
                };
            };
        } else {
            return {
                statusCode: 400,
                status: false,
                message: "input Profile photo !",
                data: []
            };
        };
    } catch (error) {
        console.log(error);
    };
};

exports.about = async (req, res) => {
    try {
        const tendentId = req.headers.tendentId;
        const websiteData = await appServices.index({ tendentId });
        const aboutData = await aboutModel.findOne({ tendentId }).lean();
        const data = {
            ...websiteData,
            title: aboutData?.title || "",
            description: aboutData?.description || "",
        };
        res.render('about', { data, tendentId })
    } catch (error) {
        console.log(error);
    };
};
