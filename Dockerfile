# Étape 1 : Construction
FROM node:20-alpine as build

WORKDIR /app

# Copier package.json et installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier le code source
COPY . .

# Définir l'URL de l'API (peut être overridé lors du build)
ARG VITE_API_URL=http://213.32.23.209:5000/api
ENV VITE_API_URL=$VITE_API_URL

# Construire l'application pour la production
RUN npm run build

# Étape 2 : Serveur Web
FROM nginx:alpine

# Copier les fichiers construits vers le dossier de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuration Nginx personnalisée pour le routing SPA (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
