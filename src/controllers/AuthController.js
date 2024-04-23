const {
  findUserByEmail,
  createUser,
  updateLoginAttempts,
  lockUserAccount,
  unlockUserAccount,
  resetLoginAttempts,
  generateToken,
  findUnverifiedUsers,
} = require("../services/UserService");
const bcryptjs = require("bcryptjs");
const cron = require("node-cron");
const NodeCache = require("node-cache");
const myCache = new NodeCache();
const redis = require('redis')
const client = redis.createClient()
exports.registerUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const isEmailExist = await findUserByEmail(email); // check if user exists
    if (isEmailExist) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "User already exists",
      });
    }
    const user = await createUser(email, name, password);
    if (!user) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "something went wrong",
      });
    }
    // Omit password from the user object
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({
      success: true,
      data: userWithoutPassword,
      message: "User created successfully",
    });
  } catch (error) {
    console.error;
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email); // check if user exists
    if (!user) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "Invalid email",
      });
    }

    if (user.isLocked) {
      const unlockTime = user.lockDuration.getTime();
      const currentTime = new Date().getTime();
      if (currentTime < unlockTime) {
        return res.status(403).json({
          success: false,
          data: [],
          message: "Your account is locked. Please try again later",
        });
      } else {
        // unlock the account
        await unlockUserAccount(email);
      }
    }

    const passwordMatch = await bcryptjs.compare(password, user.password);
    if (!passwordMatch) {
      //store number of attempts
      await updateLoginAttempts(email);
      if (user.loginAttempts >= 3) {
        //implement rate limit to lock user account
        const lockPeriod = 30 * 1000; // 30 seconds in milliseconds
        const lockDuration = new Date(Date.now() + lockPeriod);
        //lock the user's account
        await lockUserAccount(email, lockDuration);
        return res.status(403).json({
          success: false,
          data: [],
          message:
            "Too many failed attempts. Your account has been temporarily locked",
        });
      }

      return res.status(400).json({
        success: false,
        data: [],
        message: "Invalid password",
      });
    }

    // reset login attempt if probably the login attempt is < 3
    await resetLoginAttempts(email);
    // generate jwt token (method will be here)
    const token = generateToken(user.id, user.email);
    // Omit password from the user object
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({
      success: true,
      data: userWithoutPassword,
      message: "successful",
      token: token,
    });
  } catch (error) {
    console.error;
  }
};

exports.getUserFromNodeCache = async (req, res) => {
  const { email } = req.body;
  //first check if user is in cache
  let userData = myCache.get(email);
  if (!userData) {
    //fetch user from db
    userData = await findUserByEmail(email);
    if (!userData) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "Invalid email",
      });
    }
    myCache.set(email, userData, 600);
  }
  return res.status(200).json({
    success: true,
    data: userData,
    message: "fetched sucessfully",
  });
};

// cron jobs
// A cronjob is a scheduled task that is executed automatically at specific intervals on a unix os.
const cronSchedule = "* * * * *";
function notifyUnverifiedUsers() {
  const unverifiedUsers = findUnverifiedUsers();

  console.log(unverifiedUsers);
  unverifiedUsers.forEach((user) => {
    console.log(user);
    sendVerificationEmail(user.emaii);
  });
  console.log(
    `Notification has been sent to ${unverifiedUsers.length} unverified users`
  );
}

const cronjob = cron.schedule(cronSchedule, notifyUnverifiedUsers);
cronjob.start();

//set up a cronjob that runs everyday by 2am an sends an email to users who haven't verified their accounts.
const newCronSchedule = "0 2 * * *";

async function alertUnverifiedUsers() {
  try {
    const unverifiedUsers = await findUnverifiedUsers();

    unverifiedUsers.forEach((user) => {
      console.log(user);
      sendVerificationEmail(user.email);
    });

    return res.status(200).json({
      success: true,
      message: `Notification has been sent to ${unverifiedUsers.length} unverified users`,
    });
  } catch (error) {
    console.error("Error occurred while notifying unverified users:", error);
  }
}

const secondcronjob = cron.schedule(newCronSchedule, alertUnverifiedUsers);
secondcronjob.start();

// TODO: We'll touch redis during containerization with docker
exports.getUserFromRedis = async (req, res) => {
    const { email } = req.body;
    client.get(email, async (error, userData) => {
        if (error) {
            reject(error)
        } else if (userData){
            resolve(JSON.parse(userData))
        } else {
            // get user from db
            userData = await findUserByEmail(email);
            if (!userData) {
                return res.status(400).json({
                    success: false,
                    data: [],
                    message: "Invalid email",
                });
            }
            //store to redis
            client.setEx(email, 600, JSON.stringify(userData))
            resolve(userData)
        }
    })
};