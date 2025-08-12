# Admin User Seed Script for PowerShell
# This script creates an admin user with email/password and sets up their role in Firestore

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

function Test-Email($email) {
    return $email -match '^[^\s@]+@[^\s@]+\.[^\s@]+$'
}

function Test-Password($password) {
    return $password.Length -ge 6
}

function Get-SecureInput($prompt) {
    $secureString = Read-Host $prompt -AsSecureString
    $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureString)
    try {
        return [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    } finally {
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
}

# Main execution
Write-ColorOutput Magenta "🔐 Admin User Seed Script"
Write-ColorOutput Magenta "========================="

Write-Info "`nThis script will create an admin user for your Camera World application."
Write-Info "Please provide the following information:"

# Get admin email
do {
    $email = Read-Host "`nAdmin Email"
    if (-not (Test-Email $email)) {
        Write-Error "Please enter a valid email address."
    }
} while (-not (Test-Email $email))

# Get admin password
do {
    $password = Get-SecureInput "Admin Password (min 6 characters)"
    if (-not (Test-Password $password)) {
        Write-Error "Password must be at least 6 characters long."
    }
} while (-not (Test-Password $password))

# Get display name (optional)
$displayName = Read-Host "Display Name (optional, press Enter to skip)"
if ([string]::IsNullOrWhiteSpace($displayName)) {
    $displayName = "Admin User"
}

Write-Info "`nCreating admin user..."

# Check if Node.js script exists
$nodeScript = Join-Path $PSScriptRoot "seed-admin.js"
if (-not (Test-Path $nodeScript)) {
    Write-Error "Node.js seed script not found at: $nodeScript"
    Write-Warning "Please ensure the seed-admin.js file exists in the scripts directory."
    exit 1
}

# Check if Node.js is available
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js not found"
    }
    Write-Success "Node.js is available: $nodeVersion"
} catch {
    Write-Error "Node.js is not installed or not in PATH"
    Write-Warning "Please install Node.js from https://nodejs.org/"
    exit 1
}

# Create a temporary input file for the Node.js script
$tempInputFile = [System.IO.Path]::GetTempFileName()
try {
    # Write inputs to temp file
    @(
        $email,
        $password,
        $displayName
    ) | Out-File -FilePath $tempInputFile -Encoding UTF8
    
    # Run the Node.js script with input redirection
    Write-Info "Running Node.js admin seed script..."
    $process = Start-Process -FilePath "node" -ArgumentList $nodeScript -RedirectStandardInput $tempInputFile -NoNewWindow -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Success "`n🎉 Admin user created successfully!"
        Write-Success "====================================="
        Write-Info "Email: $email"
        Write-Info "Display Name: $displayName"
        Write-Info "Role: admin"
        
        Write-Warning "`n📝 Next Steps:"
        Write-Warning "1. You can now log in to the admin panel with these credentials"
        Write-Warning "2. The user has been granted admin privileges in both Auth and Firestore"
        Write-Warning "3. Make sure to keep these credentials secure"
    } else {
        Write-Error "`n❌ Failed to create admin user"
        Write-Error "Please check the error messages above and try again."
        exit 1
    }
} catch {
    Write-Error "Failed to run admin seed script: $($_.Exception.Message)"
    exit 1
} finally {
    # Clean up temp file
    if (Test-Path $tempInputFile) {
        Remove-Item $tempInputFile -Force
    }
}