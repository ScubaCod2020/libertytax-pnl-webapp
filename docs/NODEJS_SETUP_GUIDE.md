# 🔧 Node.js Setup Guide for Windows PowerShell

## 🚨 **ISSUE**

Node.js is not installed or not available in PowerShell PATH, preventing you from running:

- `npm run dev`
- `node test-scripts.js`
- Development server

## ✅ **SOLUTIONS (Choose One)**

### **Option 1: Install Node.js via Winget (Recommended)**

```powershell
# Install Node.js LTS version
winget install OpenJS.NodeJS

# Restart PowerShell or reload PATH
refreshenv
# OR close and reopen PowerShell

# Verify installation
node --version
npm --version
```

### **Option 2: Install Node.js via Official Installer**

1. Go to https://nodejs.org/
2. Download **LTS version** (recommended for most users)
3. Run the installer with default settings
4. **Restart PowerShell** after installation
5. Verify: `node --version`

### **Option 3: Install via Chocolatey**

```powershell
# Install Chocolatey first (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs

# Restart PowerShell
# Verify: node --version
```

### **Option 4: Use Node Version Manager (nvm-windows)**

```powershell
# Download and install nvm-windows from:
# https://github.com/coreybutler/nvm-windows/releases

# After installation, restart PowerShell and run:
nvm install lts
nvm use lts

# Verify: node --version
```

## 🔄 **AFTER INSTALLATION**

### **1. Verify Installation**

```powershell
node --version    # Should show v18.x.x or v20.x.x
npm --version     # Should show 9.x.x or 10.x.x
```

### **2. Fix PowerShell Command Separator**

The `&&` operator doesn't work in PowerShell. Use these alternatives:

**WRONG:**

```powershell
cd "path" && npm run dev
```

**CORRECT:**

```powershell
# Option A: Separate commands
cd "E:\scodl\Documents\OneDrive\Documents\GitHub\libertytax-pnl-webapp"
npm run dev

# Option B: Use semicolon
cd "E:\scodl\Documents\OneDrive\Documents\GitHub\libertytax-pnl-webapp"; npm run dev

# Option C: Use PowerShell -c
powershell -c "cd 'E:\scodl\Documents\OneDrive\Documents\GitHub\libertytax-pnl-webapp'; npm run dev"
```

### **3. Test Your Setup**

```powershell
# Navigate to project directory
cd "E:\scodl\Documents\OneDrive\Documents\GitHub\libertytax-pnl-webapp"

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests (in separate terminal)
npm test
```

## 🛠️ **ALTERNATIVE: Use VS Code Terminal**

If you have VS Code installed:

1. **Open VS Code** in your project folder
2. **Terminal → New Terminal** (Ctrl + Shift + `)
3. VS Code terminal usually has Node.js in PATH
4. Run your commands there:
   ```bash
   npm run dev
   node comprehensive-calculation-tests.js
   ```

## 🌐 **ALTERNATIVE: Run Tests in Browser**

Since the webapp is React-based, you can run tests in the browser:

### **1. Start Development Server**

```powershell
# If Node.js still not working, use VS Code terminal or install Node.js first
npm run dev
```

### **2. Open Browser Console**

1. Open your webapp in browser (usually http://localhost:5173)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Copy and paste the test code from `wizard-calculation-validation.js`
5. Press Enter to run tests

### **3. Browser Test Code**

```javascript
// Copy this into browser console:
// [paste content from wizard-calculation-validation.js]
```

## 🚀 **QUICK FIX FOR IMMEDIATE TESTING**

If you need to test **right now** without installing Node.js:

### **1. Use Online JavaScript Runner**

- Go to https://replit.com/ or https://codepen.io/
- Create new JavaScript project
- Paste test code
- Run tests online

### **2. Use PowerShell for Basic Tests**

```powershell
# Create simple PowerShell test
$anf = 125
$returns = 1600
$discountPct = 3

$grossFees = $anf * $returns
$discounts = $grossFees * ($discountPct / 100)
$taxPrepIncome = $grossFees - $discounts

Write-Host "Gross Fees: $($grossFees.ToString('N0'))"
Write-Host "Discounts: $($discounts.ToString('N0'))"
Write-Host "Tax Prep Income: $($taxPrepIncome.ToString('N0'))"
```

## 📋 **RECOMMENDED STEPS**

1. **Install Node.js** using Option 1 (winget) - fastest and cleanest
2. **Restart PowerShell** completely
3. **Verify installation** with `node --version`
4. **Navigate to project** and run `npm install`
5. **Start development server** with `npm run dev`
6. **Run tests** with `node test-file.js`

## ❓ **TROUBLESHOOTING**

### **"node is not recognized" after installation**

- **Restart PowerShell completely**
- **Restart VS Code** if using VS Code terminal
- **Check PATH**: `$env:PATH -split ';' | Select-String node`
- **Manually add to PATH** if needed

### **Permission errors**

```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **Still not working?**

- Try **Command Prompt** instead of PowerShell
- Use **Git Bash** if you have Git installed
- Use **VS Code integrated terminal**

---

**Choose the solution that works best for your environment. Option 1 (winget) is usually the fastest and most reliable.**
