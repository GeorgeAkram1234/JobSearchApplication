import companyModel from "../../../DB/model/Company.model.js";
import * as dbService from "../../../DB/db.service.js";

export const getAllCompanies = async (parent , args) => {
    const { authorization } = args
    await authentication({
        authorization,
        accessRoles: ["admin"],
        checkAuthorization: true
    });
    const companies = await dbService.find({
        model: companyModel,
        filter: { deletedAt: { $exists: false } }
    });

    return { message: "done", statusCode: 200, data: companies.map(company => company.toObject()) };
};

export const toggleCompanyBanStatus = async (parent, args) => {
    const { companyId  , authorization} = args

    await authentication({
        authorization,
        accessRoles: ["admin"],
        checkAuthorization: true
    });
    const company = await dbService.findOne({ model: companyModel, filter: { _id: companyId } });

    if (!company) {
        throw new Error("Company not found");
    }

    const updatedCompany = await dbService.findOneAndUpdate({
        model: companyModel,
        filter: { _id: companyId },
        data: { bannedAt: company.bannedAt ? null : new Date() },
        options: { new: true }
    });

    return updatedCompany.bannedAt ? "Company has been banned" : "Company has been unbanned";
};

export const approveCompany = async (parent, args) => {
    const { companyId , authorization} = args

    await authentication({
        authorization,
        accessRoles: ["admin"],
        checkAuthorization: true
    });
    const company = await dbService.findOne({ model: companyModel, filter: { _id: companyId } });

    if (!company) {
        throw new Error("Company not found");
    }

    const updatedCompany = await dbService.findOneAndUpdate({
        model: companyModel,
        filter: { _id: companyId },
        data: { approvedByAdmin: true },
        options: { new: true }
    });

    return "Company has been approved";
};
