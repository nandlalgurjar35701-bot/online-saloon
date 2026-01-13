const homeBannerModel = require('../../models/homeBannerModel')
const categoryModel = require('../../models/categoryModel')

exports.index = async () => {
    try {
        let data = {}
        data.banners = await homeBannerModel.find()
        data.category = await categoryModel.find()
        return data
    } catch (error) {
        console.log(error);
    };
};