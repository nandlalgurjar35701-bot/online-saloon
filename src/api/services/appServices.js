const homeBannerModel = require('../../models/homeBannerModel')
const categoryModel = require('../../models/categoryModel')
const teamMemberModel = require("../../models/teamMemberModel");
const testimonialModel = require("../../models/testimonialModel");
const galleryModel = require("../../models/galleryModel");
const pricePlanModel = require("../../models/pricePlanModel");
const siteSettingModel = require("../../models/siteSettingModel");
const productModel = require("../../models/productModel");

const fallbackTeam = [
    { name: "Olivia Mia", role: "Hair Stylist", image: "team-1.png" },
    { name: "Charlotte Ross", role: "Skin Expert", image: "team-2.png" },
    { name: "Amelia Luna", role: "Nail Artist", image: "team-3.png" },
    { name: "Isabella Eva", role: "Makeup Artist", image: "team-4.png" },
];

const fallbackTestimonials = [
    { name: "Priya S.", role: "Client", message: "Amazing service quality and very professional staff.", image: "testimonial-1.jpg", rating: 5 },
    { name: "Neha R.", role: "Client", message: "Loved the ambience. Booking and service were smooth.", image: "testimonial-2.jpg", rating: 5 },
    { name: "Anita K.", role: "Client", message: "Great hygiene and excellent results every time.", image: "testimonial-3.jpg", rating: 5 },
];

const fallbackPricingPlans = [
    { name: "Basic Plan", price: 49, durationLabel: "/Session", features: ["Hair Wash", "Basic Cleanup", "Head Massage"] },
    { name: "Family Plan", price: 99, durationLabel: "/Session", features: ["Hair Spa", "Facial", "Manicure"] },
    { name: "VIP Plan", price: 149, durationLabel: "/Session", features: ["Premium Facial", "Body Polish", "Hair Styling"] },
    { name: "Most Plan", price: 199, durationLabel: "/Session", features: ["Complete Grooming", "Spa Therapy", "Nail Care"] },
];

const fallbackGallery = [
    { title: "Gallery 1", image: "gallery-1.jpg" },
    { title: "Gallery 2", image: "gallery-2.jpg" },
    { title: "Gallery 3", image: "gallery-3.jpg" },
    { title: "Gallery 4", image: "gallery-4.jpg" },
    { title: "Gallery 5", image: "gallery-5.jpg" },
    { title: "Gallery 6", image: "gallery-6.jpg" },
];

const fallbackSiteSetting = {
    brandName: "Sparlex",
    phone: "+01234567890",
    email: "info@example.com",
    address: "123 Salon Street, New Delhi",
    openingHours: {
        monFri: "09:00 AM - 09:00 PM",
        saturday: "09:00 AM - 08:00 PM",
        sunday: "10:00 AM - 06:00 PM",
    },
    socialLinks: {
        facebook: "#",
        instagram: "#",
        twitter: "#",
        linkedin: "#",
    },
};

exports.index = async () => {
    try {
        let data = {}
        data.banners = await homeBannerModel.find().sort({ createdAt: -1 }).lean()
        data.category = await categoryModel.find().sort({ createdAt: -1 }).lean()
        data.teamMembers = await teamMemberModel.find({ status: true }).sort({ sortOrder: 1, createdAt: -1 }).lean()
        data.testimonials = await testimonialModel.find({ status: true }).sort({ sortOrder: 1, createdAt: -1 }).lean()
        data.gallery = await galleryModel.find({ status: true }).sort({ sortOrder: 1, createdAt: -1 }).lean()
        data.pricingPlans = await pricePlanModel.find({ status: true }).sort({ sortOrder: 1, createdAt: -1 }).lean()
        data.siteSetting = await siteSettingModel.findOne({ status: true }).sort({ createdAt: -1 }).lean()
        data.products = await productModel
            .find({ saloonStore: { $ne: null } })
            .sort({ createdAt: -1 })
            .lean()

        if (!data.teamMembers.length) data.teamMembers = fallbackTeam
        if (!data.testimonials.length) data.testimonials = fallbackTestimonials
        if (!data.gallery.length) data.gallery = fallbackGallery
        if (!data.pricingPlans.length) data.pricingPlans = fallbackPricingPlans
        if (!data.siteSetting) data.siteSetting = fallbackSiteSetting

        return data
    } catch (error) {
        console.log(error);
    };
};
