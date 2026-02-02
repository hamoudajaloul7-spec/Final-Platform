@echo off
echo Starting backup synchronization...
git push backup main
if %ERRORLEVEL% NEQ 0 (
    echo Error: Sync failed. Please check your internet connection and token permissions.
) else (
    echo Success: Backup repository is up to date!
)
pause
