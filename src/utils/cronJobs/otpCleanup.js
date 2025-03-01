import cron from "node-cron";
import userModel from "../DB/model/User.model.js";
import { asyncHandler } from "../error/error.handler.js";

const removeExpiredOTPs = asyncHandler(async () => {
    const now = new Date();

    const result = await userModel.updateMany(
        {},
        { $pull: { OTP: { expiresIn: { $lte: now } } } }
    );

    
    return `Expired OTPs cleanup done. Modified ${result.modifiedCount} users.`
    
})

// Schedule CRON job to run every 6 hours
cron.schedule("0 */6 * * *", removeExpiredOTPs);

