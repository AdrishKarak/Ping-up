import User from "../models/User.js";


//Get user data using userId
export const getUserData = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

//Update user data 
export const updateUserData = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { username, bio, location, full_name } = req.body;
        const tempUser = await User.findById(userId);

        !username && (username = tempUser.username)

        if (tempUser.username !== username) {
            const user = await User.findOne({ username });
            if (user) {
                //we will not change the username
                return res.status(400).json({ success: false, message: "Username already exists" });
                username = tempUser.username;
            }
        }

        const updatedData = {
            username,
            bio,
            location,
            full_name
        }

        const profile = req.files.profile && req.files.profile[0];
        const cover = req.files.cover && req.files.cover[0];

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
