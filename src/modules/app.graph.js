import { GraphQLObjectType, GraphQLSchema } from "graphql";
import * as userGraphController from "./user/user.graph.controller.js";
import * as companyGraphController from "./company/company.graph.controller.js";

export const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "JobSearchQuery",
        description: "Main app query",
        fields: {
            ...userGraphController.query,
            ...companyGraphController.query
        }
    }),
    mutation: new GraphQLObjectType({
        name: "JobSearchMutations",
        description: "Main app mutations",
        fields: {
            ...userGraphController.mutation,
            ...companyGraphController.mutation
        }
    })
});
