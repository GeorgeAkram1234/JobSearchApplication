import { GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";
import { getAllCompanies, toggleCompanyBanStatus, approveCompany } from "./service/company.graph.query.js";
import { companyResponse } from "./types/company.types.js";

export const query = {
    getAllCompanies: {
        type: companyResponse,
        args: {
            authorization: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: getAllCompanies
    }
};

export const mutation = {
    banOrUnbanCompany: {
        type: GraphQLString,
        args: {
            companyId: { type: new GraphQLNonNull(GraphQLID) },
            authorization: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: toggleCompanyBanStatus
    },
    approveCompany: {
        type: GraphQLString,
        args: {
            companyId: { type: new GraphQLNonNull(GraphQLID) },
            authorization: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: approveCompany
    }
};
