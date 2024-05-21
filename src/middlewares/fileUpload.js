import multer, { diskStorage } from "multer";

export const fileValidation = {
  image: ["image/png", "image/jpeg"],
};

const fileUpload =({ filter })=>{
  const fileFilter =((req, file, cb) => {
    if (!filter.includes(file.mimetype)) {
      return cb(new Error("Invalid Format"), false);
    }
    return cb(null, true);
  });

  return multer({ storage: diskStorage({}), fileFilter });
  
};


export default fileUpload;
