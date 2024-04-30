const { findUserByEmail, addUserDetails } = require("../services/UserService");

// Endpoint to add or update a user's bank account details
exports.addAccountDetails = async (req, res) => {
  try {
    const {bankName, accountNumber } = req.body;
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
