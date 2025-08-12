# Firestore Documentation

This document provides a comprehensive guide to Cloud Firestore, a flexible, scalable NoSQL cloud database for mobile, web, and server development from Firebase and Google Cloud.

## 1. Introduction to Firestore

### What is Firestore?

Cloud Firestore is a NoSQL document database that lets you easily store, sync, and query data for your mobile and web apps - at global scale. It offers seamless integration with other Firebase and Google Cloud products.

### Data Model

Firestore's data model is based on **documents** and **collections**.

*   **Documents:** The basic unit of storage. Documents are lightweight records that contain fields, which map to values. Each document is identified by a name.
*   **Collections:** A collection is a container for documents. For example, you could have a `users` collection to contain all of your user documents.
*   **Subcollections:** You can nest collections within documents. For example, a `users` document could contain a `posts` subcollection.

### Advantages of Firestore

*   **Flexible Data Model:** The document-based data model allows for flexible data structures and easy schema evolution.
*   **Expressive Queries:** Firestore allows you to perform complex queries against your data.
*   **Real-time Updates:** Firestore uses data synchronization to update data on any connected device.
*   **Offline Support:** Firestore caches data that your app is actively using, so the app can write, read, listen to, and query data even when the device is offline.
*   **Scalability:** Firestore is built on Google Cloud's storage infrastructure, which means it can scale to meet any demand.

## 2. Setup and Configuration

To use Firestore, you first need to enable and configure it in your Firebase project.

1.  **Create a Firebase Project:** If you don't have one already, create a new project in the [Firebase Console](https://console.firebase.google.com/).
2.  **Enable Firestore:** In the Firebase Console, navigate to the "Database" section and click "Create database" for Cloud Firestore.
3.  **Choose a Security Mode:**
    *   **Production mode:** Your data is private by default. You'll need to set up security rules to allow access.
    *   **Test mode:** Your data is open by default. This is useful for getting started, but you should secure your data before going to production.
4.  **Choose a Location:** Select a location for your Firestore data. This cannot be changed later.

## 3. Data Modeling

Structuring your data correctly is crucial for performance and scalability.

### Best Practices

*   **Denormalization:** For performance reasons, it's often better to duplicate data across multiple documents or collections rather than creating complex relationships that require multiple queries to resolve.
*   **Use Subcollections Wisely:** Subcollections are great for data that is closely tied to a parent document. However, if you need to query data across different parent documents, it might be better to use a root-level collection.

## 4. Writing Data

### Adding a Document

```javascript
import { collection, addDoc } from "firebase/firestore"; 

try {
  const docRef = await addDoc(collection(db, "users"), {
    first: "Ada",
    last: "Lovelace",
    born: 1815
  });
  console.log("Document written with ID: ", docRef.id);
} catch (e) {
  console.error("Error adding document: ", e);
}
```

### Updating a Document

```javascript
import { doc, updateDoc } from "firebase/firestore";

const userRef = doc(db, "users", "some-user-id");

await updateDoc(userRef, {
  "born": 1906
});
```

### Deleting a Document

```javascript
import { doc, deleteDoc } from "firebase/firestore";

await deleteDoc(doc(db, "users", "some-user-id"));
```

## 5. Reading Data

### Get a Single Document

```javascript
import { doc, getDoc } from "firebase/firestore";

const docRef = doc(db, "users", "some-user-id");
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  console.log("Document data:", docSnap.data());
} else {
  console.log("No such document!");
}
```

### Get All Documents in a Collection

```javascript
import { collection, getDocs } from "firebase/firestore";

const querySnapshot = await getDocs(collection(db, "users"));
querySnapshot.forEach((doc) => {
  console.log(`${doc.id} => ${doc.data()}`);
});
```

### Querying and Filtering Data

```javascript
import { collection, query, where, orderBy, limit } from "firebase/firestore";

const q = query(collection(db, "users"), where("born", ">", 1900), orderBy("born"), limit(10));

const querySnapshot = await getDocs(q);
querySnapshot.forEach((doc) => {
  console.log(doc.id, " => ", doc.data());
});
```

### Real-time Listeners

```javascript
import { collection, onSnapshot } from "firebase/firestore";

const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
        console.log("New user: ", change.doc.data());
    }
    if (change.type === "modified") {
        console.log("Modified user: ", change.doc.data());
    }
    if (change.type === "removed") {
        console.log("Removed user: ", change.doc.data());
    }
  });
});
```

## 6. Transactions and Batched Writes

### Transactions

Transactions are useful when you need to read a document and then write to it in a single atomic operation.

```javascript
import { runTransaction } from "firebase/firestore";

try {
  await runTransaction(db, async (transaction) => {
    const sfDoc = await transaction.get(sfDocRef);
    if (!sfDoc.exists()) {
      throw "Document does not exist!";
    }
    const newPopulation = sfDoc.data().population + 1;
    transaction.update(sfDocRef, { population: newPopulation });
  });
  console.log("Transaction successfully committed!");
} catch (e) {
  console.log("Transaction failed: ", e);
}
```

### Batched Writes

If you don't need to read any documents in your operation, you can execute multiple write operations as a single batch.

```javascript
import { writeBatch, doc } from "firebase/firestore";

const batch = writeBatch(db);

const nycRef = doc(db, "cities", "NYC");
batch.set(nycRef, {name: "New York City"});

const sfRef = doc(db, "cities", "SF");
batch.update(sfRef, {"population": 1000000});

await batch.commit();
```

## 7. Security Rules

Firestore Security Rules protect your data from unauthorized access.

### Basic Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### User-Owned Data

```
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
  }
}
```

### Role-Based Access

```
function isSuperAdmin() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
}

service cloud.firestore {
  match /databases/{database}/documents {
    match /some_collection/{docId} {
      allow read, write: if isSuperAdmin();
    }
  }
}
```

## 8. Indexing

Firestore automatically creates single-field indexes for all fields in your documents. For more complex queries, you'll need to create composite indexes.

You can create composite indexes in the Firebase Console or by using the Firebase CLI. When you try to run a query that requires a composite index that doesn't exist, Firestore will return an error with a link to create the required index in the Firebase Console.

## 9. Offline Persistence

Firestore's offline persistence feature caches a copy of the data that your app is actively using, so your app can access the data when the device is offline.

### Enabling Offline Persistence

```javascript
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseApp = initializeApp({
  // ...
});

const db = getFirestore(firebaseApp);

enableIndexedDbPersistence(db)
  .catch((err) => {
      if (err.code == 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a time.
      } else if (err.code == 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
      }
  });