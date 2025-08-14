# Firebase Setup Guide

This guide will help you set up Firebase for your Camera World application, including authentication, rules deployment, and admin user creation.

## Prerequisites

- Node.js installed
- Firebase CLI installed (already done)
- A Firebase project created in the [Firebase Console](https://console.firebase.google.com/)

## Step 1: Firebase Authentication

1. **Login to Firebase CLI:**
   ```bash
   firebase login
   ```
   This will open a browser window for you to authenticate with your Google account.

2. **List your Firebase projects:**
   ```bash
   firebase projects:list
   ```

3. **Select your Firebase project:**
   ```bash
   firebase use <your-project-id>
   ```
   Replace `<your-project-id>` with your actual Firebase project ID.

## Step 2: Firebase Project Configuration

If you haven't created a Firebase project yet:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard
4. Enable the following services:
   - **Authentication** (Email/Password provider)
   - **Firestore Database**
   - **Storage**

## Step 3: Deploy Firebase Rules

Once authenticated and project is selected:

### Option A: Using PowerShell Script (Recommended for Windows)
```powershell
.\scripts\deploy-rules.ps1
```

### Option B: Using Node.js Script
```bash
node scripts/deploy-rules.js
```

### Option C: Manual Deployment
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy both at once
firebase deploy --only firestore:rules,storage
```

## Step 4: Create Admin User

### Prerequisites for Admin User Creation

You need to set up Firebase Admin SDK credentials. Choose one of these methods:

#### Method A: Service Account Key (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to Project Settings > Service Accounts
3. Click "Generate new private key"
4. Download the JSON file and save it as `serviceAccountKey.json` in the project root
5. **CRITICAL SECURITY:** 
   - The `serviceAccountKey.json` file contains sensitive credentials that grant full access to your Firebase project
   - This file is already listed in `.gitignore` to prevent accidental commits
   - Use the provided `serviceAccountKey.example.json` as a template to understand the expected structure
   - NEVER commit the actual `serviceAccountKey.json` file to version control
   - Store this file securely and restrict access to authorized personnel only

#### Method B: Default Application Credentials
```bash
gcloud auth application-default login
```

### Create Admin User

#### Option A: Using PowerShell Script (Recommended for Windows)
```powershell
.\scripts\seed-admin.ps1
```

#### Option B: Using Node.js Script
```bash
node scripts/seed-admin.js
```

The script will prompt you for:
- Admin email address
- Admin password (minimum 6 characters)
- Display name (optional)

## Step 5: Verify Setup

1. **Check Firestore Rules:**
   - Go to Firebase Console > Firestore Database > Rules
   - Verify that your rules are deployed

2. **Check Storage Rules:**
   - Go to Firebase Console > Storage > Rules
   - Verify that your rules are deployed

3. **Check Admin User:**
   - Go to Firebase Console > Authentication > Users
   - Verify that your admin user exists
   - Check custom claims by clicking on the user

4. **Test Admin Login:**
   - Run your application: `npm run dev`
   - Try logging in with the admin credentials
   - Verify admin panel access

## Troubleshooting

### Common Issues

1. **"Failed to authenticate" error:**
   - Run `firebase login` again
   - Make sure you're using the correct Google account

2. **"No Firebase project configured" error:**
   - Run `firebase use <project-id>`
   - Make sure the project ID is correct

3. **"Permission denied" errors:**
   - Make sure your Firebase project has the required services enabled
   - Check that you have owner/editor permissions on the project

4. **Admin user creation fails:**
   - Ensure Firebase Admin SDK is properly configured
   - Check that the serviceAccountKey.json file exists and is valid
   - Verify that Authentication is enabled in Firebase Console

5. **Rules deployment fails:**
   - Check that firestore.rules and storage.rules files exist
   - Verify the syntax of your rules files
   - Make sure you have the necessary permissions

### Getting Help

- Check the Firebase Console for error messages
- Review the Firebase documentation: https://firebase.google.com/docs
- Check the application logs for detailed error messages

## Security Notes

### Service Account Key Security
- **NEVER commit `serviceAccountKey.json` to version control** - this file contains sensitive credentials
- The actual `serviceAccountKey.json` file has been removed from this repository for security
- Use `serviceAccountKey.example.json` as a template to create your own service account key file
- Store the actual service account key file securely and restrict access
- For production deployments, use environment variables or secure credential management systems

### General Security Best Practices
- Use environment variables for sensitive configuration in production
- Regularly review and update your security rules
- Monitor Firebase usage and set up billing alerts
- Implement proper access controls and user permissions
- Enable audit logging for administrative actions

## Next Steps

After completing this setup:

1. Test the admin login functionality
2. Verify that security rules are working as expected
3. Set up monitoring and logging
4. Configure production environment variables
5. Set up automated backups for Firestore data