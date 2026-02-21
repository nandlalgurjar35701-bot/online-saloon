const saloon = require("../../api/saloonstore/model");
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const findStoreRecord = async (id) => {
    if (!isValidObjectId(id)) return null;
    const objectId = mongoose.Types.ObjectId(id);
    return saloon.findOne({ _id: objectId });
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

// step 1
exports.ADD_SALOON_STORE = async (req, res) => {
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
                return res.redirect("/add_saloon");
            }

            const existingStore = await saloon.findById(query.id);
            if (!existingStore) {
                req.flash("error", "Store not found.");
                return res.redirect("/add_saloon");
            }

            const duplicateName = await saloon.findOne({ storeName, _id: { $ne: existingStore._id } });
            if (duplicateName) {
                req.flash("error", "storeName Already Exists");
                return res.redirect(`/add_saloon?id=${existingStore._id}`);
            }

            const duplicateEmail = await saloon.findOne({ email, _id: { $ne: existingStore._id } });
            if (duplicateEmail) {
                req.flash("error", "email Already Exists");
                return res.redirect(`/add_saloon?id=${existingStore._id}`);
            }

            const duplicatePhone = await saloon.findOne({ Phone, _id: { $ne: existingStore._id } });
            if (duplicatePhone) {
                req.flash("error", "Phone Already Exists");
                return res.redirect(`/add_saloon?id=${existingStore._id}`);
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
            return res.redirect(`/add_saloon?id=${updated._id}`);
        } else {
            if (!storeName || !email || !Phone || !ownerName) {
                req.flash("error", "Please fill all required fields.");
                return res.redirect("/add_saloon");
            }
            if (password !== confromPassword) {
                req.flash("error", "password not match");
                return res.redirect("/add_saloon");
            }

            const duplicateName = await saloon.findOne({ storeName });
            if (duplicateName) {
                req.flash("error", "storeName Already Exists");
                return res.redirect("/add_saloon");
            }
            const duplicateEmail = await saloon.findOne({ email });
            if (duplicateEmail) {
                req.flash("error", "email Already Exists");
                return res.redirect("/add_saloon");
            }
            const duplicatePhone = await saloon.findOne({ Phone });
            if (duplicatePhone) {
                req.flash("error", "Phone Already Exists");
                return res.redirect("/add_saloon");
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
            return res.redirect(`/add_saloon?id=${created._id}`);
        }
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to save store details.");
        return res.redirect("/add_saloon");
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

        const updated = await saloon.findByIdAndUpdate(
            find._id,
            { ProfileInfo: req.body },
            { new: true }
        );

        req.flash("success", "update is Succesfuuly step 2");
        return res.redirect(`/add_saloon?id=${updated._id}`);
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

        const updated = await saloon.findByIdAndUpdate(
            find._id,
            { BankInfo: req.body },
            { new: true }
        );

        req.flash("success", "update is Succesfuuly step 3");
        return res.redirect(`/add_saloon?id=${updated._id}`);
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
        const files = req.files || {};
        const documents = {
            BannerLogo: files.BannerLogo?.[0]?.filename || find.uplodeDocuments?.BannerLogo || "",
            logoImage: files.logoImage?.[0]?.filename || find.uplodeDocuments?.logoImage || "",
            panImage: files.panImage?.[0]?.filename || find.uplodeDocuments?.panImage || "",
            businessCertificate: files.businessCertificate?.[0]?.filename || find.uplodeDocuments?.businessCertificate || "",
        };

        if (!documents.BannerLogo || !documents.logoImage || !documents.panImage || !documents.businessCertificate) {
            req.flash("error", "All document images are required.");
            return res.redirect(`/add_saloon?id=${find._id}`);
        }

        const updated = await saloon.findByIdAndUpdate(
            find._id,
            { uplodeDocuments: documents },
            { new: true }
        );

        req.flash("success", "update is Succesfuuly STEP 4");
        return res.redirect(`/add_saloon?id=${updated._id}`);
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
