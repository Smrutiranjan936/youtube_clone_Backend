const multer=require('multer');
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        if (file.fieldname === 'video') cb(null, './uploads/videos/');
        else if (file.fieldname === 'thumbnail') cb(null, './uploads/thumbnails/');
        else cb(new Error('Unexpected field'));
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+'-'+file.originalname)
    }
})
const upload = multer({ storage }).fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);
module.exports=upload;