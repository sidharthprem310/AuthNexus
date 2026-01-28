# Windows Powershell Build Script
cd frontend
npm run build
cd ..
Copy-Item -Recurse -Force frontend\dist\* backend\app\static\
