@echo off
title Health-Guard AI Runner
cd /d "%~dp0"

echo ===================================================
echo   Checking Python Environment...
echo ===================================================

:: Check for standard 'python'
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python found. Starting localhost on port 8000...
    start http://localhost:8000
    python serve.py
    goto end
)

:: Check for Windows 'py' launcher
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python Launcher (py) found. Starting localhost on port 8000...
    start http://localhost:8000
    py serve.py
    goto end
)

:: Check for 'python3'
where python3 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] python3 found. Starting localhost on port 8000...
    start http://localhost:8000
    python3 serve.py
    goto end
)

:: Fallback if Python is not installed or not added to PATH
echo.
echo [WARNING] Python aapke system ke PATH me set nahi hai ya installed nahi hai.
echo Fikar mat kijiye! Website ko bina kisi server ke direct browser me open kiya jaa raha hai...
echo.
start "" "%~dp0index.html"

:end
pause
