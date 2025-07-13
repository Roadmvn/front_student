FROM node:18-alpine AS builder

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Définir les variables d'environnement pour le build
ARG REACT_APP_API_URL=http://localhost:3000
ARG REACT_APP_API_PROTOCOL=http
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_API_PROTOCOL=$REACT_APP_API_PROTOCOL
ENV NODE_OPTIONS=--openssl-legacy-provider

# Construire l'application
RUN npm run build

# Stage de production avec Nginx
FROM nginx:alpine

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers construits
COPY --from=builder /app/build /usr/share/nginx/html

# Exposer le port
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]