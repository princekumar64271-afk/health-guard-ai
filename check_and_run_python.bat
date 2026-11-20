@echo off
setlocal enabledelayedexpansion
title Python Detection and Health-Guard AI Server
color 0A
cls

echo ================================================================
echo           STEP 1: CHECKING PYTHON INSTALLATION
echo ================================================================
echo.

set "PY_CMD="

:: 1. Check 'python' in PATH
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('python --version 2^>^&1') do set "PY_VER=%%i"
    echo [FOUND in PATH] !PY_VER!
    set "PY_CMD=python"
    goto found
)

:: 2. Check 'py' launcher
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('py --version 2^>^&1') do set "PY_VER=%%i"
    echo [FOUND in PATH via py launcher] !PY_VER!
    set "PY_CMD=py"
    goto found
)

:: 3. Check AppData local Python folders
for /d %%D in ("%LOCALAPPDATA%\Programs\Python\Python*") do (
    if exist "%%D\python.exe" (
        for /f "tokens=*" %%i in ('"%%D\python.exe" --version 2^>^&1') do set "PY_VER=%%i"
        echo [FOUND in LocalAppData] "%%D\python.exe" (!PY_VER!)
        set "PY_CMD=%%D\python.exe"
        goto found
    )
)

:: 4. Check Program Files
for /d %%D in ("%ProgramFiles%\Python*") do (
    if exist "%%D\python.exe" (
        for /f "tokens=*" %%i in ('"%%D\python.exe" --version 2^>^&1') do set "PY_VER=%%i"
        echo [FOUND in Program Files] "%%D\python.exe" (!PY_VER!)
        set "PY_CMD=%%D\python.exe"
        goto found
    )
)

:: 5. Check C:\ root Python
for /d %%D in ("C:\Python*") do (
    if exist "%%D\python.exe" (
        for /f "tokens=*" %%i in ('"%%D\python.exe" --version 2^>^&1') do set "PY_VER=%%i"
        echo [FOUND in C:\] "%%D\python.exe" (!PY_VER!)
        set "PY_CMD=%%D\python.exe"
        goto found
    )
)

:not_found
color 0C
echo.
echo ================================================================
echo  [ERROR] Python aapke computer me install nahi mila!
echo ================================================================
echo.
echo Agar aapne Python install nahi kiya hai, toh yahan se install karein:
echo -> https://www.python.org/downloads/
echo.
echo NOTE: Install karte waqt "Add python.exe to PATH" checkbox zaroor tick karein!
echo.
echo Abhi ke liye, aapka website bina Python ke direct browser me open kiya jaa raha hai...
timeout /t 3 >nul
start "" "%~dp0index.html"
echo.
pause
exit /b

:found
echo.
echo ================================================================
echo  [SUCCESS] Python Mil Gaya: !PY_VER!
echo ================================================================
echo.
echo [STEP 2] Starting Localhost Server on Port 8000...
echo [STEP 3] Opening http://localhost:8000 in your browser...
echo.
echo (Keep this black window OPEN. Server is running!)
echo ================================================================
echo.

cd /d "%~dp0"
start http://localhost:8000
"!PY_CMD!" serve.py
if %ERRORLEVEL% NEQ 0 (
    "!PY_CMD!" -m http.server 8000
)
pause
