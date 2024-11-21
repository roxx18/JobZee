import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { sendToken } from "../utils/jwttokens.js";




export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !phone || !password || !role) {
    return next(new ErrorHandler("Please fill full form!"));
  }
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already registered!"));
  }
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
  });
  sendToken(user, 201, res, "User Registered!");
});
export const login = catchAsyncErrors(async (req, res, next) => {
   const {email,password,role}=req.body;
   if(!email||!password||!role){
    return next(new ErrorHandler("Please fill out the full login form", 400));
   }

   const user=await User.findOne({email}).select("+password");
if(!user){
  return   next(new ErrorHandler("invalid email or password",400))
}
const isPasswordMatched=await user.comparePassword(password);
if(!isPasswordMatched){
  return next (new ErrorHandler("Invalid email or password",400))
}
if(user.role!==role){
  return next (new ErrorHandler("User with this role not found",400));
}
sendToken(user,200,res,"User logged in successfully!")
});

export const logout =catchAsyncErrors(async(req,res,next)=>{
  res.status(201).cookie("token","",{
    httpOnly:true,
    expires:new Date(Date.now()),
  }).json({
    success:true,
    message:"UserLogged out successfully",
  })
})



export const getUser = catchAsyncErrors((req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});
