const { findUserByEmail, createUser } = require("../services/UserService")
exports.registerUser = async (req, res) => {
    try {
        const { email, name, password } = req.body
        const isEmailExist = await findUserByEmail(email) // check if user exists
        if(isEmailExist){
            return res.status(400).json({
                success: false,
                data: [],
                message: "User already exists"
            })
        }
        const user = await createUser(email, name, password);
        if(!user){
            return res.status(400).json({
                success: false,
                data: [],
                message: "something went wrong"
            })
        }

        return res.status(400).json({
            success: true,
            data: user,
            message: "User created successfully"
        })
        
    } catch (error) {
        console.error
    }
}