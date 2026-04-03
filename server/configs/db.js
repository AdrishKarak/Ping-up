import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected')
        })

        await mongoose.connect(`${process.env.MONGODB_URL}/Ping-up`)
    } catch (error) {
        console.log(error.message)
    }
}

export default connectDB;