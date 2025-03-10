# Galería de Fotos con Ionic/Angular

Este proyecto es una aplicación completa de galería de fotos desarrollada con Ionic/Angular para el frontend y Node.js con Express para el backend. La aplicación permite a los usuarios tomar fotos con la cámara del dispositivo y almacenarlas tanto localmente como en la nube.

## Características
- Autenticación de usuarios con JWT
- Toma de fotos usando la cámara del dispositivo
- Almacenamiento local de fotos
- Almacenamiento en la nube (servidor)
- Gestión de perfil de usuario
- Interfaz responsive para móviles y tablets
- Dockerización completa del proyecto

## Requisitos previos
- Node.js (v18 o superior)
- Docker y Docker Compose
- Ionic CLI (`npm install -g @ionic/cli`)
- Android Studio (para compilar para Android)
- Xcode (para compilar para iOS, solo en macOS)

## Instalación
1. Clona el repositorio:
   ```bash
   git clone https://github.com/Yesid-Robayo/ionic
   cd ionic
   
# Ejecuta el backend y la base de datos con Docker:

    docker-compose up -d

Entra en la carpeta del frontend (Ionic) e instala las dependencias:

    cd ionic
    npm install
Inicia el servidor web:

    npm run start
    Para ejecutar en un emulador Android:

Cambia la variable apiUrl en el archivo .env por http://10.0.2.2:3000/api

Ejecuta:

    npm run build:android
    npm run run:android


## Pruebas

Web: Ejecutar npm run start y visitar http://localhost:4200.
Android: Utilizar un emulador desde Android Studio y ejecutar npm run run:android.