@echo off
setlocal

set "PORT=3000"
set "URL=http://localhost:%PORT%/"

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Please install Node.js ^(LTS^) and try again.
  exit /b 1
)

start "VirtaoseFlute Dev Server" cmd /k "npm run dev"

set /a ATTEMPTS=60
:WAIT_FOR_SERVER
powershell -NoProfile -Command "try { $c = New-Object System.Net.Sockets.TcpClient; $c.Connect('localhost', %PORT%); $c.Close(); exit 0 } catch { exit 1 }" >nul 2>nul
if %errorlevel%==0 goto OPEN_BROWSER

set /a ATTEMPTS-=1
if %ATTEMPTS% LEQ 0 goto TIMEOUT
timeout /t 1 /nobreak >nul
goto WAIT_FOR_SERVER

:OPEN_BROWSER
start "" "%URL%"
exit /b 0

:TIMEOUT
echo Timed out waiting for the server at %URL%.
echo Check the server window for errors.
exit /b 1
