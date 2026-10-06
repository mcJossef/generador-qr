# Generador de QR sin anuncios

Pega un enlace y obtén tu código QR. Sin anuncios, sin registro y sin servidores: todo se genera en tu navegador.

## Características
- Genera el QR mientras escribes
- Descarga en PNG o SVG, o copia la imagen
- Tamaño, colores y nivel de corrección de errores personalizables
- Los QR son estáticos: el enlace va dentro de la imagen y nunca expiran

## Uso local
```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # genera la carpeta dist/
```

## Publicar en GitHub Pages
1. Sube el proyecto a un repositorio en la rama `main`.
2. En GitHub: **Settings → Pages → Source: GitHub Actions**.
3. Cada `push` a `main` publica la web automáticamente.

## Tecnologías
Vite · JavaScript · [qrcode](https://www.npmjs.com/package/qrcode)
