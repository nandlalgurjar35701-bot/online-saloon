const auth = require("../../middleware/adminauth")
const { Router } = require("express");
const app = Router();
const { getAllOrder, orderCancel, AdminOrderApprove, FindDateForAdminModule, AdminOrderCartData, AdminOrderUpdateCart, AdminOrderSearchServices } = require('./controller');


app.get("/get-All-order", auth, getAllOrder)
app.get("/Admin-Order-Cancel", auth, orderCancel)
app.get("/Admin-Order-Approve", auth, AdminOrderApprove)
app.get("/Find-date-for-admin-module", auth, FindDateForAdminModule)
app.get("/Admin-Order-Cart-Data", auth, AdminOrderCartData)
app.post("/Admin-Order-Update-Cart", auth, AdminOrderUpdateCart)
app.get("/Admin-Order-Search-Services", auth, AdminOrderSearchServices)


module.exports = app
