@echo off
setlocal enabledelayedexpansion

REM ================================
REM Supabase Setup Script (Windows)
REM CognexiaAI Super Admin Portal
REM ================================

echo.
echo ========================================
echo   Supabase Setup - Windows
echo ========================================
echo.

REM Check if psql is installed
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL client (psql) is not installed!
    echo.
    echo Please install PostgreSQL client:
    echo   Download from: https://www.postgresql.org/download/windows/
    echo.
    pause
    exit /b 1
)

echo [OK] PostgreSQL client found
echo.

REM Collect Supabase credentials
echo Please provide your Supabase project details:
echo (Find these in: Supabase Dashboard ^> Settings ^> API)
echo.

set /p SUPABASE_URL="Supabase Project URL (e.g., https://xxxxx.supabase.co): "
set /p SUPABASE_HOST="Database Host (e.g., db.xxxxx.supabase.co): "
set /p SUPABASE_PASSWORD="Database Password: "
set /p SUPABASE_ANON_KEY="Supabase Anon Key: "
set /p SUPABASE_SERVICE_ROLE_KEY="Service Role Key: "

echo.
echo [OK] Credentials collected
echo.

REM Test connection
echo Testing Supabase connection...
psql "postgresql://postgres:%SUPABASE_PASSWORD%@%SUPABASE_HOST%:5432/postgres" -c "SELECT 1;" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to connect to Supabase
    echo.
    echo Please check:
    echo   1. Database password is correct
    echo   2. Your IP is whitelisted in Supabase
    echo   3. Database host is correct
    echo.
    pause
    exit /b 1
)

echo [OK] Connected to Supabase
echo.

REM Run migrations
echo Running database migrations...
cd backend\modules\03-CRM

echo Running migration 1 (Features 1-18)...
psql "postgresql://postgres:%SUPABASE_PASSWORD%@%SUPABASE_HOST%:5432/postgres" -f database\migrations\super-admin-features-migration.sql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Migration 1 failed
    pause
    exit /b 1
)
echo [OK] Migration 1 complete

echo Running migration 2 (Features 19-33)...
psql "postgresql://postgres:%SUPABASE_PASSWORD%@%SUPABASE_HOST%:5432/postgres" -f database\migrations\advanced-features-19-33-migration.sql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Migration 2 failed
    pause
    exit /b 1
)
echo [OK] Migration 2 complete
echo.

REM Setup backend
echo Configuring backend for Supabase...

REM Generate JWT secret
set JWT_SECRET=%RANDOM%%RANDOM%%RANDOM%%RANDOM%

REM Create .env file
(
echo # ================================
echo # SUPABASE DATABASE CONFIGURATION
echo # ================================
echo.
echo DATABASE_HOST=%SUPABASE_HOST%
echo DATABASE_PORT=5432
echo DATABASE_USER=postgres
echo DATABASE_PASSWORD=%SUPABASE_PASSWORD%
echo DATABASE_NAME=postgres
echo.
echo SUPABASE_URL=%SUPABASE_URL%
echo SUPABASE_ANON_KEY=%SUPABASE_ANON_KEY%
echo SUPABASE_SERVICE_ROLE_KEY=%SUPABASE_SERVICE_ROLE_KEY%
echo.
echo # ================================
echo # APPLICATION CONFIGURATION
echo # ================================
echo.
echo JWT_SECRET=%JWT_SECRET%
echo JWT_EXPIRATION=24h
echo API_PORT=3000
echo NODE_ENV=development
echo ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
) > .env

echo [OK] Backend .env file created

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
echo Configuring frontend for Supabase...
cd ..\..\..\frontend\super-admin-portal

(
echo # ================================
echo # API CONFIGURATION
echo # ================================
echo.
echo NEXT_PUBLIC_API_URL=http://localhost:3000/api/crm
echo.
echo # ================================
echo # SUPABASE CONFIGURATION
echo # ================================
echo.
echo NEXT_PUBLIC_DB_TYPE=supabase
echo NEXT_PUBLIC_SUPABASE_URL=%SUPABASE_URL%
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=%SUPABASE_ANON_KEY%
) > .env.local

echo [OK] Frontend .env.local file created

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
echo   SETUP COMPLETE - SUPABASE
echo ========================================
echo.
echo [OK] Database: Supabase
echo [OK] Migrations: Complete
echo [OK] Backend: Configured
echo [OK] Frontend: Configured
echo.
echo Supabase Configuration:
echo   Project URL: %SUPABASE_URL%
echo   Database Host: %SUPABASE_HOST%
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
