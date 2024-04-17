const { findUserByEmail, createUser, updateLoginAttempts, lockUserAccount, unlockUserAccount, resetLoginAttempts, generateToken } = require("../services/UserService")
const bcryptjs = require("bcryptjs")
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
        // Omit password from the user object
        const { password: _, ...userWithoutPassword } = user;
        return res.status(200).json({
            success: true,
            data: userWithoutPassword,
            message: "User created successfully"
        })
        
    } catch (error) {
        console.error
    }
}

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await findUserByEmail(email) // check if user exists
        if(!user){
            return res.status(400).json({
                success: false,
                data: [],
                message: "Invalid email"
            })
        }

        if (user.isLocked) {
            const unlockTime = user.lockDuration.getTime();
            const currentTime = new Date().getTime()
            if (currentTime < unlockTime) {
                return res.status(403).json({
                    success: false,
                    data: [],
                    message: "Your account is locked. Please try again later"
                })
            }else{
                // unlock the account
                await unlockUserAccount(email)
            }
        }

        const passwordMatch = await bcryptjs.compare(password, user.password)
        if(!passwordMatch){
            //store number of attempts 
            await updateLoginAttempts(email)
            if (user.loginAttempts >= 3) {
                //implement rate limit to lock user account 
                const lockPeriod = 30 * 1000; // 30 seconds in milliseconds
                const lockDuration = new Date(Date.now() + lockPeriod)
                //lock the user's account
                await lockUserAccount(email, lockDuration)
                return res.status(403).json({
                    success: false,
                    data: [],
                    message: "Too many failed attempts. Your account has been temporarily locked"
                })
            }

            return res.status(400).json({
                success: false,
                data: [],
                message: "Invalid password"
            })
        }

        // reset login attempt if probably the login attempt is < 3
        await resetLoginAttempts(email)
        // generate jwt token (method will be here)
        const token = generateToken(user.id, user.email)
        // Omit password from the user object
        const { password: _, ...userWithoutPassword } = user;
        return res.status(200).json({
            success: true,
            data: userWithoutPassword,
            message: "successful",
            token: token
        })
        
    } catch (error) {
        console.error
    }
}