import connectionDB from "./DB/connection.js"
import { rateLimit } from 'express-rate-limit'
import cors from 'cors'
import helmet from 'helmet'
import { globalErrorHandler } from "./utils/error/error.handler.js"
import authController from "./modules/auth/auth.controller.js"
import userController from "./modules/user/user.controller.js"
import companyController from "./modules/company/company.controller.js"
// import jobController from "./modules/jobOpportunity/job.controller.js"
import { createHandler } from "graphql-http/lib/use/express"
import { schema } from "./modules/app.graph.js"

const limiter = rateLimit({
    limit: 5,
    windowMs: 2 * 60 * 1000,
    message: { error: "rate limit reached" },
    statusCode: 429,
    handler: (req, res, next) => {
        return next(new Error("too many requests", { cause: 429 }))
    },
    legacyHeaders: false,
    standardHeaders: 'draft-8'
})

export const bootstrap = (app, express) => {
    app.use(express.json())
    app.use(limiter)
    app.use(cors())
    app.use(helmet())

    
    app.use('/graphql', createHandler({ schema : schema }))

    app.get('/', (req, res, next) => {
        return res.status(200).json('welcome to our job search app')
    })

    app.use('/auth' , authController)
    app.use('/user' , userController)
    app.use('/company' , companyController)
    // app.use('/job' , jobController)

    app.all('*', (req, res, next) => {
        return res.status(404).json('in-valid routing')
    })


    //error handler
    app.use(globalErrorHandler)


    // DB connection

    connectionDB()
}