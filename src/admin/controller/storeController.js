const saloon = require("../../api/saloonstore/model");
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const saloonRequst = require("../../api/Partner/model")
const { getAllSaloonRequistCity, getAllSaloonCity } = require("../../api/saloonstore/controller")
const userm = require("../../models/userModel")

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const findStoreRecord = async (id) => {
    if (!isValidObjectId(id)) return null;
    const objectId = mongoose.Types.ObjectId(id);
    const findSaloon = await saloon.findOne({ _id: objectId });
    if (findSaloon) return findSaloon;
    return saloonRequst.findOne({ _id: objectId });
};

const findPrimaryStore = async (req) => {
    if (req.user?.type === "admin") {
        return saloon.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    }
    return saloon.findOne({}).sort({ createdAt: -1 });
};


exports.saloonRegister = async (req, res) => {
    try {
       
        res.locals.message = req.flash()
        let saloon_data;
        if (req.query.id) {
            if (!isValidObjectId(req.query.id)) {
                req.flash("error", "Invalid store id.");
                return res.redirect("/add_saloon");
            }
            saloon_data = await findStoreRecord(req.query.id);
            if (!saloon_data) {
                req.flash("error", "Store not found.");
                return res.redirect("/add_saloon");
            }
        } else {
            saloon_data = await findPrimaryStore(req);
        }
        return res.render("add_saloon/saloon-Register", { user: req.user, data: saloon_data })
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to load store form.");
        return res.redirect("/add_saloon");
    }
}

const { businessSignUp, businessProfileInfo, businessBankInfo, businessUplodeDocument } = require("../../api/Partner/controller")

// step 1
exports.ADD_SALOON_STORE = async (req, res) => {
    try {
        res.locals.message = req.flash()
        //  console.log("hjvh",req.query,"jh",req.body)
        // jghjhn
        const businessSign = await businessSignUp(req)
        if (businessSign.statusCode == 200 && businessSign.status == true) {
            req.flash("success", businessSign.message)
            res.redirect(`/add_saloon?id=${businessSign.data[0]._id}`)
        } else {
            req.flash("error", businessSign.message)
            res.redirect(`/add_saloon`)
        }
    } catch (error) {
        console.log(error);
    }
}


// step 2
exports.businessProfile = async (req, res) => {
    try {
        res.locals.message = req.flash();
        if (!req.query.id || !isValidObjectId(req.query.id)) {
            req.flash("error", "Invalid store id.");
            return res.redirect("/add_saloon");
        }
        const find = await findStoreRecord(req.query.id);
        if (!find) {
            req.flash("error", "Store not found.");
            return res.redirect("/add_saloon");
        }
        const businessP = await businessProfileInfo(req)
        if (businessP.statusCode == 200 && businessP.status == true) {
            req.flash("success", businessP.message)
            return res.redirect(`/add_saloon?id=${businessP.data[0]._id}`)
        } else {
            req.flash("error", businessP.message)
            return res.redirect(`/add_saloon?id=${find._id}`)
        }
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to save business profile info.");
        return res.redirect("/add_saloon");
    }
}

// step 3
exports.businessBankInfoAdmin = async (req, res) => {
    try {
        res.locals.message = req.flash()
        if (!req.query.id || !isValidObjectId(req.query.id)) {
            req.flash("error", "Invalid store id.");
            return res.redirect("/add_saloon");
        }
        const find = await findStoreRecord(req.query.id);
        if (!find) {
            req.flash("error", "Store not found.");
            return res.redirect("/add_saloon");
        }

        const businessP = await businessBankInfo(req)
        if (businessP.statusCode == 200 && businessP.status == true) {
            req.flash("success", businessP.message)
            return res.redirect(`/add_saloon?id=${businessP.data[0]._id}`)
        } else {
            req.flash("error", businessP.message)
            return res.redirect(`/add_saloon?id=${find._id}`)
        }
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to save bank info.");
        return res.redirect("/add_saloon");
    }
}

// step 4
exports.businessUplodeDocumentAdmin = async (req, res) => {
    try {
        res.locals.message = req.flash()
        if (!req.query.id || !isValidObjectId(req.query.id)) {
            req.flash("error", "Invalid store id.");
            return res.redirect("/add_saloon");
        }
        const find = await findStoreRecord(req.query.id);
        if (!find) {
            req.flash("error", "Store not found.");
            return res.redirect("/add_saloon");
        }

        const businessP = await businessUplodeDocument(req)
        if (businessP.statusCode == 200 && businessP.status == true) {
            // res.redirect(`/document-uplode?id=${find._id}`)
            req.flash("success", businessP.message);
            return res.redirect(`/add_saloon?id=${find._id}`)
        } else {
            req.flash("error", businessP.message)
            return res.redirect(`/add_saloon?id=${find._id}`)
        }
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to upload documents.");
        return res.redirect("/add_saloon");
    }
}

