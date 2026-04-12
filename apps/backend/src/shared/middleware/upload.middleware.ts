import multer from "multer";

// store in memory not disk
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
            cb(null, true);
        } else {
            cb(new Error("Only CSV files are allowed"));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});