# Firebase Deployment Checklist

Use this checklist to ensure your Camera World application is properly configured and deployed with Firebase.

## Pre-Deployment Setup

### 1. Firebase Project Setup
- [ ] Firebase project created in [Firebase Console](https://console.firebase.google.com/)
- [ ] Project ID noted and configured
- [ ] Billing account set up (if using paid features)

### 2. Firebase Services Enabled
- [ ] **Authentication** enabled with Email/Password provider
- [ ] **Firestore Database** created in production mode
- [ ] **Storage** bucket created
- [ ] **Hosting** enabled (optional, for deployment)

### 3. Local Environment Setup
- [ ] Node.js installed (version 18+)
- [ ] Firebase CLI installed: `npm install -g firebase-tools`
- [ ] Project dependencies installed: `pnpm install`
- [ ] Environment variables configured in `.env` file

## Firebase Authentication & Project Selection

### 4. Firebase CLI Authentication
- [ ] Logged into Firebase CLI: `firebase login`
- [ ] Firebase project selected: `firebase use <project-id>`
- [ ] Project selection verified: `firebase projects:list`

## Security Rules Deployment

### 5. Rules Files Verification
- [ ] `firestore.rules` file exists and is properly configured
- [ ] `storage.rules` file exists and is properly configured
- [ ] `firebase.json` configuration file exists
- [ ] `firestore.indexes.json` file exists

### 6. Rules Deployment
- [ ] Firestore rules deployed: `firebase deploy --only firestore:rules`
- [ ] Storage rules deployed: `firebase deploy --only storage`
- [ ] Deployment verified in Firebase Console
- [ ] Rules syntax validated (no errors in console)

## Admin User Creation

### 7. Firebase Admin SDK Setup
Choose one of the following methods:

**Option A: Service Account Key (Recommended)**
- [ ] Service account key generated from Firebase Console
- [ ] `serviceAccountKey.json` file downloaded and placed in project root
- [ ] **SECURITY CRITICAL**: Verify `serviceAccountKey.json` is in `.gitignore` (already configured)
- [ ] Use `serviceAccountKey.example.json` as template for structure reference
- [ ] Store actual service account key securely with restricted access
- [ ] **NEVER commit the actual serviceAccountKey.json to version control**

**Option B: Default Application Credentials**
- [ ] Google Cloud SDK installed
- [ ] Default credentials configured: `gcloud auth application-default login`

### 8. Admin User Creation
- [ ] Admin user created using seed script
- [ ] Admin email and password recorded securely
- [ ] Admin user verified in Firebase Console > Authentication
- [ ] Admin custom claims verified (role: 'admin', isAdmin: true)
- [ ] Admin user document created in Firestore `users` collection

## Testing & Verification

### 9. Connection Testing
- [ ] Firebase connections tested: `node scripts/test-admin.js`
- [ ] Firestore connection verified
- [ ] Firebase Auth connection verified
- [ ] Admin users found and verified

### 10. Application Testing
- [ ] Development server started: `pnpm dev`
- [ ] Admin login tested with created credentials
- [ ] Admin panel access verified
- [ ] Admin functionality tested (create/edit products, etc.)
- [ ] Customer registration and login tested
- [ ] Security rules tested (unauthorized access blocked)

## Production Deployment

### 11. Build & Deploy
- [ ] Production build created: `pnpm build`
- [ ] Build errors resolved
- [ ] Application deployed to hosting platform
- [ ] Production environment variables configured
- [ ] SSL certificate configured (HTTPS)

### 12. Production Verification
- [ ] Production site accessible
- [ ] Admin login works in production
- [ ] Customer functionality works in production
- [ ] Firebase services working in production
- [ ] Error monitoring set up

## Security & Monitoring

### 13. Security Configuration
- [ ] **Service Account Key Security**: Actual `serviceAccountKey.json` never committed to repository
- [ ] Service account key stored securely with proper access controls
- [ ] Production uses environment variables or secure credential management
- [ ] Firestore security rules reviewed and tested
- [ ] Storage security rules reviewed and tested
- [ ] API keys restricted (if applicable)
- [ ] CORS settings configured
- [ ] Rate limiting configured (if applicable)
- [ ] Audit logging enabled for administrative actions

### 14. Monitoring & Alerts
- [ ] Firebase usage monitoring set up
- [ ] Billing alerts configured
- [ ] Error tracking implemented
- [ ] Performance monitoring enabled
- [ ] Backup strategy implemented

## Documentation & Maintenance

### 15. Documentation
- [ ] README.md updated with deployment instructions
- [ ] Environment variables documented
- [ ] Admin credentials stored securely
- [ ] Deployment process documented
- [ ] Troubleshooting guide created

### 16. Team Setup
- [ ] Team members added to Firebase project
- [ ] Access permissions configured
- [ ] Development environment setup guide shared
- [ ] Code repository access configured

## Troubleshooting Common Issues

### Authentication Issues
- **"Failed to authenticate"**: Run `firebase login` again
- **"No Firebase project configured"**: Run `firebase use <project-id>`
- **Permission denied**: Check Firebase project permissions

### Rules Deployment Issues
- **Rules syntax errors**: Validate rules syntax in Firebase Console
- **Deployment fails**: Check Firebase CLI version and project permissions
- **Rules not taking effect**: Wait a few minutes for propagation

### Admin User Creation Issues
- **Firebase Admin SDK errors**: Check service account key or default credentials
- **User creation fails**: Verify Authentication is enabled in Firebase Console
- **Custom claims not set**: Check Firebase Admin SDK permissions

### Application Issues
- **Login not working**: Check Firebase config in `.env` file
- **Database errors**: Verify Firestore rules and permissions
- **Image upload fails**: Check Storage rules and bucket configuration

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage Security Rules](https://firebase.google.com/docs/storage/security)

---

**Note**: Keep this checklist updated as your application evolves and new features are added.