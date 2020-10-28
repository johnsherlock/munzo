"use-strict";

const S3Client = require("aws-sdk/clients/s3");
const fs = require("fs");
var path = require('path');
const mime = require('mime-types');

class S3Service {

    constructor(){
        this.s3 = new S3Client({ region: 'eu-west-1' });
    }

    async uploadAllFilesToS3(dir, bucket){
        fs.readdir(dir, (err, files) => {
            if (err) { throw err; }
            files.forEach(file => {
                const filePath = path.join(dir, file);
                if(fs.statSync(filePath).isDirectory()){
                    uploadAllFilesToS3(filePath, bucket)
                }
                else{
                    this.uploadFileToS3(filePath, bucket);
                }
            });
        });        
    } 

    async uploadFileToS3(path, bucket, key = path) {
        console.log(`Uploading file ${path} to bucket ${bucket} with key ${key}`);
        fs.readFile(path, 'utf-8', (err, buffer) => { 
            if (err) { throw err; }
            return this.uploadToS3(bucket, key, buffer, mime.contentType(path));
        });
    }

    async uploadToS3(bucket, key, buffer, contentType) {
        const result = await this.s3.upload({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            ACL: "bucket-owner-full-control"
        })
        .promise();
        // console.log(`Uploaded ${key} uploaded to ${result.Location}`);
    }

}

module.exports = S3Service;