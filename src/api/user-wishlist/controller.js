const mongoose = require("mongoose");
const saloon = require("../../models/saloonStoreModel");
const product = require("../../models/productModel");
const wishlist = require("../../models/wishlistModel");

const toObjectId = (id) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
    return mongoose.Types.ObjectId(id);
};

const getTypeMeta = (type) => {
    if (String(type || "").toLowerCase() === "saloon") {
        return { field: "saloonId", model: saloon, lookupCollection: "saloons" };
    }
    return { field: "productId", model: product, lookupCollection: "products" };
};

exports.userWishlist = async ({ user, query, headers }) => {
    try {
        const id = String(query.id || "").trim();
        const targetId = toObjectId(id);
        if (!targetId) {
            return {
                statusCode: 400,
                status: false,
                message: "please Enter A valid id !",
                data: []
            };
        }

        const tendentId = headers.tendentId;
        const typeMeta = getTypeMeta(query.type);
        const exists = await typeMeta.model.findOne({ _id: targetId, tendentId }).lean();
        if (!exists) {
            return {
                statusCode: 400,
                status: false,
                message: "Item not found !",
                data: []
            };
        }

        let doc = await wishlist.findOne({ userId: user._id, tendentId });
        if (!doc) {
            doc = await wishlist.create({ userId: user._id, tendentId, saloonId: [], productId: [] });
        }

        const existing = Array.isArray(doc[typeMeta.field]) ? doc[typeMeta.field].map((v) => String(v)) : [];
        const key = String(targetId);
        const currentIndex = existing.indexOf(key);
        let added = false;

        if (currentIndex === -1) {
            existing.push(key);
            added = true;
        } else {
            existing.splice(currentIndex, 1);
        }

        doc[typeMeta.field] = existing;
        await doc.save();

        return {
            statusCode: 200,
            status: true,
            message: added ? "Added to wishlist." : "Removed from wishlist.",
            data: [doc],
            wishlist: added
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            status: false,
            message: "Unable to update wishlist.",
            data: []
        };
    }
};

exports.getWishlist = async ({ user, query, headers }) => {
    try {
        const tendentId = headers.tendentId;
        const typeMeta = getTypeMeta(query.type);
        const condition = [{ $match: { userId: user._id, tendentId: mongoose.Types.ObjectId(tendentId) } }];

        const field = typeMeta.field;
        const queryId = toObjectId(String(query.id || "").trim());
        if (queryId) {
            condition.push({
                $match: {
                    [field]: queryId
                }
            });
        }

        condition.push({
            $lookup: {
                from: typeMeta.lookupCollection,
                localField: field,
                foreignField: "_id",
                as: "result"
            }
        });
        condition.push({ $unwind: "$result" });

        if (field === "productId") {
            condition.push({
                $lookup: {
                    from: "saloons",
                    localField: "result.saloonStore",
                    foreignField: "_id",
                    as: "store"
                }
            });
            condition.push({
                $unwind: {
                    path: "$store",
                    preserveNullAndEmptyArrays: true
                }
            });
        }

        const finddata = await wishlist.aggregate(condition);
        return {
            statusCode: 200,
            status: true,
            message: "Wishlist fetched.",
            data: finddata
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            status: false,
            message: "Unable to fetch wishlist.",
            data: []
        };
    }
};

exports.removeStoreFromWishlist = async ({ user, query, headers }) => {
    try {
        const tendentId = headers.tendentId;
        const id = String(query.id || "").trim();
        const targetId = toObjectId(id);
        if (!targetId) {
            return {
                statusCode: 400,
                status: false,
                message: "please Enter valid store id  !",
                data: []
            };
        }

        const typeMeta = getTypeMeta(query.type);
        const doc = await wishlist.findOne({ userId: user._id, tendentId });
        if (!doc) {
            return {
                statusCode: 400,
                status: false,
                message: "wishlist not found !",
                data: []
            };
        }

        const field = typeMeta.field;
        const list = Array.isArray(doc[field]) ? doc[field].map((v) => String(v)) : [];
        const next = list.filter((idVal) => idVal !== String(targetId));
        doc[field] = next;
        await doc.save();

        return {
            statusCode: 200,
            status: true,
            message: "remove Succesfuuly  !",
            data: [doc],
            wishlist: false
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            status: false,
            message: "Unable to update wishlist.",
            data: []
        };
    }
};
