import mongoose, { model, Schema, Types } from "mongoose";


const companySchema = new Schema({
    companyName: { type: String, unique: true },
    description: String,
    industry: String,
    address: String,
    numberOfEmployees: { type: Number, min: 11, max: 20 },
    companyEmail: { type: String, unique: true, },
    createdBy: { type: Types.ObjectId, ref: 'User' },
    logo: { secure_url: String, public_id: String },
    coverPic: { secure_url: String, public_id: String },
    deletedAt: Date,
    bannedAt: Date,
    HRs: [{ type: Types.ObjectId, ref: 'User' }],
    approvedByAdmin: Boolean,
    legalAttachment: { secure_url: String, public_id: String }
}, {
    timestamps: true,
    toObject : {virtuals : true},
    toJSON : {virtuals : true}
})

companySchema.virtual("jobs", {
    localField: "_id",  
    foreignField: "company", 
    ref: "Job",   
});

companySchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    try {
        console.log(`Deleting related jobs for company: ${this._id}`);

        // Delete all jobs under this company
        await jobModel.deleteMany({ companyId: this._id });

        next();
    } catch (error) {
        next(error);
    }
});


const companyModel = mongoose.models.Company || model('Company', companySchema)


export default companyModel