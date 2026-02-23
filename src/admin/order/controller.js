
const { getAllOrder } = require("./services")
const order = require("../../models/orderModel")
const mongoose = require("mongoose")
const { getAllSaloonCity } = require("../../api/saloonstore/controller")
const product = require("../../models/productModel")


exports.getAllOrder = async (req, res) => {
    try {
        res.locals.message = req.flash();
        const user = req.user
        const findOrder = await getAllOrder(req)
        const FindAllcity = await getAllSaloonCity(req)
        if (findOrder.status == true && FindAllcity.status == true) {
            if (req.body.userId != undefined && req.body.userId != "") {
                req.query.userId = req.body.userId
            }
            res.render("order/index", { data: findOrder.data, query: req.query, user, city: FindAllcity.data })
        } else {
            req.flash("error", "no data found")
            res.render("order/index", { data: findOrder.data, query: req.query, user, city: FindAllcity.data })
        }
    } catch (error) {
        console.log(error);
    }
}
const { paymentsRefund } = require("../../api/payment/controller")
exports.orderCancel = async (req, res) => {
    try {
        if (req.query.id) {
            const _id = mongoose.Types.ObjectId(req.query.id);
            const findOrder = await order.findOne({ _id });
            if (findOrder) {
                const orderCencal = await order.findByIdAndUpdate({ _id }, { status: "cancel" }, { new: true })
                if (orderCencal) {
                    // user ke pise refund
                    // refund paise 
                    req.query._id = orderCencal.PaymentId
                    const paymentRefund = await paymentsRefund(req)
                    // refund paise successfull
                    if (paymentRefund) {
                        res.redirect("/get-All-order")
                    } else {
                        res.redirect("/")
                    }
                };
            } else {
                res.redirect("/get-All-order")
            }
        } else {
            res.redirect("/get-All-order")
        }
    } catch (error) {
        console.log(error);
    };
};

exports.AdminOrderApprove = async (req, res) => {
    try {
        if (req.query.id) {
            const _id = mongoose.Types.ObjectId(req.query.id);
            const findOrder = await order.findOne({ _id });
            if (findOrder) {
                const orderCencal = await order.findByIdAndUpdate({ _id }, { status: "succes" }, { new: true })
                if (orderCencal) {
                    res.redirect("/get-All-order")
                };
            } else {
                res.redirect("/get-All-order")
            }
        } else {
            res.redirect("/get-All-order")
        }
    } catch (error) {
        console.log(error);
    };
};




exports.FindDateForAdminModule = async (req, res) => {
    try {
        const FindData = await order.aggregate([
            {
                '$match': {
                    '_id': mongoose.Types.ObjectId(req.query.id)
                }
            }, {
                '$project': {
                    'cartdata': 1
                }
            }, {
                '$unwind': {
                    'path': '$cartdata'
                }
            }, {
                '$addFields': {
                    'serviceIdObj': {
                        '$convert': {
                            'input': '$cartdata.serviceId',
                            'to': 'objectId',
                            'onError': '$cartdata.serviceId',
                            'onNull': '$cartdata.serviceId'
                        }
                    }
                }
            }, {
                '$lookup': {
                    'from': 'products',
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$eq': [
                                        '$_id',
                                        '$$serviceId'
                                    ]
                                }
                            }
                        }, {
                            '$project': {
                                '_id': 0,
                                'ServiceName': 1
                            }
                        }
                    ],
                    'let': {
                        'serviceId': '$serviceIdObj'
                    },
                    'as': 'service'
                }
            }, {
                '$unwind': {
                    'path': '$service'
                }
            },
        ])

        res.send(FindData)
    } catch (error) {
        console.log(error);
    }
}

exports.AdminOrderCartData = async (req, res) => {
    try {
        if (!req.query.id) {
            return res.send([]);
        }
        const orderDoc = await order.findById(req.query.id);
        if (!orderDoc) {
            return res.send([]);
        }
        const cartdata = Array.isArray(orderDoc.cartdata) ? orderDoc.cartdata : [];
        const serviceIds = cartdata.map((item) => item.serviceId).filter(Boolean);
        const services = await product.find(
            { _id: { $in: serviceIds } },
            { ServiceName: 1, ServicePrice: 1, timePeriod_in_minits: 1 }
        );
        const serviceMap = new Map();
        services.forEach((svc) => {
            serviceMap.set(String(svc._id), svc);
        });

        const items = cartdata.map((item) => {
            const svc = serviceMap.get(String(item.serviceId));
            return {
                serviceId: String(item.serviceId || ""),
                ServiceName: svc ? svc.ServiceName : "",
                ServicePrice: svc ? svc.ServicePrice : 0,
                quantity: Number(item.quantity || 0),
                Amount: Number(item.Amount || 0),
                timePeriod_in_minits: item.timePeriod_in_minits || (svc ? svc.timePeriod_in_minits : 0)
            };
        });

        return res.send({
            orderId: String(orderDoc._id),
            saloonId: String(orderDoc.saloonId || ""),
            items
        });
    } catch (error) {
        console.log(error);
        return res.send([]);
    }
};

