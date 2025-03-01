import { GraphQLObjectType, GraphQLString } from "graphql";

export const imageType = new GraphQLObjectType({
    name: "imageType",
    fields: {
        secure_url: { type: GraphQLString },
        public_id: { type: GraphQLString },
    }
})