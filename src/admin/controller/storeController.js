const saloon = require("../../models/saloonStoreModel");
const mongoose = require('mongoose');
const users = require("../../models/userModel");
const adminUsers = require("../../models/adminModel");
const productModel = require("../../models/productModel");
const productPackageModel = require("../../models/productPackageModel");
const bcrypt = require("bcrypt");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const getNormalizedRole = (value) => String(value || "").toLowerCase();
const isAdminRole = (value) => getNormalizedRole(value) === "admin";
const getStoreScopeForUser = (user) => (isAdminRole(user?.type) ? { userId: user?._id } : {});

const findStoreRecord = async (id) => {
    if (!isValidObjectId(id)) return null;
    const objectId = mongoose.Types.ObjectId(id);
    return saloon.findOne({ _id: objectId });
};

const upsertSaloonAdminUser = async ({ ownerName, email, phone, password, tendentId }) => {
    const normalizedPhone = Number(phone);
    const condition = {
        $or: [{ email }, { phone: normalizedPhone }]
    };
    const payload = {
        name: ownerName || "",
        email,
        phone: normalizedPhone,
        type: "ADMIN",
        verify: true,
        tendentId: tendentId || null,
    };

    if (password) {
        payload.password = bcrypt.hashSync(password, 10);
    }

    const existingAdmin = await adminUsers.findOne(condition);
    if (existingAdmin) {
        return adminUsers.findByIdAndUpdate(existingAdmin._id, payload, { new: true });
    }

    return adminUsers.create(payload);
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
            let body = { tendentId: req.headers['tendentId'], phone, otp: "1234" }
            user = await users.create(body);
        }

        return res.send({
            statusCode: 200,
            status: true,
            message: "Otp Send",
            data: [user]
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: false,
            message: error.message,
            data: []
        });
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
        const storeScope = getStoreScopeForUser(req.user);

        if (!req.query.id && isAdminRole(req.user?.type)) {
            const adminStores = await saloon
                .find(storeScope)
                .select({ _id: 1 })
                .sort({ createdAt: -1 })
                .limit(2);

            if (adminStores.length === 1) {
                return res.redirect(`/admin/add-saloon?id=${adminStores[0]._id}`);
            }
        }

        if (req.query.id) {
            if (!isValidObjectId(req.query.id)) {
                req.flash("error", "Invalid store id.");
                return res.redirect("/admin/add-saloon");
            }
            saloon_data = await saloon.findOne({ _id: mongoose.Types.ObjectId(req.query.id), ...storeScope });
            if (!saloon_data) {
                req.flash("error", "Store not found.");
                return res.redirect("/admin/add-saloon");
            }
        }
        return res.render("add_saloon/saloon-Register", { user: req.user, data: saloon_data })
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to load store form.");
        return res.redirect("/admin/add-saloon");
    }
}

