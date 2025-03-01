import userModel from "../../../DB/model/User.model.js";
import * as dbService from "../../../DB/db.service.js";
import { authentication } from "../../../middleware/graph/auth.middleware.js";

export const adminDashboard = async (parent, args) => {

    const { authorization } = args
    await authentication({
        authorization,
        accessRoles: ["admin"],
        checkAuthorization: true
    });

    const users = await dbService.find({
        model: userModel,
        filter: { deletedAt: { $exists: false } }
    });

    return { message: "done", statusCode: 200, data: users.map(user => user.toObject()) };
};

export const toggleUserBanStatus = async (parent, args) => {
    const { authorization, userId } = args

    await authentication({
        authorization,
        accessRoles: ["admin"],
        checkAuthorization: true
    });

    const user = await dbService.findOne({ model: userModel, filter: { _id: userId } });

    if (!user) {
        throw new Error("User not found");
    }

    const updatedUser = await dbService.findOneAndUpdate({
        model: userModel,
        filter: { _id: userId },
        data: { bannedAt: user.bannedAt ? null : Date.now() },
        options: { new: true }
    });

    return updatedUser.bannedAt ? "User has been banned" : "User has been unbanned";
};
