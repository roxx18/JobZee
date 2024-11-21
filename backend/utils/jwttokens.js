export const sendToken = (user, statusCode, res, message) => {
    // Generate the JWT token
    const token = user.getJwtToken();

    // Cookie options
    // const options = {
    //     expires: new Date(
    //         Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000 // Convert days to milliseconds
    //     ),
    //     httpOnly: true, // Ensures the cookie is not accessible via JavaScript on the client-side
    // };

    const options={
        httpOnly: true, // Prevents access from JavaScript (secure)
        secure: process.env.NODE_ENV === "production", // Ensures cookies are sent over HTTPS in production
        sameSite: "strict", // Prevents CSRF attacks
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000 // Convert days to milliseconds
        ),
      }

    // Set the token in the cookie and send the response
    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        token,
        message: message,
        user,
    });
};
