import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";
import { adminDashboard, toggleUserBanStatus } from "./service/user.graph.query.js";
import { adminResponse } from "./types/user.types.js";

export const query = {
    getAllUsers: {
        type: adminResponse,
        args: {
            authorization : {type : new GraphQLNonNull(GraphQLString)}
        },
        resolve: adminDashboard
    }
};

export const mutation = {
    banOrUnbanUser: {
        type: GraphQLString,
        args: {
            authorization : {type : new GraphQLNonNull(GraphQLString)},
            userId: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve: toggleUserBanStatus
    }
};
