# Firebase Storage Documentation

## 1. Introduction to Firebase Storage

Firebase Storage is a powerful, simple, and cost-effective object storage service built for Google-scale. It is designed to store and serve user-generated content, such as photos or videos. Firebase Storage is a service that developers can use to easily store and retrieve files from a Google Cloud Storage bucket.

**Common Use Cases:**

*   **Storing User-Generated Content:** Store images, videos, audio files, and other user-generated content.
*   **Serving Static Assets:** Serve static assets like images, CSS, and JavaScript files for your web application.
*   **Data Backups:** Store backups of your application's data.
*   **Sharing Files:** Share files between users of your application.

## 2. Setup and Configuration

To use Firebase Storage, you first need to enable it in your Firebase project.

1.  **Go to the Firebase Console:** Open your Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2.  **Navigate to Storage:** In the left-hand navigation pane, click on **Storage**.
3.  **Click "Get Started":** If you haven't used Storage before, you'll see a "Get Started" button. Click it to open the Storage setup wizard.
4.  **Configure Security Rules:** The wizard will prompt you to configure security rules for your Storage bucket. You can start with the default rules and refine them later.
5.  **Choose a Location:** Select a location for your Storage bucket. This should be a location that is close to your users to minimize latency.

Once you've completed the setup wizard, your Storage bucket will be ready to use.

## 3. Uploading Files

You can upload files to Firebase Storage from your client-side application using the Firebase SDK.

**Example: Uploading a file from a file input element**

```javascript
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const storage = getStorage();

const fileInput = document.getElementById('file-input');
const file = fileInput.files[0];

// Create a storage reference
const storageRef = ref(storage, 'images/' + file.name);

const uploadTask = uploadBytesResumable(storageRef, file);

// Register three observers:
// 1. 'state_changed' observer, called any time the state changes
// 2. Error observer, called on failure
// 3. Completion observer, called on successful completion
uploadTask.on('state_changed',
  (snapshot) => {
    // Observe state change events such as progress, pause, and resume
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case 'paused':
        console.log('Upload is paused');
        break;
      case 'running':
        console.log('Upload is running');
        break;
    }
  },
  (error) => {
    // Handle unsuccessful uploads
  },
  () => {
    // Handle successful uploads on complete
    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
      console.log('File available at', downloadURL);
    });
  }
);
```

## 4. Downloading Files

To download a file from Firebase Storage, you need to get its download URL. You can then use this URL to display the file in your application.

**Example: Getting a download URL**

```javascript
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const storage = getStorage();
const storageRef = ref(storage, 'images/mountains.jpg');

// Get the download URL
getDownloadURL(storageRef)
  .then((url) => {
    // `url` is the download URL for 'images/mountains.jpg'

    // This can be downloaded directly:
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = (event) => {
      const blob = xhr.response;
    };
    xhr.open('GET', url);
    xhr.send();

    // Or inserted into an <img> element
    const img = document.getElementById('myimg');
    img.setAttribute('src', url);
  })
  .catch((error) => {
    // Handle any errors
  });
```

## 5. File Metadata

You can get and update metadata for files in Firebase Storage. Metadata includes information like the file's name, size, and content type.

**Example: Getting file metadata**

```javascript
import { getStorage, ref, getMetadata } from "firebase/storage";

const storage = getStorage();
const forestRef = ref(storage, 'images/forest.jpg');

// Get metadata properties
getMetadata(forestRef)
  .then((metadata) => {
    // Metadata now contains the metadata for 'images/forest.jpg'
  })
  .catch((error) => {
    // Uh-oh, an error occurred!
  });
```

**Example: Updating file metadata**

```javascript
import { getStorage, ref, updateMetadata } from "firebase/storage";

const storage = getStorage();
const forestRef = ref(storage, 'images/forest.jpg');

// Create file metadata to update
const newMetadata = {
  cacheControl: 'public,max-age=300',
  contentType: 'image/jpeg'
};

// Update metadata properties
updateMetadata(forestRef, newMetadata)
  .then((metadata) => {
    // Updated metadata saved successfully!
  })
  .catch((error) => {
    // Uh-oh, an error occurred!
  });
```

## 6. Deleting Files

You can delete files from Firebase Storage using the `deleteObject` method.

**Example: Deleting a file**

```javascript
import { getStorage, ref, deleteObject } from "firebase/storage";

const storage = getStorage();

// Create a reference to the file to delete
const desertRef = ref(storage, 'images/desert.jpg');

// Delete the file
deleteObject(desertRef).then(() => {
  // File deleted successfully
}).catch((error) => {
  // Uh-oh, an error occurred!
});
```

## 7. Security Rules

Firebase Storage Security Rules allow you to control access to your files. You can write rules that restrict access based on user authentication, file size, content type, and other factors.

**Example: Restricting access to authenticated users**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Example: Restricting file size**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{imageId} {
      // Allow write only if the file size is less than 5MB
      allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

**Example: Restricting content type**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{imageId} {
      // Allow write only if the file is an image
      allow write: if request.auth != null && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## 8. Error Handling

When working with Firebase Storage, you may encounter various errors. It's important to handle these errors gracefully in your application.

**Common Storage Errors:**

*   **`storage/unauthorized`:** The user is not authorized to perform the requested operation.
*   **`storage/object-not-found`:** The file you're trying to access does not exist.
*   **`storage/bucket-not-found`:** The Storage bucket you're trying to access does not exist.
*   **`storage/project-not-found`:** The Firebase project you're trying to access does not exist.
*   **`storage/quota-exceeded`:** The user has exceeded their storage quota.
*   **`storage/unauthenticated`:** The user is not authenticated.
*   **`storage/retry-limit-exceeded`:** The maximum number of retries for an operation has been exceeded.
*   **`storage/invalid-checksum`:** The checksum of the uploaded file does not match the checksum calculated by the server.
*   **`storage/canceled`:** The user canceled the operation.
*   **`storage/invalid-event-name`:** An invalid event name was provided to the `on()` method.
*   **`storage/invalid-url`:** The provided URL is invalid.
*   **`storage/invalid-argument`:** An invalid argument was provided to a method.
*   **`storage/no-default-bucket`:** No default Storage bucket has been configured.
*   **`storage/cannot-slice-blob`:** The blob or file could not be sliced. This can happen if the file has been modified since the last time it was read.
*   **`storage/server-file-wrong-size`:** The file on the server has a different size than the file on the client.
*   **`storage/unknown`:** An unknown error occurred.

**Example: Handling errors**

```javascript
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const storage = getStorage();
const storageRef = ref(storage, 'images/mountains.jpg');

getDownloadURL(storageRef)
  .then((url) => {
    // ...
  })
  .catch((error) => {
    // A full list of error codes is available at
    // https://firebase.google.com/docs/storage/web/handle-errors
    switch (error.code) {
      case 'storage/object-not-found':
        // File doesn't exist
        break;
      case 'storage/unauthorized':
        // User doesn't have permission to access the object
        break;
      case 'storage/canceled':
        // User canceled the upload
        break;

      // ...

      case 'storage/unknown':
        // Unknown error occurred, inspect the server response
        break;
    }
  });