const jwt = require("jsonwebtoken");

exports.protectedUser = async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return res.status(401).json({
      status: false,
      data: [],
      message: "Unauthorized access",
    });
  }
  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = {
      email: decoded.userEmail,
      id: decoded.userId,
    };

    if (req.user.email) {
      next();
    } else {
      return res.status(401).json({
        status: false,
        data: [],
        message: "Unauthorized access",
      });
    }
  } catch (error) {
    console.error(error);
  }
};