exports.AdminOrderSearchServices = async (req, res) => {
    try {
        const { saloonId, q, page, limit } = req.query || {};
        if (!saloonId) {
            return res.send({ items: [], page: 1, totalPages: 0, total: 0 });
        }
        const pageNum = Math.max(1, Number(page || 1));
        const limitNum = Math.max(1, Math.min(50, Number(limit || 10)));
        const match = {
            saloonStore: mongoose.Types.ObjectId(saloonId)
        };
        if (q && String(q).trim() !== "") {
            match.ServiceName = { $regex: String(q).trim(), $options: "i" };
        }
        const total = await product.countDocuments(match);
        const totalPages = Math.ceil(total / limitNum);
        const items = await product.find(
            match,
            { ServiceName: 1, ServicePrice: 1 }
        )
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        return res.send({ items, page: pageNum, totalPages, total });
    } catch (error) {
        console.log(error);
        return res.send({ items: [], page: 1, totalPages: 0, total: 0 });
    }
};

exports.AdminOrderUpdateCart = async (req, res) => {
    try {
        const { orderId, action, serviceId, quantity } = req.body || {};
        if (!orderId) {
            return res.status(400).send({ status: false, message: "orderId is required" });
        }
        const orderDoc = await order.findById(orderId);
        if (!orderDoc) {
            return res.status(404).send({ status: false, message: "Order not found" });
        }
        let cartdata = Array.isArray(orderDoc.cartdata) ? [...orderDoc.cartdata] : [];
        const targetId = String(serviceId || "");
        const idx = cartdata.findIndex((item) => String(item.serviceId) === targetId);

        const ensureService = async () => {
            if (!targetId) return null;
            return await product.findById(targetId);
        };

        if (action === "add") {
            const svc = await ensureService();
            if (!svc) {
                return res.status(404).send({ status: false, message: "Service not found" });
            }
            const addQty = Math.max(1, Number(quantity || 1));
            if (idx >= 0) {
                const currentQty = Number(cartdata[idx].quantity || 0);
                const newQty = currentQty + addQty;
                cartdata[idx].quantity = newQty;
                cartdata[idx].Amount = Number(svc.ServicePrice || 0) * newQty;
                cartdata[idx].timePeriod_in_minits = cartdata[idx].timePeriod_in_minits || svc.timePeriod_in_minits;
            } else {
                cartdata.push({
                    serviceId: svc._id,
                    quantity: addQty,
                    Amount: Number(svc.ServicePrice || 0) * addQty,
                    timePeriod_in_minits: svc.timePeriod_in_minits
                });
            }
        } else if (action === "inc" || action === "dec") {
            if (idx < 0) {
                return res.status(404).send({ status: false, message: "Item not found" });
            }
            const svc = await ensureService();
            const currentQty = Number(cartdata[idx].quantity || 0);
            const unitPrice = svc ? Number(svc.ServicePrice || 0) : (currentQty > 0 ? Number(cartdata[idx].Amount || 0) / currentQty : 0);
            const newQty = action === "inc" ? currentQty + 1 : currentQty - 1;
            if (newQty <= 0) {
                cartdata.splice(idx, 1);
            } else {
                cartdata[idx].quantity = newQty;
                cartdata[idx].Amount = unitPrice * newQty;
                if (svc && !cartdata[idx].timePeriod_in_minits) {
                    cartdata[idx].timePeriod_in_minits = svc.timePeriod_in_minits;
                }
            }
        } else if (action === "remove") {
            if (idx >= 0) {
                cartdata.splice(idx, 1);
            }
        } else if (action === "setQty") {
            if (idx < 0) {
                return res.status(404).send({ status: false, message: "Item not found" });
            }
            const svc = await ensureService();
            const newQty = Math.max(0, Number(quantity || 0));
            if (newQty <= 0) {
                cartdata.splice(idx, 1);
            } else {
                const unitPrice = svc ? Number(svc.ServicePrice || 0) : (Number(cartdata[idx].Amount || 0) / Number(cartdata[idx].quantity || 1));
                cartdata[idx].quantity = newQty;
                cartdata[idx].Amount = unitPrice * newQty;
                if (svc && !cartdata[idx].timePeriod_in_minits) {
                    cartdata[idx].timePeriod_in_minits = svc.timePeriod_in_minits;
                }
            }
        }

        let totalamount = 0;
        cartdata.forEach((item) => {
            totalamount += Number(item.Amount || 0);
        });

        orderDoc.cartdata = cartdata;
        orderDoc.totalamount = totalamount;
        if (orderDoc.Discount != null && orderDoc.Discount != undefined) {
            orderDoc.finalTotalAmount = Math.max(0, totalamount - Number(orderDoc.Discount || 0));
        }
        await orderDoc.save();

        return res.send({ status: true, message: "Cart updated", totalamount });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: false, message: "Server error" });
    }
};
