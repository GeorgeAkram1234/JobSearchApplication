import multer from "multer";


export const fileValidations = {
    image: ['image/jpeg' ,'image/jpg', 'image/png', 'image/gif'],
    document: ['application/pdf', 'application/docx']
}
export const uploadCloudFile = ( fileValidation = []) => {


    const storage = multer.diskStorage({})

    function fileFilter(req, file, callback) {
        if (fileValidation.includes(file.mimetype)) {
            callback(null, true)
        } else {
            callback("in valid file format ", false)
        }
    }
    
    return multer({ dest: 'tempPath', fileFilter, storage })
}
