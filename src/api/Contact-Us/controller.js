const Contact = require("../../models/contactUsModel");
const { sendmail } = require("../../middleware/mail")

exports.ContactUs = async ({ user, body, headers }) => {
    try {
        const tendentId = headers.tendentId;
        if (body.phone != undefined && body.phone != "") {
            const phone = body.phone;
            const findData = await Contact.findOne({ phone, tendentId });
            if (findData != null) {
                return {
                    statusCode: 400,
                    status: false,
                    message: "Your contact requist allready pending !",
                    data: []

                };
            };
        };

        if (body.email != undefined && body.email != "") {
            const email = body.email;
            const findData = await Contact.findOne({ email, tendentId });
            if (findData != null) {
                return {
                    statusCode: 400,
                    status: false,
                    message: "Your contact requist allready pending !",
                    data: []

                };
            };
        };

        if (body.phone != undefined && body.phone != "" && body.email != undefined && body.email != "") {
            body.tendentId = tendentId;
            const contactDtails = new Contact(body);
            const result = await contactDtails.save();
            if (result) {
                const sendmailer = await sendmail(result)
                if (sendmailer) {
                    return {
                        statusCode: 200,
                        status: true,
                        message: "ContactUs Successfully !",
                        data: [result]
                    };
                }

            };
        } else {
            return {
                statusCode: 400,
                status: false,
                message: "samethin is wrong !",
                data: []
            };
        }
    } catch (error) {
        console.log(error);
    };
};
