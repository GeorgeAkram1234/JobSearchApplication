import mongoose, { model, Schema, Types } from "mongoose"
import { status } from "../../utils/enums.js"


const applicationSchema = new Schema({
    jobId: { type: Types.ObjectId, ref: 'Job' },
    userId: { type: Types.ObjectId, ref: 'User' },
    userCV: { secure_url: String, public_id: String },
    status: {
        type: String,
        enum: Object.values(status),
        default: status.pending
    },
}, { timestamps: true })


const applicationModel = mongoose.models.Application || model('Application', applicationSchema)

export default applicationModel