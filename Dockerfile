# Dockerfile pour Coolify - Build propre garanti
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build de production
RUN npm run build

# Image finale avec nginx
FROM nginx:alpine

# Supprimer le contenu par défaut
RUN rm -rf /usr/share/nginx/html/*

# Copier uniquement le build frais
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuration nginx pour SPA
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
