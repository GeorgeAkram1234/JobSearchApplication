import mongoose, { model, Schema, Types } from "mongoose";
import { genderTypes, providers, roleTypes } from "../../utils/enums.js";
import { generateHash } from "../../utils/security/hash.js";
import { generateDecryption, generateEncryption } from "../../utils/security/encryption.js";
import { emailSubject } from "../../utils/events/email.event.js";


const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: (data) => {
            return data?.provider === providers.google ? false : true
        }
    },
    provider: {
        type: String,
        enum: Object.values(providers),
        default: providers.system
    },
    gender: {
        type: String,
        enum: Object.values(genderTypes),
        default: genderTypes.male
    },
    DOB: {
        type: Date,
        validate: {
            validator: function (value) {
                const currentDate = new Date();
                const age = currentDate.getFullYear() - value.getFullYear();
                return value < currentDate && age >= 18;
            },
            message: "DOB must be in the format YYYY-MM-DD, be a past date, and age must be at least 18 years."
        }
    },
    mobileNumber: String,
    role: {
        type: String,
        enum: Object.values(roleTypes),
        default: roleTypes.user
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    bannedAt: Date,
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    changeCredentialTime: Date,
    profilePic: { secure_url: String, public_id: String },
    coverPic: { secure_url: String, public_id: String },
    OTP: [{
        code: String,
        type: {
            type: String,
            enum: Object.values(emailSubject),
            default: emailSubject.confirmEmail
        },
        expiresIn: Date
    }]
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

export const hrSockets = new Map(); 


userSchema.virtual("username").set(function (value) {
    this.firstName = value.split(" ")[0]
    this.lastName = value.split(" ")[1]
}).get(function () {
    return this.firstName + ' ' + this.lastName
})

userSchema.pre('save', function (next, doc) {
    this.password = generateHash({ plainText: this.password })
    this.mobileNumber = generateEncryption({ plainText: this.mobileNumber })
    const currentTime = new Date();
    this.OTP = this.OTP?.filter(otp => otp.expiresIn > currentTime);

    next()
})

userSchema.post('findOne', function (doc) {
    if (doc && doc.mobileNumber) {
        doc.mobileNumber = generateDecryption({ cipherText: doc.mobileNumber });
    }
});

userSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    try {
        console.log(`Deleting related data for user: ${this._id}`);

        await messageModel.deleteMany({ sender: this._id });

        // Delete chats that include this user
        await chatModel.deleteMany({ participants: this._id });

        next();
    } catch (error) {
        next(error);
    }
});



const userModel = mongoose.models.User || model('User', userSchema)



export default userModel