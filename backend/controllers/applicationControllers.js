import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import {Job} from "../models/jobSchema.js"; // Assuming you have a Job model for job details
import cloudinary from "cloudinary";

// Get all applications for an employer
export const employerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
    const { role } = req.user;
    if (role !== "employer") {
        return next(new ErrorHandler("Only employers can access this resource.", 403));
    }

    const { _id } = req.user;
    const applications = await Application.find({ "employerID.user": _id });
    res.status(200).json({
        success: true,
        applications,
    });
});

// Get all applications for a job seeker
export const jobSeekerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
    const { role } = req.user;
    if (role !== "job Seeker") {
        return next(new ErrorHandler("Only job seekers can access this resource.", 403));
    }

    const { _id } = req.user;
    const applications = await Application.find({ "applicantID.user": _id });
    res.status(200).json({
        success: true,
        applications,
    });
});

// Delete an application by a job seeker
export const jobSeekerDeleteApplication = catchAsyncErrors(async (req, res, next) => {
    const { role } = req.user;
  
    if (role !== "job Seeker") {
        return next(new ErrorHandler("Only job seekers can access this resource.", 403));
    }
  
    const { id } = req.params;
    const application = await Application.findById(id);
  
    if (!application) {
        return next(new ErrorHandler("Application not found", 404));
    }
  
    await application.deleteOne();
  
    res.status(200).json({
        success: true,
        message: "Application deleted successfully",
    });
});

// Post a new application
export const postApplication = catchAsyncErrors(async (req, res, next) => {
    const { role } = req.user;

    // Restrict employers from accessing this route
    if (role === "employer") {
        return next(new ErrorHandler("Employer is not allowed to access this resource.", 403));
    }

    // Check if resume file is provided
    if (!req.files || !req.files.resume) {
        return next(new ErrorHandler("Resume file required", 400)); 
    }

    const { resume } = req.files;
    const allowedFormats = ["image/png", "image/jpg", "image/jpeg", "image/webp", "application/pdf"];

    // Validate the file format
    if (!allowedFormats.includes(resume.mimetype)) {
        return next(new ErrorHandler("Invalid file format", 400));
    }

    // Attempt to upload the resume to Cloudinary
    let cloudinaryResponse;
    try {
        cloudinaryResponse = await cloudinary.v2.uploader.upload(resume.tempFilePath, {
            asset_folder: "resumes", // Optional: Store in a specific folder in Cloudinary
            resource_type: "auto", // Automatically determine resource type (image/pdf)
        });
    } catch (error) {
        console.error("Cloudinary Error:", error);
        return next(new ErrorHandler("Failed to upload Resume", 500));
    }
    console.log(process.env.CLOUDINARY_CLIENT_NAME, process.env.CLOUDINARY_CLIENT_API, process.env.CLOUDINARY_CLIENT_SECRET);


    const { name, email, coverLetter, phone, address, jobId } = req.body;

    // Validate that jobId is provided
    if (!jobId) {
        return next(new ErrorHandler("Job ID is required.", 400));
    }

    // Ensure the job exists
    const jobDetails = await Job.findById(jobId);
    if (!jobDetails) {
        return next(new ErrorHandler("Job not found!", 404));
    }

    // Ensure all required fields are filled
    if (!name || !email || !coverLetter || !phone || !address) {
        return next(new ErrorHandler("Please fill all fields.", 400));
    }

    // Prepare applicant and employer IDs
    const applicantID = {
        user: req.user._id,
        role: "job Seeker",
    };

    const employerID = {
        user: jobDetails.postedBy,
        role: "employer",
    };

    // Create a new application entry in the database
    const application = await Application.create({
        name,
        email,
        coverLetter,
        phone,
        address,
        applicantID,
        employerID,
        resume: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
    });

    // Send success response
    res.status(200).json({
        success: true,
        message: "Application Submitted!",
        application,
    });
});
