# Firebase Rules Deployment Script for PowerShell
# This script deploys both Firestore and Storage security rules to Firebase

# Colors for console output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success($message) {
    Write-ColorOutput Green "✓ $message"
}

function Write-Error($message) {
    Write-ColorOutput Red "✗ $message"
}

function Write-Warning($message) {
    Write-ColorOutput Yellow "⚠ $message"
}

function Write-Info($message) {
    Write-ColorOutput Cyan "ℹ $message"
}

function Check-FirebaseCLI {
    try {
        $version = firebase --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Firebase CLI is installed"
            return $true
        }
    } catch {
        Write-Error "Firebase CLI is not installed"
        Write-Warning "Please install Firebase CLI: npm install -g firebase-tools"
        return $false
    }
    return $false
}

function Check-RulesFiles {
    $firestoreRules = Join-Path $PSScriptRoot "..\firestore.rules"
    $storageRules = Join-Path $PSScriptRoot "..\storage.rules"
    
    $firestoreExists = Test-Path $firestoreRules
    $storageExists = Test-Path $storageRules
    
    if ($firestoreExists) {
        Write-Success "firestore.rules found"
    } else {
        Write-Error "firestore.rules not found"
    }
    
    if ($storageExists) {
        Write-Success "storage.rules found"
    } else {
        Write-Error "storage.rules not found"
    }
    
    return $firestoreExists -and $storageExists
}

function Check-FirebaseProject {
    try {
        $result = firebase use 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Firebase project is configured"
            Write-Info "Current project: $result"
            return $true
        }
    } catch {
        Write-Error "No Firebase project configured"
        Write-Warning "Please run: firebase use <project-id>"
        return $false
    }
    return $false
}

function Deploy-FirestoreRules {
    try {
        Write-Info "Deploying Firestore rules..."
        firebase deploy --only firestore:rules
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Firestore rules deployed successfully"
            return $true
        } else {
            Write-Error "Failed to deploy Firestore rules"
            return $false
        }
    } catch {
        Write-Error "Failed to deploy Firestore rules: $($_.Exception.Message)"
        return $false
    }
}

function Deploy-StorageRules {
    try {
        Write-Info "Deploying Storage rules..."
        firebase deploy --only storage
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Storage rules deployed successfully"
            return $true
        } else {
            Write-Error "Failed to deploy Storage rules"
            return $false
        }
    } catch {
        Write-Error "Failed to deploy Storage rules: $($_.Exception.Message)"
        return $false
    }
}

# Main execution
Write-ColorOutput Magenta "🚀 Firebase Rules Deployment Script"
Write-ColorOutput Magenta "====================================="

# Check prerequisites
if (-not (Check-FirebaseCLI)) {
    exit 1
}

if (-not (Check-RulesFiles)) {
    exit 1
}

if (-not (Check-FirebaseProject)) {
    exit 1
}

Write-Info "`nStarting deployment..."

# Deploy rules
$firestoreSuccess = Deploy-FirestoreRules
$storageSuccess = Deploy-StorageRules

if ($firestoreSuccess -and $storageSuccess) {
    Write-Success "`n🎉 All rules deployed successfully!"
    Write-Success "Your Firebase security rules are now active."
} else {
    Write-Error "`n❌ Some deployments failed. Please check the errors above."
    exit 1
}