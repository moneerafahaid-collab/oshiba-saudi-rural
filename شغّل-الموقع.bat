@echo off
chcp 65001 >nul
title اكتشف ريف السعودية
cd /d "%~dp0"

echo.
echo  ═══════════════════════════════════════
echo   اكتشف ريف السعودية — تشغيل المنصة
echo  ═══════════════════════════════════════
echo.

:: خادم API (منفذ 5000)
start "ريف السعودية — الخادم" cmd /k "cd /d "%~dp0backend" && npm start"

:: انتظر قليلاً ثم الواجهة (منفذ 5173)
timeout /t 3 /nobreak >nul
start "ريف السعودية — الواجهة" cmd /k "cd /d "%~dp0" && npm run dev"

:: افتح المتصفح
timeout /t 6 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo  تم فتح المتصفح على: http://localhost:5173
echo  لا تغلق نافذتي الخادم والواجهة أثناء الاستخدام.
echo.
pause
