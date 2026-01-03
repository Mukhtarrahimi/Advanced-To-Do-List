import app from "./app.js";
import connectDB from "./config/db.js";

const satartServer = async() => {
    try {
        connectDB();
        const PORT = 3000 || process.env;
        app.listen(PORT, () => {
            console.log(`server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("server error: ", error.message);
    }
};