exports.VIEW_SALOON = async (req, res) => {
    try {
        const store = await findPrimaryStore(req);
        if (store) {
            return res.redirect(`/add_saloon?id=${store._id}`);
        }
        return res.redirect("/add_saloon");
    } catch (error) {
        console.log(error)
        req.flash("error", "Unable to load stores.");
        return res.redirect("/add_saloon");

    }
}



exports.DELETE_SALOON = async (req, res) => {
    try {
        const id = req.query.id;
        if (!isValidObjectId(id)) {
            req.flash("error", "Invalid store id.");
            return res.redirect("/add_saloon");
        }
        const deleted = await saloon.findByIdAndDelete({ _id: id });
        if (deleted) {
            req.flash("success", "Store deleted successfully.");
        } else {
            req.flash("error", "Store not found.");
        }
        return res.redirect("/add_saloon")
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to delete store.");
        return res.redirect("/add_saloon");
    }
}




exports.GetSaloonAddress = async (req, res) => {
    try {
        if (!isValidObjectId(req.query.id)) {
            return res.status(400).send([]);
        }
        const FindData = await saloon.find({ _id: mongoose.Types.ObjectId(req.query.id) })
        if (FindData) {
            return res.send(FindData)
        }
        return res.send([]);
    } catch (error) {
        console.log(error);
        return res.status(500).send([]);
    }
}



exports.viewsSaloonRequest = async (req, res) => {
    try {
        res.locals.message = req.flash();
        let condition = [];
        const user = req.user
        let match = {}
        if (req.query.city != undefined && req.query.city != "") {
            match['location.city'] = req.query.city
        }
        if (req.query.Phone != undefined && req.query.Phone != "") {
            match.Phone = { $eq: Number(req.query.Phone) }
        }
        if (req.query.email != undefined && req.query.email != "") {
            match.email = { $regex: req.query.email, $options: 'i' }
        }
        if (req.query.status != undefined && req.query.status != "") {
            match.status = req.query.status
        } else {
            match.status = "pending"
        }
        condition.push({
            '$match': match
        })
        condition.push({
            '$lookup': {
                'from': 'users',
                'localField': 'userId',
                'foreignField': '_id',
                'pipeline': [
                    {
                        '$project': {
                            'name': 1
                        }
                    }
                ],
                'as': 'result'
            }
        }, {
            '$addFields': {
                'name': {
                    '$getField': {
                        'field': 'name',
                        'input': {
                            '$arrayElemAt': [
                                '$result', 0
                            ]
                        }
                    }
                }
            }
        }
        )
        const data = await saloonRequst.aggregate(condition)
        const FindAllcity = await getAllSaloonRequistCity(req)
        if (data && FindAllcity) {
            res.render("add_saloon/views-saloon-request", { user, data, query: req.query, city: FindAllcity.data })
        } else {
            res.redirect("/")
        }
    } catch (error) {
        console.log(error)

    }
}


