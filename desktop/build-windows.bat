@echo off
REM Requires Node.js 18+ on Windows. Produces dist\Rootbound-win32-x64\Rootbound.exe
call npm install
call npx @electron/packager . Rootbound --platform=win32 --arch=x64 --out=dist --overwrite --asar
echo Done. Run dist\Rootbound-win32-x64\Rootbound.exe
