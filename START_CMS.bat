@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules (
  echo Installing CMS dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo npm install failed. Please install Node.js 20+ and run npm install manually.
    pause
    exit /b 1
  )
)
if not exist .env copy /y .env.example .env >nul
if not exist data\cms.sqlite (
  echo Initializing administrator account...
  set /p ADMIN_USER=Admin username [admin]: 
  if "%%ADMIN_USER%%"=="" set ADMIN_USER=admin
  set /p ADMIN_PASS=Admin password: 
  if "%%ADMIN_PASS%%"=="" set ADMIN_PASS=ChangeMeNow!
  powershell -NoProfile -Command "$p=Get-Content .env; $p=$p -replace '^ADMIN_USERNAME=.*','ADMIN_USERNAME=%ADMIN_USER%'; $p=$p -replace '^ADMIN_PASSWORD=.*','ADMIN_PASSWORD=%ADMIN_PASS%'; Set-Content .env $p"
)
echo Starting Devdaha CMS at http://localhost:3000
start "Devdaha CMS" cmd /c "node server.js"
timeout /t 2 /nobreak >nul
start "" http://localhost:3000/admin-login.html