exports.saloonApproval = async (req, res) => {
    try {
        if (req.query.id != undefined && req.query.id != "") {
            const _id = mongoose.Types.ObjectId(req.query.id)
            const findSloonRequist = await saloonRequst.findOne({ _id })

            let ovh = {};
            ovh.shopNumber = findSloonRequist.shopNumber
            ovh.aria = findSloonRequist.aria
            ovh.pincode = findSloonRequist.pincode
            ovh.city = findSloonRequist.city
            ovh.state = findSloonRequist.state

            let saloon_details = new saloon({
                userId: findSloonRequist.userId,
                storeName: findSloonRequist.storeName,
                ownerName: findSloonRequist.ownerName,
                password: findSloonRequist.password,
                email: findSloonRequist.email,
                Phone: findSloonRequist.Phone,
                location: {
                    aria: findSloonRequist.location.aria,
                    pincode: findSloonRequist.location.pincode,
                    city: findSloonRequist.location.city,
                    state: findSloonRequist.location.state,
                },
                category: findSloonRequist.category,
                status: findSloonRequist.status,
                Partner_Size: findSloonRequist.Partner_Size,
                ProfileInfo: {
                    yourService: findSloonRequist.ProfileInfo.yourService,
                    alternatePhone: findSloonRequist.ProfileInfo.alternatePhone,
                    starting_time: findSloonRequist.ProfileInfo.starting_time,
                    ending_time: findSloonRequist.ProfileInfo.ending_time,
                    workingday: findSloonRequist.ProfileInfo.workingday,
                    FaceBookProfile: findSloonRequist.ProfileInfo.FaceBookProfile,
                    instaProfile: findSloonRequist.ProfileInfo.instaProfile,
                    webProfile: findSloonRequist.ProfileInfo.webProfile,
                    amenities: findSloonRequist.ProfileInfo.amenities,
                },
                BankInfo: {
                    panNo: findSloonRequist.BankInfo.panNo,
                    gstNo: findSloonRequist.BankInfo.gstNo,
                    bankName: findSloonRequist.BankInfo.bankName,
                    branchName: findSloonRequist.BankInfo.branchName,
                    accountNo: findSloonRequist.BankInfo.accountNo,
                    accoutHolder: findSloonRequist.BankInfo.accoutHolder,
                    ifscCode: findSloonRequist.BankInfo.ifscCode,
                    kyc: findSloonRequist.BankInfo.kyc,
                },
                uplodeDocuments: {
                    BannerLogo: findSloonRequist.uplodeDocuments.BannerLogo,
                    logoImage: findSloonRequist.uplodeDocuments.logoImage,
                    panImage: findSloonRequist.uplodeDocuments.panImage,
                    businessCertificate: findSloonRequist.uplodeDocuments.businessCertificate,
                },

            });
            const result = await saloon_details.save();
            if (result) {
                req.result = result
                await this.saloonRequistDelete(req, res)
            };
        } else {
            res.redirect("/views-saloon-request")
        }
    } catch (error) {
        console.log(error);
        ;
    }
}

exports.saloonRequistDelete = async (req, res) => {
    try {
        res.locals.message = req.flash();
        if (req.query.id != undefined && req.query.id != "") {
            // const _id = mongoose.Types.ObjectId(req.query.id)
            const result = await saloonRequst.findByIdAndUpdate({ _id: req.query.id }, { status: "rejected" }, { new: true });
            if (result) {
                if (req.result) {
                    req.flash("success", "Saloon Request Approval !");
                    res.redirect("/views-saloon-request");
                } else {
                    req.flash("error", "Saloon Request Rejected !");
                    res.redirect("/views-saloon-request");
                };
            };
        } else {
            res.redirect("/views-saloon-request");
        }
    } catch (error) {
        console.log(error);
        ;
    }
}

exports.findAddSaloonRequist = async (req, res) => {
    try {
        const id = req.query.id
        const FindData = await saloonRequst.find({ _id: mongoose.Types.ObjectId(id) })
        if (FindData) {
            res.send(FindData)
        }
    } catch (error) {
        console.log(error)
    }
}

exports.findSaloonByUser = async (req, res) => {
    try {
        // const finduser = await saloon.aggregate([
        //     {
        //         '$lookup': {
        //             'from': 'users',
        //             'localField': 'userId',
        //             'foreignField': '_id',
        //             'as': 'user'
        //         }
        //     }, {
        //         '$group': {
        //             '_id': '$userId'
        //         }
        //     }
        // ])


        // let arrr = []
        // for (const element of finduser) {
        //     arrr.push(element._id)
        // }
        // const upfate = await userm.updateMany({ _id: { $nin: arrr }, type: { $ne: "block-User" }, type: { $ne: "super-admin" } }, { type: "user" })
        // jghj

        const findSaloon = await saloon.find({ userId: mongoose.Types.ObjectId(req.query.id) })

    } catch (error) {
        console.log(error)
    }
}
exports.FindAdminAllSaloon = async (req, res) => {
    try {
        let data;
        if (req.user.type == "admin") {
            data = await saloon.find({ userId: req.user._id })
        } else {
            data = await saloon.find()
        }
        return res.send(data)
    } catch (error) {
        console.log(error)
    }
}

exports.addImagesInSaloon = async (req, res) => {
    try {
        if (!isValidObjectId(req.query.id)) {
            req.flash("error", "Invalid store id.");
            return res.redirect("/add_saloon");
        }
        if (!req.files || req.files.length === 0) {
            req.flash("error", "Please upload at least one image.");
            return res.redirect(`/add_saloon?id=${req.query.id}`);
        }
        let arr = [];
        req.files.forEach(element => {
            arr.push(`${process.env.url}/uploads/${element.filename}`)
        });
        const result = await saloon.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.query.id) }, { image: arr }, { new: true })

        if (result) {
            req.flash("success", "Store images updated successfully.");
            return res.redirect(`/add_saloon?id=${req.query.id}`)
        } else {
            req.flash("error", "Store not found.");
            return res.redirect("/add_saloon")
        }

    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to update store images.");
        return res.redirect("/add_saloon");
    }
}
