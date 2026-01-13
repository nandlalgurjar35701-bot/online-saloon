const homeBannerModel = require('../../models/homeBannerModel')
exports.index = async () => {
    try {
        let data = {}
        data.banners = await homeBannerModel.find()
        return data
    } catch (error) {
        console.log(error);
    };
};