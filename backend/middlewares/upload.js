import multer, { diskStorage } from "multer";
import { extname } from "path";

// Configure storage
const storage = diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save in 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// Filter only image files
const fileFilter = (req, file, cb) => {
    const ext = extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
        return cb(new Error("Only images are allowed!"), false);
    }
    cb(null, true);
};

const upload = multer({ storage, fileFilter }).single('image');

export default upload;
