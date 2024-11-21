import mongoose from "mongoose";
import validator from "validator";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please provide your name"],
        minLength:[3,"Name must contain atleast 3 characters "],
        maxLength:[30,"Name must contain maximum 30 characters"],
    },
    email:{
        type:String,
        required:[true,"Please provide your email"],
        Validate :[validator.isEmail,"Please provide a valid email"]//this line validates that if the email is correct or not.
    },
    phone:{
        type:Number,
        required:[true,"Please provide your phone number"],
    },
    password:{
        type:String,
        required:[true,"Please provide your password"],
        minLength:[8,"Password must contain atleast 8 characters"],
        maxLength:[32,"Password must contain maximum 32 characters"],
        select:false
    },
    role:{
        type:String,
      required:[true,"Please provide your role"],
      enum:["job Seeker","employer"],
    },
    createdAt:{
        type:Date,
        default:Date.now,
    }
})
//hashing the password
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next();
    } 
    this.password=await bcrypt.hash(this.password,10)
})//password save krne se phele agar old password hai to next action call ho jaaega aur agar new hai to phele bcrypt hoga


 //comparing password
 userSchema.methods.comparePassword=async function(enteredpassword){
    return await bcrypt.compare(enteredpassword,this.password);
 };

 //generating a jwt token for authorization
userSchema.methods.getJwtToken = function() {
    // Return the signed JWT token
    return jwt.sign(
        { id: this._id }, // Payload: user's unique ID
        process.env.JWT_SECRET_KEY, // Secret key for signing the token
        {
            expiresIn: process.env.JWT_EXPIRE // Token expiration time
        }
    );
};

export const User=mongoose.model("User",userSchema);