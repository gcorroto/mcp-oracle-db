@echo off
echo Starting Oracle DB MCP Server...
echo.

REM Check if .env file exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please copy config.example.env to .env and configure your Oracle DB settings.
    echo.
    pause
    exit /b 1
)

REM Check if dist folder exists
if not exist dist (
    echo Building project...
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Build failed!
        pause
        exit /b 1
    )
)

REM Load environment variables from .env file
for /f "usebackq tokens=1,2 delims==" %%i in (.env) do (
    if not "%%i"=="" if not "%%i:~0,1%"=="#" (
        set "%%i=%%j"
    )
)

echo Oracle DB MCP Server Configuration:
echo - Host: %ORACLE_HOST%
echo - Port: %ORACLE_PORT%
echo - Service: %ORACLE_SERVICE_NAME%
echo - Username: %ORACLE_USERNAME%
echo - Old Crypto: %ORACLE_OLD_CRYPTO%
echo.

echo Starting server...
node dist/index.js

pause 