export const sendToken = (user, statusCode, res, message) => {
    // Generate the JWT token
    const token = user.getJwtToken();

    // Cookie options
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000 // Convert days to milliseconds
        ),
        httpOnly: true, // Ensures the cookie is not accessible via JavaScript on the client-side
    };

    // Set the token in the cookie and send the response
    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        token,
        message: message,
        user,
    });
};
