@echo off
title Setup Backend WaterNetworkWebMapping-Analysis

REM 1. Demander le chemin d'installation du Java JDK 17
echo Entrez le chemin d'installation du JDK 17 (exemple : C:\Program Files\Eclipse Adoptium\jdk-17.0.9.0)
set /p JDK_PATH="Chemin JAVA_HOME : "

REM 2. Configurer JAVA_HOME et PATH
setx JAVA_HOME "%JDK_PATH%"
setx PATH "%JDK_PATH%\bin;%PATH%"

REM Tester Java
echo Test de la version Java
java -version
if errorlevel 1 (
    echo ERREUR : Java n'est pas correctement installé ou le chemin fourni est incorrect.
    pause
    exit /b
)

REM 3. Demander si le projet est déjà cloné
echo Le projet WaterNetworkWebMapping-Analysis doit être cloné.
set /p REPO_PATH="Entrez le chemin absolu du dossier backend du projet (ex: C:\waterNetworkWebMapping-Analysis\backend) : "

if not exist "%REPO_PATH%" (
    echo Le dossier %REPO_PATH% n'existe pas ! Vérifiez et réessayez.
    pause
    exit /b
)

REM 4. Installer les dépendances du backend et builder le projet
cd /d "%REPO_PATH%"
echo Installation des dépendances et build backend...
call gradlew build --refresh-dependencies

if errorlevel 1 (
    echo ERREUR lors du build. Vérifiez les logs.
    pause
    exit /b
)

REM 5. Lancer le backend en mode développement
echo Lancement du backend Spring Boot en mode dev...
call gradlew bootRun

pause
