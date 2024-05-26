const aws = require("aws-sdk");
require('dotenv').config()

exports.uploadtoS3=(data, filename) =>{
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRECTKEYID = process.env.IAM_USER_SECRECTKEYID ;
  
    let s3bucket = new aws.S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRECTKEYID,
      // BUCKET_NAME:BUCKET_NAME
    });
  
    var params = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: data,
      ACL:'public-read'
    };
    
    return new Promise((resolve, reject)=>{
      s3bucket.upload(params, (err, s3response) => {
        console.log('s3bucket upload called');
        if (err) {
          console.log("some thing went wrong", err);
          reject(err)
        } else {
          console.log("success==========>", s3response);
           resolve(s3response.Location)
        }
      });
    })
    
  }