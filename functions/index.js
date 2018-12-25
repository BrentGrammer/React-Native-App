const functions = require('firebase-functions');
// this is a built in package that you can use to verify tokens (you don't need to npm install it, it comes with firebase functions)
const admin = require("firebase-admin");
// configure cors to allow any origin to access and make a request to the function endpoint
const cors = require("cors")({ origin: true });
const fs = require("fs");
const UUID = require("uuid-v4");
// to use google cloud storage sdk, you need to pass in a config object to set access permissions.
/*
  Two props:
    projectId: <String>
    keyFilename: <String> - file that holds permissions defined to use storage with this project
    -To get this file, go to Firebase project website page - 
     click Gear icon at top->Project Settings->Service Accounts->Generate API Key
     get file downloaded and rename it to whatever you want .json
     put the file in the functions folder of the project
*/
const gcConfig = {
  projectId: "react-practice-app-55aac", // from project page gear icon->Project Settings->Basic
  keyFilename: "react-native-app.json"
};
const googleCloudStorage = require("@google-cloud/storage")(gcConfig);

// initialize the admin helper package to validate tokens, pass in the key file:
admin.initalizeApp({
  credential: admin.credential.cert(require("./react-native-app.json"))
});

// the url endpoint name is after exports.<urlEndpoint>:
exports.storeImage = functions.https.onRequest((request, response) => {
 // forward req and res to cors call:
 cors(request, response, () => {
   // authentication logic - check for an authorization header which you set in the body of the request when sent (i.e. in actions/places.js)
   // check if the header is present and if it follows standard Bearer format convention
   if (!request.headers.authorization || request.headers.authorization.startsWith("Bearer ")) {
     console.log("no token present.");
     response.status(403).json({ error: "Unauthorized"});
     // **Exit the function!
     return;
   }

   let idToken;
   // split the header value to get the token as the second element in the returned array - 
   // separate it from the Bearer part (remember to add the space).
   idToken = request.headers.authorization.split("Bearer ")[1];
   admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
      //turn body into a javascript object:
      const body = JSON.parse(request.body);
      // "/tmp/" is a folder frebase cloud functions have access to and it is cleared regularly:
      // store the base64 string rep of the image file in the tmp folder to a temporary filename:
      // 4 args: (tmp/filename.xxx, filedata, format of the filedata, error callback)
      fs.writeFileSync("/tmp/uploaded-image.jpg", body.image, "base64", err => {
        console.log(err);
        // return to stop the function, send response with a json body holding the error 
        // (json() is node method to parse an object to json for sending over the wire)
        return response.status(500).json({ error: err });
      });
      // store the file in a firebase storage bucket:
      // target a bucket with .bucket method
      // get the name of the bucket by going to firebase project page->Storage->Get Started-> click Got it.
      // The name of the bucket to pass in is in the url after gs:// (i.e. gs://<Name To copy without gs://>)
      const bucket = googleCloudStorage.bucket("react-practice-app-55aac.appspot.com");
    
      // store uuid for filename ahead of time here:
      const uuid = UUID();
    
      // send file stored in tmp folder to the bucket:
      // pass a config object as second arg
      bucket.upload("/tmp/uploaded-image.jpg", {
        uploadType: "media",
        // you can define any path folder here to store the file in on the bucket
        destination: "/places/" + uuid + ".jpg",
        // Note: you need to nest a meteadata prop inside metadata...
        metadata: {
          metadata: {
            contentType: "image/jpeg",
            firebaseStorageDownloadTokens: uuid // used to get convenient download link      
          }
        }
      }, (err, file) => {
        // if there was no error, return a response with a link to the file because that is what you want to store 
        // in the database:
        if (!err) {
          return response.status(201).json({
            // firebase storage has a format you follow to get the link to the file:
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/" +
              bucket.name +
              "/o/" +
              encodeURIComponent(file.name) +
              "?alt=media&token=" +
              uuid
          });
        } else {
          console.log(err);
          return response.status(500).json({ error: err });
        }
      });
    })
    .catch(err => {
      console.log("Token is invalid.");
      response.status(403).json({ error: "Unauthorized."});
    });
 });
});
