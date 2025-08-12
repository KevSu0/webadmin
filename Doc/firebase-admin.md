# Firebase Admin SDK Documentation

## 1. Introduction to the Firebase Admin SDK

The Firebase Admin SDK is a set of server-side libraries that lets you interact with Firebase from privileged environments to perform actions like:

*   Read and write Realtime Database data with full privileges.
*   Programmatically send Firebase Cloud Messaging messages.
*   Generate and verify Firebase auth tokens.
*   Access Google Cloud resources like Cloud Storage buckets and Cloud Firestore databases associated with your Firebase projects.

The Admin SDK is an essential tool for backend developers who need to manage Firebase services directly from their servers, bypassing client-side restrictions. It is available for multiple programming languages, including **Node.js**, **Python**, **Java**, and **Go**.

## 2. Setup and Initialization

To use the Firebase Admin SDK, you need to add it to your project and initialize it with your Firebase project's credentials.

### Generating a Service Account Key

1.  Open the [Firebase console](https://console.firebase.google.com/).
2.  Select your project and go to **Project settings** (click the gear icon).
3.  Navigate to the **Service accounts** tab.
4.  Click on the **Generate new private key** button. A JSON file containing your service account credentials will be downloaded.

### Initializing the Admin SDK

You need to initialize the Admin SDK with the downloaded service account key. Here's how you can do it in a Node.js application:

```javascript
const admin = require('firebase-admin');

const serviceAccount = require('./path/to/your/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

### Best Practices for Managing Service Account Keys

*   **Do not commit your service account key to public repositories.** Add the key file to your `.gitignore`.
*   Use environment variables to store your service account credentials, especially in production environments.
*   Limit the permissions of the service account to only what is necessary.

## 3. Admin Authentication

The Admin SDK provides methods to manage your Firebase Authentication users programmatically.

### Managing Users

You can create, update, and delete users from your backend.

*   **Create a user:**
    ```javascript
    admin.auth().createUser({
      email: 'user@example.com',
      password: 'secretPassword',
      displayName: 'John Doe',
    })
    .then(userRecord => {
      console.log('Successfully created new user:', userRecord.uid);
    })
    .catch(error => {
      console.log('Error creating new user:', error);
    });
    ```

*   **Update a user:**
    ```javascript
    admin.auth().updateUser(uid, {
      email: 'newemail@example.com',
      disabled: false,
    })
    .then(userRecord => {
      console.log('Successfully updated user', userRecord.toJSON());
    })
    .catch(error => {
      console.log('Error updating user:', error);
    });
    ```

*   **Delete a user:**
    ```javascript
    admin.auth().deleteUser(uid)
      .then(() => {
        console.log('Successfully deleted user');
      })
      .catch(error => {
        console.log('Error deleting user:', error);
      });
    ```

### Creating Custom Tokens

You can create custom JWTs for authenticating users in your app.

```javascript
admin.auth().createCustomToken(uid)
  .then(customToken => {
    // Send token back to client
  })
  .catch(error => {
    console.log('Error creating custom token:', error);
  });
```

### Verifying ID Tokens

If a client app sends a Firebase ID token to your backend server, you can verify it using the Admin SDK.

```javascript
admin.auth().verifyIdToken(idToken)
  .then(decodedToken => {
    const uid = decodedToken.uid;
    // ...
  })
  .catch(error => {
    // Handle error
  });
```

## 4. Admin Firestore

With the Admin SDK, you can access your Cloud Firestore database with full admin privileges, bypassing any security rules.

```javascript
const db = admin.firestore();

// Add a new document
db.collection('users').doc('alovelace').set({
  first: 'Ada',
  last: 'Lovelace',
  born: 1815
});

// Read a document
db.collection('users').doc('alovelace').get()
  .then(doc => {
    if (!doc.exists) {
      console.log('No such document!');
    } else {
      console.log('Document data:', doc.data());
    }
  })
  .catch(err => {
    console.log('Error getting document', err);
  });
```

## 5. Admin Storage

The Admin SDK allows you to interact with your Cloud Storage buckets.

```javascript
const bucket = admin.storage().bucket('your-bucket-name');

// Upload a file
bucket.upload('/path/to/local/file.jpg', {
  destination: 'images/file.jpg',
});

// Download a file
bucket.file('images/file.jpg').download({
  destination: '/path/to/local/download.jpg',
});
```

## 6. Admin Cloud Messaging

You can send messages to client apps using the Admin SDK.

```javascript
const message = {
  notification: {
    title: 'New Message',
    body: 'You have a new message!',
  },
  token: registrationToken // The device's registration token
};

admin.messaging().send(message)
  .then(response => {
    console.log('Successfully sent message:', response);
  })
  .catch(error => {
    console.log('Error sending message:', error);
  });