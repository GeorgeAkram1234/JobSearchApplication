import { GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { imageType } from "../../../utils/app.types.shared.js";

// type and response

export const oneUserType = {
    _id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    profilePic: { type: imageType },
    coverPic: { type: imageType },
    deletedAt: { type: GraphQLString },
    mobileNumber: { type: GraphQLString },
    DOB: { type: GraphQLString },
    changeCredentialTime: { type: GraphQLString },
    isConfirmed: { type: GraphQLBoolean },
    gender: {
        type: new GraphQLEnumType({
            name: 'genderTypes',
            values: {
                male: { type: GraphQLString },
                female: { type: GraphQLString }
            }
        })
    },
    role: {
        type: new GraphQLEnumType({
            name: 'roleTypes',
            values: {
                admin: { type: GraphQLString },
                user: { type: GraphQLString },
            }
        })
    },
    provider: {
        type: new GraphQLEnumType({
            name: 'providerTypes',
            values: {
                system: { type: GraphQLString },
                google: { type: GraphQLString },

            }
        })
    },
    OTP: {
        type: new GraphQLList(new GraphQLObjectType({
            name: 'OTPObject',
            fields: {
                code: { type: GraphQLString },
                type: { type: GraphQLString },
                expiresIn: { type: GraphQLString }
            }
        }))
    }
}

export const oneUserResponse = new GraphQLObjectType({
    name: 'oneUserResponse',
    fields: {
        ...oneUserType,
        updatedBy: { type: GraphQLID },
        bannedAt: { type: GraphQLString },
    }

})

// service response

export const adminResponse = new GraphQLObjectType({
    name: 'adminResponse',
    fields: {
        message: { type: GraphQLString },
        statusCode: { type: GraphQLInt },
        data: { type: new GraphQLList(oneUserResponse) }
    }
})