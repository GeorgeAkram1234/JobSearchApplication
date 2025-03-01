import mongoose, { model, Schema, Types } from "mongoose";
import { jobLocation } from "../../utils/enums.js";


const jobSchema = new Schema({
    jobTitle: String,
    jobLocation: { type: String, enum: Object.values(jobLocation), default: jobLocation.onsite },
    workingTime: String,
    seniorityLevel: String,
    jobDescription: String,
    technicalSkills: [{ type: String }],
    softSkills: [{ type: String }],
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    addedBy: { type: Types.ObjectId, ref: 'User' },
    companyId: { type: Types.ObjectId, ref: 'Company' },
    closed: Boolean,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

jobSchema.virtual('applications', {
    ref: 'Application',
    localField: '_id',
    foreignField: 'jobId'
})

jobSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    try {
        console.log(`Deleting related applications for job: ${this._id}`);

        // Delete all applications under this job
        await applicationModel.deleteMany({ jobId: this._id });

        next();
    } catch (error) {
        next(error);
    }
});

const jobModel = mongoose.models.Job || model('Job', jobSchema)

export default jobModel