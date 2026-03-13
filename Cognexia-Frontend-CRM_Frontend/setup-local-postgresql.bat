@echo off
REM ================================
REM Local PostgreSQL Setup Script (Windows)
REM CognexiaAI Super Admin Portal
REM ================================

echo.
echo ========================================
echo   Local PostgreSQL Setup - Windows
echo ========================================
echo.

REM Check if PostgreSQL is installed
if not exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" (
    echo [ERROR] PostgreSQL is not installed!
    echo.
    echo Please install PostgreSQL first:
    echo   Download from: https://www.postgresql.org/download/windows/
    echo.
    pause
    exit /b 1
)

echo [OK] PostgreSQL found
echo.

REM Check if PostgreSQL is running
"C:\Program Files\PostgreSQL\15\bin\pg_isready.exe" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL is not running!
    echo.
    echo Starting PostgreSQL server...
    "C:\Program Files\PostgreSQL\15\bin\pg_ctl.exe" -D "C:\Users\Lenovo\PostgreSQL\data" -l "C:\Users\Lenovo\PostgreSQL\logfile" start
    timeout /t 5 /nobreak >nul
    "C:\Program Files\PostgreSQL\15\bin\pg_isready.exe" >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to start PostgreSQL
        pause
        exit /b 1
    )
)

echo [OK] PostgreSQL is running
echo.

REM Create database
echo Creating database 'cognexia_crm'...
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "DROP DATABASE IF EXISTS cognexia_crm;" 2>nul
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE cognexia_crm;"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create database
    pause
    exit /b 1
)
echo [OK] Database created
echo.

REM Run migrations
echo Running database migrations...
cd backend\modules\03-CRM

echo Running migration 1 (Features 1-18)...
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d cognexia_crm -f database\migrations\super-admin-features-migration.sql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Migration 1 failed
    pause
    exit /b 1
)
echo [OK] Migration 1 complete

echo Running migration 2 (Features 19-33)...
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d cognexia_crm -f database\migrations\advanced-features-19-33-migration.sql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Migration 2 failed
    pause
    exit /b 1
)
echo [OK] Migration 2 complete
echo.

REM Setup backend
echo Setting up backend...
if not exist .env (
    echo Creating .env file...
    copy .env.example .env >nul
    echo [OK] .env file created
) else (
    echo [INFO] .env file already exists
)

echo Installing backend dependencies...
call npm install >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed
echo.

REM Setup frontend
echo Setting up frontend...
cd ..\..\..\frontend\super-admin-portal

if not exist .env.local (
    echo Creating .env.local file...
    copy .env.local.example .env.local >nul
    echo [OK] .env.local file created
) else (
    echo [INFO] .env.local file already exists
)

echo Installing frontend dependencies...
call npm install >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed
echo.

REM Final summary
echo.
echo ========================================
echo   SETUP COMPLETE - LOCAL POSTGRESQL
echo ========================================
echo.
echo [OK] Database: cognexia_crm
echo [OK] Migrations: Complete
echo [OK] Backend: Ready
echo [OK] Frontend: Ready
echo.
echo Next Steps:
echo.
echo 1. Start the backend:
echo    cd backend\modules\03-CRM
echo    npm run start:dev
echo.
echo 2. Start the frontend (new window):
echo    cd frontend\super-admin-portal
echo    npm run dev
echo.
echo 3. Open browser:
echo    http://localhost:3001
echo.
echo ========================================
echo.
pause
