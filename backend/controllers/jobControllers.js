import { Job } from "../models/jobSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";

// Get All Jobs
export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const jobs = await Job.find({ expired: false });
  res.status(200).json({
    success: true,
    jobs,
  });
});

// Post a Job (Only Employers)
export const postJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role !== "employer") {
    return next(
      new ErrorHandler("Only employers can post jobs.", 403)
    );
  }

  const {
    title,
    description,
    category,
    country,
    city,
    location,
    fixedSalary,
    salaryFrom,
    salaryTo,
  } = req.body;

  if (!title || !description || !category || !country || !city || !location) {
    return next(new ErrorHandler("Please provide full job details.", 400));
  }

  if ((!salaryFrom || !salaryTo) && !fixedSalary) {
    return next(
      new ErrorHandler(
        "Please either provide fixed salary or ranged salary.",
        400
      )
    );
  }

  if (salaryFrom && salaryTo && fixedSalary) {
    return next(
      new ErrorHandler("Cannot enter fixed and ranged salary together.", 400)
    );
  }

  const postedBy = req.user._id;
  const job = await Job.create({
    title,
    description,
    category,
    country,
    city,
    location,
    fixedSalary,
    salaryFrom,
    salaryTo,
    postedBy,
  });

  res.status(201).json({
    success: true,
    message: "Job posted successfully!",
    job,
  });
});

// Get My Jobs (Only Employers)
export const getMyJobs = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role !== "employer") {
    return next(
      new ErrorHandler("Only employers can view their job postings.", 403)
    );
  }

  const myJobs = await Job.find({ postedBy: req.user._id });
  res.status(200).json({
    success: true,
    myJobs,
  });
});

// Update Job (Only Employers)
export const updateJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role !== "employer") {
    return next(
      new ErrorHandler("Only employers can update job postings.", 403)
    );
  }

  const { id } = req.params;
  let job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("OOPS! Job not found.", 404));
  }

  if (job.postedBy.toString() !== req.user._id.toString()) {
    return next(
      new ErrorHandler("You are not authorized to update this job.", 403)
    );
  }

  job = await Job.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Job updated successfully!",
    job,
  });
});

// Delete Job (Only Employers)
export const deleteJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role !== "employer") {
    return next(
      new ErrorHandler("Only employers can delete job postings.", 403)
    );
  }

  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("OOPS! Job not found.", 404));
  }

  if (job.postedBy.toString() !== req.user._id.toString()) {
    return next(
      new ErrorHandler("You are not authorized to delete this job.", 403)
    );
  }

  await job.deleteOne();

  res.status(200).json({
    success: true,
    message: "Job deleted successfully!",
  });
});

// Get Single Job
export const getSingleJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  
  if (!job) {
    return next(new ErrorHandler("Job not found.", 404));
  }

  res.status(200).json({
    success: true,
    job,
  });
});

