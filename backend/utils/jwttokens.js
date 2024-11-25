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

    const options= {
        httpOnly: true,
        secure: true,
        sameSite: "lax", // Allow cross-origin cookies
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };
      

    // Set the token in the cookie and send the response
    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        token,
        message: message,
        user,
    });
};
