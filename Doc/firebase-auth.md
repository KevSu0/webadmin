# Firebase Authentication

## 1. Introduction to Firebase Authentication

Firebase Authentication provides backend services, easy-to-use SDKs, and ready-made UI libraries to authenticate users to your app. It supports authentication using passwords, phone numbers, popular federated identity providers like Google, Facebook and Twitter, and more.

### Why use Firebase Authentication?

*   **Easy to integrate:** It's built to be easy to use, regardless of your app's platform or your level of experience.
*   **Secure:** It's built by the same team that built Google Sign-In, Smart Lock, and Chrome Password Manager, so you can be sure it's secure.
*   **Scalable:** It's built on Google infrastructure and is ready to scale with your app.
*   **Free for most use cases:** The free tier is generous enough for most apps.

## 2. Setup and Configuration

### Step 1: Create a Firebase project

1.  Go to the [Firebase console](https://console.firebase.google.com/).
2.  Click **Add project**, then follow the on-screen instructions to create a project.

### Step 2: Enable Authentication

1.  In the Firebase console, open the **Authentication** section.
2.  On the **Sign-in method** tab, enable the sign-in providers you want to offer in your app.
3.  If you're using a provider that requires it, provide the necessary configuration (for example, your Facebook App ID and App Secret).

### Step 3: Add Firebase to your app

1.  In the Firebase console, open the **Project Overview** page.
2.  Click the **Web** icon (`</>`) to add a web app.
3.  Follow the on-screen instructions to get your Firebase configuration object.
4.  Add the Firebase SDKs and initialize Firebase in your app with your configuration object.

```javascript
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
```

## 3. Authentication Providers

### Email and Password

```javascript
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();

// Sign up new users
createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
  });

// Sign in existing users
signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });
```

### Google

```javascript
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const auth = getAuth();
const provider = new GoogleAuthProvider();

signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });
```

### Facebook

```javascript
import { getAuth, FacebookAuthProvider, signInWithPopup } from "firebase/auth";

const auth = getAuth();
const provider = new FacebookAuthProvider();

signInWithPopup(auth, provider)
  .then((result) => {
    // The signed-in user info.
    const user = result.user;

    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    const credential = FacebookAuthProvider.credentialFromResult(result);
    const accessToken = credential.accessToken;

    // ...
  })
  .catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = FacebookAuthProvider.credentialFromError(error);

    // ...
  });
```

### GitHub

```javascript
import { getAuth, GithubAuthProvider, signInWithPopup } from "firebase/auth";

const auth = getAuth();
const provider = new GithubAuthProvider();

signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a GitHub Access Token. You can use it to access the GitHub API.
    const credential = GithubAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    // The signed-in user info.
    const user = result.user;
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GithubAuthProvider.credentialFromError(error);
    // ...
  });
```

### Anonymous Login

```javascript
import { getAuth, signInAnonymously } from "firebase/auth";

const auth = getAuth();
signInAnonymously(auth)
  .then(() => {
    // Signed in..
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ...
  });
```

## 4. User Management

### Client-side

You can update a user's basic profile information—the user's display name and profile photo URL—from the client.

```javascript
import { getAuth, updateProfile } from "firebase/auth";

const auth = getAuth();
updateProfile(auth.currentUser, {
  displayName: "Jane Q. User", photoURL: "https://example.com/jane-q-user/profile.jpg"
}).then(() => {
  // Profile updated!
  // ...
}).catch((error) => {
  // An error occurred
  // ...
});
```

### Server-side (Admin SDK)

The Firebase Admin SDK provides methods to create, update, and delete users.

**Create a user:**

```javascript
admin.auth().createUser({
  email: 'user@example.com',
  emailVerified: false,
  phoneNumber: '+11234567890',
  password: 'secretPassword',
  displayName: 'John Doe',
  photoURL: 'http://www.example.com/12345678/photo.png',
  disabled: false
})
  .then(function(userRecord) {
    // See the UserRecord reference doc for the contents of userRecord.
    console.log('Successfully created new user:', userRecord.uid);
  })
  .catch(function(error) {
    console.log('Error creating new user:', error);
  });
```

**Update a user:**

```javascript
admin.auth().updateUser(uid, {
  email: 'modifiedUser@example.com',
  phoneNumber: '+11234567890',
  emailVerified: true,
  password: 'newPassword',
  displayName: 'Jane Doe',
  photoURL: 'http://www.example.com/12345678/photo.png',
  disabled: true
})
  .then(function(userRecord) {
    // See the UserRecord reference doc for the contents of userRecord.
    console.log('Successfully updated user', userRecord.toJSON());
  })
  .catch(function(error) {
    console.log('Error updating user:', error);
  });
```

**Delete a user:**

```javascript
admin.auth().deleteUser(uid)
  .then(function() {
    console.log('Successfully deleted user');
  })
  .catch(function(error) {
    console.log('Error deleting user:', error);
  });
```

## 5. Session Management

Firebase Authentication provides several ways to manage user sessions.

### Sign-in state persistence

You can specify how the authentication state is persisted when a user signs in.

```javascript
import { getAuth, setPersistence, signInWithEmailAndPassword, browserSessionPersistence } from "firebase/auth";

const auth = getAuth();
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    // Existing and future Auth states are now persisted in the current
    // session only. Closing the window would clear any existing state even
    // if a user forgets to sign out.
    // ...
    // New sign-in will be persisted with session persistence.
    return signInWithEmailAndPassword(auth, email, password);
  })
  .catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
  });
```

### Token management

When a user signs in, Firebase creates an ID token that uniquely identifies them. You can get this token and send it to your backend to verify the user's identity.

```javascript
import { getAuth } from "firebase/auth";

const auth = getAuth();
auth.currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
  // Send token to your backend via HTTPS
  // ...
}).catch(function(error) {
  // Handle error
});
```

## 6. Security Rules

Firebase Security Rules for Authentication allow you to control who has access to your app's resources.

```
{
  "rules": {
    "users": {
      "$uid": {
        // Allow only authenticated users to read and write their own data
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

## 7. Error Handling

It's important to handle errors that can occur during the authentication process.

```javascript
createUserWithEmailAndPassword(auth, email, password)
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;

    if (errorCode == 'auth/weak-password') {
      alert('The password is too weak.');
    } else {
      alert(errorMessage);
    }
    console.log(error);
  });
```

### Common error codes

*   `auth/user-not-found`: The user does not exist.
*   `auth/wrong-password`: The password is incorrect.
*   `auth/invalid-email`: The email address is not valid.
*   `auth/email-already-in-use`: The email address is already in use by another account.
*   `auth/weak-password`: The password is too weak.