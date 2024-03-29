import { Schema, model } from "mongoose";
import sendEmail from "../utils/sendEmail.js";
import otpTemplate from "../mail/template/emailVerification.js";


const otpSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 5,
    },
});


async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await sendEmail(email, 'Verification Email', otpTemplate(otp));
        console.log("Email sent successfully: ", mailResponse.response);
    } catch (Error) {
        throw Error;
    }
}


otpSchema.pre('save', async function (next) {
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
});


const OTP = model('OTP', otpSchema);
export default OTP;