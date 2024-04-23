const { findUserByEmail, addUserDetails } = require("../services/UserService");

// Endpoint to add or update a user's bank account details
exports.addAccountDetails = async (req, res) => {
  try {
    const { email, bankName, accountNumber } = req.body;
    // check if user exists
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "Invalid email",
      });
    }
    const isdetails = await addUserDetails(email, bankName, accountNumber);
    if (isdetails) {
      return res.status(200).json({
            success: true,
            data: [],
            message: "User details added sucessfully"
        })
    } else {
        return res.status(400).json({
            success: false,
            data: [],
            message: "Unable to add user details"
        })
    }
  } catch (error) {
    console.log(error);
  }
};