// step 1
exports.addSaloonStore = async (req, res) => {
    try {
        res.locals.message = req.flash();
        const { body, query, user } = req;
        const storeScope = getStoreScopeForUser(user);
        const {
            storeName, email, Phone, confromPassword, password, ownerName, type, category,
            Partner_Size, aria, pincode, city, state, description
        } = body;

        if (query.id) {
            if (!isValidObjectId(query.id)) {
                req.flash("error", "Invalid store id.");
                return res.redirect("/admin/add-saloon");
            }

            const existingStore = await saloon.findOne({ _id: query.id, ...storeScope });
            if (!existingStore) {
                req.flash("error", "Store not found.");
                return res.redirect("/admin/add-saloon");
            }

            const duplicateName = await saloon.findOne({ storeName, _id: { $ne: existingStore._id } });
            if (duplicateName) {
                req.flash("error", "storeName Already Exists");
                return res.redirect(`/admin/add-saloon?id=${existingStore._id}`);
            }

            const duplicateEmail = await saloon.findOne({ email, _id: { $ne: existingStore._id } });
            if (duplicateEmail) {
                req.flash("error", "email Already Exists");
                return res.redirect(`/admin/add-saloon?id=${existingStore._id}`);
            }

            const duplicatePhone = await saloon.findOne({ Phone, _id: { $ne: existingStore._id } });
            if (duplicatePhone) {
                req.flash("error", "Phone Already Exists");
                return res.redirect(`/admin/add-saloon?id=${existingStore._id}`);
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
            return res.redirect(`/admin/add-saloon?id=${updated._id}`);
        } else {
            if (!storeName || !email || !Phone || !ownerName) {
                req.flash("error", "Please fill all required fields.");
                return res.redirect("/admin/add-saloon");
            }
            if (!password) {
                req.flash("error", "Password is required.");
                return res.redirect("/admin/add-saloon");
            }
            if (password !== confromPassword) {
                req.flash("error", "password not match");
                return res.redirect("/admin/add-saloon");
            }

            const duplicateName = await saloon.findOne({ storeName });
            if (duplicateName) {
                req.flash("error", "storeName Already Exists");
                return res.redirect("/admin/add-saloon");
            }
            const duplicateEmail = await saloon.findOne({ email });
            if (duplicateEmail) {
                req.flash("error", "email Already Exists");
                return res.redirect("/admin/add-saloon");
            }
            const duplicatePhone = await saloon.findOne({ Phone });
            if (duplicatePhone) {
                req.flash("error", "Phone Already Exists");
                return res.redirect("/admin/add-saloon");
            }

            const createdAdmin = await upsertSaloonAdminUser({
                ownerName,
                email,
                phone: Phone,
                password,
                tendentId: req.headers['tendentId'] || null,
            });

            const created = await saloon.create({
                tendentId: req.headers['tendentId'] || null,
                userId: createdAdmin?._id || user?._id || null,
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
            return res.redirect(`/admin/add-saloon?id=${created._id}`);
        }
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to save store details.");
        return res.redirect("/admin/add-saloon");
    }
}


// step 2
exports.businessProfile = async (req, res) => {
    try {
        res.locals.message = req.flash();
        const storeScope = getStoreScopeForUser(req.user);
        if (!req.query.id || !isValidObjectId(req.query.id)) {
            req.flash("error", "Invalid store id.");
            return res.redirect("/admin/add-saloon");
        }
        const find = await saloon.findOne({ _id: mongoose.Types.ObjectId(req.query.id), ...storeScope });
        if (!find) {
            req.flash("error", "Store not found.");
            return res.redirect("/admin/add-saloon");
        }

        const updated = await saloon.findByIdAndUpdate(
            find._id,
            { ProfileInfo: req.body },
            { new: true }
        );

        req.flash("success", "update is Succesfuuly step 2");
        return res.redirect(`/admin/add-saloon?id=${updated._id}`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to save business profile info.");
        return res.redirect("/admin/add-saloon");
    }
}

// step 3
exports.businessBankInfoAdmin = async (req, res) => {
    try {
        res.locals.message = req.flash()
        const storeScope = getStoreScopeForUser(req.user);
        if (!req.query.id || !isValidObjectId(req.query.id)) {
            req.flash("error", "Invalid store id.");
            return res.redirect("/admin/add-saloon");
        }
        const find = await saloon.findOne({ _id: mongoose.Types.ObjectId(req.query.id), ...storeScope });
        if (!find) {
            req.flash("error", "Store not found.");
            return res.redirect("/admin/add-saloon");
        }

        const updated = await saloon.findByIdAndUpdate(
            find._id,
            { BankInfo: req.body },
            { new: true }
        );

        req.flash("success", "update is Succesfuuly step 3");
        return res.redirect(`/admin/add-saloon?id=${updated._id}`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to save bank info.");
        return res.redirect("/admin/add-saloon");
    }
}

// step 4
exports.businessUplodeDocumentAdmin = async (req, res) => {
    try {
        res.locals.message = req.flash()
        const storeScope = getStoreScopeForUser(req.user);
        if (!req.query.id || !isValidObjectId(req.query.id)) {
            req.flash("error", "Invalid store id.");
            return res.redirect("/admin/add-saloon");
        }
        const find = await saloon.findOne({ _id: mongoose.Types.ObjectId(req.query.id), ...storeScope });
        if (!find) {
            req.flash("error", "Store not found.");
            return res.redirect("/admin/add-saloon");
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
            return res.redirect(`/admin/add-saloon?id=${find._id}`);
        }

        const updated = await saloon.findByIdAndUpdate(
            find._id,
            { uplodeDocuments: documents },
            { new: true }
        );

        req.flash("success", "update is Succesfuuly STEP 4");
        return res.redirect(`/admin/add-saloon?id=${updated._id}`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to upload documents.");
        return res.redirect("/admin/add-saloon");
    }
}

exports.viewSaloon = async (req, res) => {
    try {
        return res.redirect("/admin/add-saloon");
    } catch (error) {
        console.log(error)
        req.flash("error", "Unable to load stores.");
        return res.redirect("/admin/add-saloon");

    }
}



exports.deleteSaloon = async (req, res) => {
    try {
        const id = req.query.id;
        const storeScope = getStoreScopeForUser(req.user);
        if (!isValidObjectId(id)) {
            req.flash("error", "Invalid store id.");
            return res.redirect("/admin/add-saloon");
        }
        const deleted = await saloon.findOneAndDelete({ _id: id, ...storeScope });
        if (deleted) {
            const storeId = mongoose.Types.ObjectId(id);
            await Promise.all([
                productModel.deleteMany({ saloonStore: storeId }),
                productPackageModel.deleteMany({ saloonStore: storeId }),
            ]);

            if (deleted.userId && isValidObjectId(deleted.userId)) {
                const remainingStoreCount = await saloon.countDocuments({ userId: deleted.userId });
                if (remainingStoreCount === 0) {
                    await adminUsers.findByIdAndDelete(deleted.userId);
                }
            }

            req.flash("success", "Store with related products, packages, and admin user cleanup processed successfully.");
        } else {
            req.flash("error", "Store not found.");
        }
        return res.redirect("/admin/add-saloon")
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to delete store.");
        return res.redirect("/admin/add-saloon");
    }
}




exports.getSaloonAddress = async (req, res) => {
    try {
        const storeScope = getStoreScopeForUser(req.user);
        if (!isValidObjectId(req.query.id)) {
            return res.status(400).send([]);
        }
        const FindData = await saloon.find({ _id: mongoose.Types.ObjectId(req.query.id), ...storeScope })
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
        const storeScope = getStoreScopeForUser(req.user);
        const data = await saloon.find(storeScope)
        return res.send(data)
    } catch (error) {
        console.log(error)
    }
}

exports.addImagesInSaloon = async (req, res) => {
    try {
        const storeScope = getStoreScopeForUser(req.user);
        if (!isValidObjectId(req.query.id)) {
            req.flash("error", "Invalid store id.");
            return res.redirect("/admin/add-saloon");
        }
        if (!req.files || req.files.length === 0) {
            req.flash("error", "Please upload at least one image.");
            return res.redirect(`/admin/add-saloon?id=${req.query.id}`);
        }
        let arr = [];
        req.files.forEach(element => {
            arr.push(`${process.env.url}/uploads/${element.filename}`)
        });
        const result = await saloon.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.query.id), ...storeScope }, { image: arr }, { new: true })

        if (result) {
            req.flash("success", "Store images updated successfully.");
            return res.redirect(`/admin/add-saloon?id=${req.query.id}`)
        } else {
            req.flash("error", "Store not found.");
            return res.redirect("/admin/add-saloon")
        }

    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to update store images.");
        return res.redirect("/admin/add-saloon");
    }
}

