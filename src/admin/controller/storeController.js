const saloon = require("../../models/saloonStoreModel");
const mongoose = require('mongoose');
const users = require("../../models/userModel");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const findStoreRecord = async (id) => {
    if (!isValidObjectId(id)) return null;
    const objectId = mongoose.Types.ObjectId(id);
    return saloon.findOne({ _id: objectId });
};

exports.businessOtpSent = async (req, res) => {
    try {
        const phone = Number(req.body?.phone);
        if (!phone) {
            return res.status(400).send({ status: false, message: "Phone is required", data: [] });
        }

        let user = await users.findOne({ phone });
        if (user) {
            user = await users.findOneAndUpdate({ phone }, { otp: "1234" }, { new: true });
        } else {
            user = await users.create({ phone, otp: "1234" });
        }

        return res.send({
            statusCode: 200,
            status: true,
            message: "Otp Send",
            data: [user]
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: false, message: "Unable to send otp", data: [] });
    }
};

exports.businessOtpVerify = async (req, res) => {
    try {
        const phone = Number(req.body?.phone);
        const otp = String(req.body?.otp || "");
        if (!phone || !otp) {
            return res.status(400).send({ status: false, message: "Phone and otp are required", data: [] });
        }

        const user = await users.findOne({ phone });
        if (!user) {
            return res.status(400).send({ status: false, message: "Phone Number Not Matched!", data: [] });
        }
        if (String(user.otp) !== otp) {
            return res.status(400).send({ status: false, message: "Otp Not Matched", data: [] });
        }

        const updated = await users.findOneAndUpdate({ phone }, { $set: { verify: true } }, { new: true });
        return res.send({
            statusCode: 200,
            status: true,
            message: "Otp Matched",
            data: [updated]
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: false, message: "Unable to verify otp", data: [] });
    }
};

exports.saloonRegister = async (req, res) => {
    try {
       
        res.locals.message = req.flash()
        let saloon_data;
        if (req.query.id) {
            if (!isValidObjectId(req.query.id)) {
                req.flash("error", "Invalid store id.");
                return res.redirect("/add-saloon");
            }
            saloon_data = await findStoreRecord(req.query.id);
            if (!saloon_data) {
                req.flash("error", "Store not found.");
                return res.redirect("/add-saloon");
            }
        }
        return res.render("add_saloon/saloon-Register", { user: req.user, data: saloon_data })
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to load store form.");
        return res.redirect("/add-saloon");
    }
}

// step 1
exports.addSaloonStore = async (req, res) => {
    try {
        res.locals.message = req.flash();
        const { body, query, user } = req;
        const {
            storeName, email, Phone, confromPassword, password, ownerName, type, category,
            Partner_Size, aria, pincode, city, state, description
        } = body;

        if (query.id) {
            if (!isValidObjectId(query.id)) {
                req.flash("error", "Invalid store id.");
                return res.redirect("/add-saloon");
            }

            const existingStore = await saloon.findById(query.id);
            if (!existingStore) {
                req.flash("error", "Store not found.");
                return res.redirect("/add-saloon");
            }

            const duplicateName = await saloon.findOne({ storeName, _id: { $ne: existingStore._id } });
            if (duplicateName) {
                req.flash("error", "storeName Already Exists");
                return res.redirect(`/add-saloon?id=${existingStore._id}`);
            }

            const duplicateEmail = await saloon.findOne({ email, _id: { $ne: existingStore._id } });
            if (duplicateEmail) {
                req.flash("error", "email Already Exists");
                return res.redirect(`/add-saloon?id=${existingStore._id}`);
            }

            const duplicatePhone = await saloon.findOne({ Phone, _id: { $ne: existingStore._id } });
            if (duplicatePhone) {
                req.flash("error", "Phone Already Exists");
                return res.redirect(`/add-saloon?id=${existingStore._id}`);
            }

            const updatePayload = {
                storeName,
                email,
                Phone,
                ownerName,
                type,
                category,
                Partner_Size,
                description,
                location: { aria, pincode, city, state }
            };

            if (password) {
                updatePayload.password = password;
            }

            const updated = await saloon.findByIdAndUpdate(existingStore._id, updatePayload, { new: true });
            req.flash("success", "saloon update successfully step-1");
            return res.redirect(`/add-saloon?id=${updated._id}`);
        } else {
            if (!storeName || !email || !Phone || !ownerName) {
                req.flash("error", "Please fill all required fields.");
                return res.redirect("/add-saloon");
            }
            if (password !== confromPassword) {
                req.flash("error", "password not match");
                return res.redirect("/add-saloon");
            }

            const duplicateName = await saloon.findOne({ storeName });
            if (duplicateName) {
                req.flash("error", "storeName Already Exists");
                return res.redirect("/add-saloon");
            }
            const duplicateEmail = await saloon.findOne({ email });
            if (duplicateEmail) {
                req.flash("error", "email Already Exists");
                return res.redirect("/add-saloon");
            }
            const duplicatePhone = await saloon.findOne({ Phone });
            if (duplicatePhone) {
                req.flash("error", "Phone Already Exists");
                return res.redirect("/add-saloon");
            }

            const created = await saloon.create({
                userId: user?._id || null,
                storeName,
                email,
                Phone,
                password,
                ownerName,
                type,
                category,
                Partner_Size,
                location: { aria, pincode, city, state },
                description
            });
            req.flash("success", "Store added successfully.");
            return res.redirect(`/add-saloon?id=${created._id}`);
        }
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to save store details.");
        return res.redirect("/add-saloon");
    }
}


