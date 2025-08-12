#!/usr/bin/env node

/**
 * Firebase Rules Deployment Script
 * This script deploys both Firestore and Storage security rules to Firebase
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    log('✓ Firebase CLI is installed', 'green');
    return true;
  } catch (error) {
    log('✗ Firebase CLI is not installed', 'red');
    log('Please install Firebase CLI: npm install -g firebase-tools', 'yellow');
    return false;
  }
}

function checkRulesFiles() {
  const firestoreRules = path.join(__dirname, '..', 'firestore.rules');
  const storageRules = path.join(__dirname, '..', 'storage.rules');
  
  const firestoreExists = fs.existsSync(firestoreRules);
  const storageExists = fs.existsSync(storageRules);
  
  if (firestoreExists) {
    log('✓ firestore.rules found', 'green');
  } else {
    log('✗ firestore.rules not found', 'red');
  }
  
  if (storageExists) {
    log('✓ storage.rules found', 'green');
  } else {
    log('✗ storage.rules not found', 'red');
  }
  
  return firestoreExists && storageExists;
}

function checkFirebaseProject() {
  try {
    const result = execSync('firebase use', { encoding: 'utf8' });
    log('✓ Firebase project is configured', 'green');
    log(`Current project: ${result.trim()}`, 'cyan');
    return true;
  } catch (error) {
    log('✗ No Firebase project configured', 'red');
    log('Please run: firebase use <project-id>', 'yellow');
    return false;
  }
}

function deployFirestoreRules() {
  try {
    log('Deploying Firestore rules...', 'blue');
    execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
    log('✓ Firestore rules deployed successfully', 'green');
    return true;
  } catch (error) {
    log('✗ Failed to deploy Firestore rules', 'red');
    log(error.message, 'red');
    return false;
  }
}

function deployStorageRules() {
  try {
    log('Deploying Storage rules...', 'blue');
    execSync('firebase deploy --only storage', { stdio: 'inherit' });
    log('✓ Storage rules deployed successfully', 'green');
    return true;
  } catch (error) {
    log('✗ Failed to deploy Storage rules', 'red');
    log(error.message, 'red');
    return false;
  }
}

function main() {
  log('🚀 Firebase Rules Deployment Script', 'magenta');
  log('=====================================', 'magenta');
  
  // Check prerequisites
  if (!checkFirebaseCLI()) {
    process.exit(1);
  }
  
  if (!checkRulesFiles()) {
    process.exit(1);
  }
  
  if (!checkFirebaseProject()) {
    process.exit(1);
  }
  
  log('\nStarting deployment...', 'blue');
  
  // Deploy rules
  const firestoreSuccess = deployFirestoreRules();
  const storageSuccess = deployStorageRules();
  
  if (firestoreSuccess && storageSuccess) {
    log('\n🎉 All rules deployed successfully!', 'green');
    log('Your Firebase security rules are now active.', 'green');
  } else {
    log('\n❌ Some deployments failed. Please check the errors above.', 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  checkFirebaseCLI,
  checkRulesFiles,
  checkFirebaseProject,
  deployFirestoreRules,
  deployStorageRules
};