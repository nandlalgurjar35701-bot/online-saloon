const userModel = require("../../models/userModel");
const aboutModel = require("../../models/aboutModel");
// const services = require("../user/services");
const bcrypt = require('bcrypt');
const { query } = require("express");
const jwt = require("jsonwebtoken");
const referralCodeGenerator = require("referral-code-generator");
const appServices = require("../services/appServices");

exports.servicePage = async (req, res) => {
    try {
        const data = await appServices.index()
        res.render('service', { data })
    } catch (error) {
        console.log(error);
    };
};