// step 2
exports.businessProfile = async (req, res) => {
    try {
        res.locals.message = req.flash();
        if (!req.query.id || !isValidObjectId(req.query.id)) {
            req.flash("error", "Invalid store id.");
            return res.redirect("/add-saloon");
        }
        const find = await findStoreRecord(req.query.id);
        if (!find) {
            req.flash("error", "Store not found.");
            return res.redirect("/add-saloon");
        }

        const updated = await saloon.findByIdAndUpdate(
            find._id,
            { ProfileInfo: req.body },
            { new: true }
        );

        req.flash("success", "update is Succesfuuly step 2");
        return res.redirect(`/add-saloon?id=${updated._id}`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to save business profile info.");
        return res.redirect("/add-saloon");
    }
}

// step 3
exports.businessBankInfoAdmin = async (req, res) => {
    try {
        res.locals.message = req.flash()
        if (!req.query.id || !isValidObjectId(req.query.id)) {
            req.flash("error", "Invalid store id.");
            return res.redirect("/add-saloon");
        }
        const find = await findStoreRecord(req.query.id);
        if (!find) {
            req.flash("error", "Store not found.");
            return res.redirect("/add-saloon");
        }

        const updated = await saloon.findByIdAndUpdate(
            find._id,
            { BankInfo: req.body },
            { new: true }
        );

        req.flash("success", "update is Succesfuuly step 3");
        return res.redirect(`/add-saloon?id=${updated._id}`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to save bank info.");
        return res.redirect("/add-saloon");
    }
}

// step 4
exports.businessUplodeDocumentAdmin = async (req, res) => {
    try {
        res.locals.message = req.flash()
        if (!req.query.id || !isValidObjectId(req.query.id)) {
            req.flash("error", "Invalid store id.");
            return res.redirect("/add-saloon");
        }
        const find = await findStoreRecord(req.query.id);
        if (!find) {
            req.flash("error", "Store not found.");
            return res.redirect("/add-saloon");
        }
        const files = req.files || {};
        const documents = {
            BannerLogo: files.BannerLogo?.[0]?.filename || find.uplodeDocuments?.BannerLogo || "",
            logoImage: files.logoImage?.[0]?.filename || find.uplodeDocuments?.logoImage || "",
            panImage: files.panImage?.[0]?.filename || find.uplodeDocuments?.panImage || "",
            businessCertificate: files.businessCertificate?.[0]?.filename || find.uplodeDocuments?.businessCertificate || "",
        };

        if (!documents.BannerLogo || !documents.logoImage || !documents.panImage || !documents.businessCertificate) {
            req.flash("error", "All document images are required.");
            return res.redirect(`/add-saloon?id=${find._id}`);
        }

        const updated = await saloon.findByIdAndUpdate(
            find._id,
            { uplodeDocuments: documents },
            { new: true }
        );

        req.flash("success", "update is Succesfuuly STEP 4");
        return res.redirect(`/add-saloon?id=${updated._id}`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to upload documents.");
        return res.redirect("/add-saloon");
    }
}

exports.viewSaloon = async (req, res) => {
    try {
        return res.redirect("/add-saloon");
    } catch (error) {
        console.log(error)
        req.flash("error", "Unable to load stores.");
        return res.redirect("/add-saloon");

    }
}



exports.deleteSaloon = async (req, res) => {
    try {
        const id = req.query.id;
        if (!isValidObjectId(id)) {
            req.flash("error", "Invalid store id.");
            return res.redirect("/add-saloon");
        }
        const deleted = await saloon.findByIdAndDelete({ _id: id });
        if (deleted) {
            req.flash("success", "Store deleted successfully.");
        } else {
            req.flash("error", "Store not found.");
        }
        return res.redirect("/add-saloon")
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to delete store.");
        return res.redirect("/add-saloon");
    }
}




exports.getSaloonAddress = async (req, res) => {
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
exports.findAdminAllSaloon = async (req, res) => {
    try {
        const data = await saloon.find()
        return res.send(data)
    } catch (error) {
        console.log(error)
    }
}

exports.addImagesInSaloon = async (req, res) => {
    try {
        if (!isValidObjectId(req.query.id)) {
            req.flash("error", "Invalid store id.");
            return res.redirect("/add-saloon");
        }
        if (!req.files || req.files.length === 0) {
            req.flash("error", "Please upload at least one image.");
            return res.redirect(`/add-saloon?id=${req.query.id}`);
        }
        let arr = [];
        req.files.forEach(element => {
            arr.push(`${process.env.url}/uploads/${element.filename}`)
        });
        const result = await saloon.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.query.id) }, { image: arr }, { new: true })

        if (result) {
            req.flash("success", "Store images updated successfully.");
            return res.redirect(`/add-saloon?id=${req.query.id}`)
        } else {
            req.flash("error", "Store not found.");
            return res.redirect("/add-saloon")
        }

    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to update store images.");
        return res.redirect("/add-saloon");
    }
}

