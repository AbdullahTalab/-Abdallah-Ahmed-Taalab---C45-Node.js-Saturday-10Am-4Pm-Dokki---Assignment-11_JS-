import { Schema } from "mongoose";

export const validation = (Schema) => {
  return (req, res, next) => {
    const validationErrors = [];
    const dataMethods = ["body", "params", "query", "headers", "file", "files"];

    dataMethods.forEach((key) => {
      if (Schema[key]) {
        const validationResult = Schema[key].validate(req[key], {
          abortEarly: false,
        });
        if (validationResult.error) {
          validationErrors.push(...validationResult.error.details);
        }
      }
    });
    if(validationErrors.length>0){
        return res.status(400).json({
            message:"Validation Error",
            errors: validationErrors.map((err)=>err.message),
        })
    }
    next();
  };
};
