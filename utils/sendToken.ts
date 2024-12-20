const sendToken = (user, statusCode, res, token) => {
  try {
    const options = {
      expire: new Date(Date.now() + 5 * 24 * 60 * 60 * 100),
      httpOnly: true,
    };
    res.status(statusCode).cookie(`access_token`, token, options).json({
      success: true,
      message: "login successfully",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
  }
};

export const sendTokenToSeller = (user, statusCode, res, token) => {
  try {
    const options = {
      expire: new Date(Date.now() + 5 * 24 * 60 * 60 * 100),
      httpOnly: true,
    };
    res.status(statusCode).cookie(`seller_token`, token, options).json({
      success: true,
      message: "seller login successfully",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
  }
};

export default sendToken;
