@echo off

echo Atualizando banco de dados...

dotnet ef database update

cmd /k
