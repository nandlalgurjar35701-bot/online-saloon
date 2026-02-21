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

exports.pricePage = async (req, res) => {
    try {
        const data = await appServices.index()
        res.render('price', { data })
    } catch (error) {
        console.log(error);
    };
};

exports.teamPage = async (req, res) => {
    try {
        res.render("team");
    } catch (error) {
        console.log(error);
    }
};

exports.testimonialPage = async (req, res) => {
    try {
        res.render("testimonial");
    } catch (error) {
        console.log(error);
    }
};

exports.galleryPage = async (req, res) => {
    try {
        res.render("gallery");
    } catch (error) {
        console.log(error);
    }
};

exports.appointmentPage = async (req, res) => {
    try {
        res.render("appointment");
    } catch (error) {
        console.log(error);
    }
};

exports.contactPage = async (req, res) => {
    try {
        res.render("contact");
    } catch (error) {
        console.log(error);
    }
};

exports.notFoundPage = async (req, res) => {
    try {
        res.status(404).render("404");
    } catch (error) {
        console.log(error);
    }
};
