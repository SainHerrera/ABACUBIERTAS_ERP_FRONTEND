@echo off
cd "%~dp0"
echo.
echo ==========================================
echo Running Inventory Panel Navigation Test
echo ==========================================
echo.
npx playwright test e2e\inventory\panel-navigation-back.test.ts --reporter=list
echo.
echo Test completed.
pause