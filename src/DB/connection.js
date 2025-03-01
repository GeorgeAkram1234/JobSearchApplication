import mongoose from "mongoose";

const connectionDB = async () =>{
    return await mongoose.connect(process.env.DB_URI).then(res => {
        console.log("DB connected");
    }).catch(error => {
        console.error("failed to connect to database", error);
    })
    
}
export default connectionDB