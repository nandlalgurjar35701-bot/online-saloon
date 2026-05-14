const { default: mongoose } = require("mongoose")

module.exports = controllerFunction => async (request, response, next) => {
    try {
        const { statusCode = 200, ...resObj } = await controllerFunction(request, response, next)
        console.log(resObj, '---resObj')
        response.status(+statusCode).json(resObj)
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            response.status(400).json({
                status: false,
                message: "Wrong ID Format",
                data: []
            })
        } else {
            console.log(error)
            response.status(500).json({
                status: false,
                message: "Internal server error!",
                data: []
            })
        }
    }
}