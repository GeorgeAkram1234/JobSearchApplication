import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";

// Define Company Type
export const oneCompanyType = {
    _id: { type: GraphQLID },
    companyName: { type: GraphQLString },
    description: { type: GraphQLString },
    industry: { type: GraphQLString },
    address: { type: GraphQLString },
    numberOfEmployees: { type: GraphQLString },
    companyEmail: { type: GraphQLString },
    createdBy: { type: GraphQLID },
    deletedAt: { type: GraphQLString },
    bannedAt: { type: GraphQLString },
    approvedByAdmin: { type: GraphQLBoolean }
};

// Define Company Response
export const oneCompanyResponse = new GraphQLObjectType({
    name: "oneCompanyResponse",
    fields: {
        ...oneCompanyType
    }
});

// Response Type for Get All Companies
export const companyResponse = new GraphQLObjectType({
    name: "companyResponse",
    fields: {
        message: { type: GraphQLString },
        statusCode: { type: GraphQLInt },
        data: { type: new GraphQLList(oneCompanyResponse) }
    }
});
