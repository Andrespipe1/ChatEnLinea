![Sin título](https://github.com/user-attachments/assets/0ed85703-5af0-4236-9364-ca95dc80b1ba)

ChatEnLinea
ChatEnLinea es una aplicación de chat en tiempo real desarrollada con Ionic + Angular, que permite enviar mensajes, fotos (cámara y galería), ubicación, y mensajes especiales de Pokémon usando la PokéAPI. Incluye autenticación, avatar de usuario y despliegue en Android.

Características
Autenticación de usuarios (registro y login con Firebase)
Chat en tiempo real usando Firebase y Supabase
Envío de mensajes de texto
Envío de fotos (desde galería o cámara, usando Capacitor y Supabase Storage)
Envío de ubicación (Google Maps)
Envío de Pokémon aleatorio (consulta a PokéAPI y muestra nombre, imagen y stats)
Avatar de usuario (subida y actualización)
Diseño responsive y moderno (modo claro/oscuro)
Despliegue en Android (APK)
Instalación y ejecución local
Clona el repositorio

Instala dependencias

Configura tus credenciales

Las credenciales de Firebase y Supabase están en environment.ts y environment.prod.ts.
Si usas tu propio backend, reemplaza las claves por las tuyas.
Ejecuta en modo desarrollo

Despliegue en Android (APK)
Build de la app web

Sincroniza con Capacitor

Abre en Android Studio

(Opcional) Cambia el nombre de la app

Edita strings.xml
Cambia <string name="app_name">ChatEnLinea</string> por el nombre que desees.
Agrega permisos en AndroidManifest.xml

Genera el APK

En Android Studio:
Ve a Build > Build Bundle(s) / APK(s) > Build APK(s)
El APK estará en debug
Instala la APK en tu dispositivo

Copia la APK a tu Android y ábrela para instalar (puede que debas permitir "instalar apps desconocidas").
Estructura de carpetas principal
Funcionalidades técnicas
Autenticación: Firebase Auth
Mensajes: Firestore y Supabase Realtime
Fotos: Capacitor Camera + Supabase Storage
Ubicación: Geolocalización + Google Maps
Pokémon: PokéAPI (https://pokeapi.co/)
Avatar: Subida y actualización en Supabase Storage
UI: Ionic Framework, responsive, modo oscuro/claro
Créditos y dependencias principales
Ionic Framework
Angular
Firebase
Supabase
PokéAPI
Capacitor
Ionicons
Notas
Si cambias código, recuerda ejecutar:
Y recompilar el APK en Android Studio.
Los permisos de cámara, galería y ubicación están configurados en el AndroidManifest.xml.
Si los iconos no se ven, asegúrate de importar los iconos de Ionicons en main.ts.
Capturas de pantalla
(Agrega aquí tus screenshots de la app en acción)

Licencia
MIT
