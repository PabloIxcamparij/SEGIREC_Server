# Etapa de build
FROM node:22-alpine AS build

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Imagen final
FROM node:22-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY --from=build /usr/src/app/dist ./dist

# expón el puerto correcto según tu backend
EXPOSE 4000

CMD ["node", "dist/index.js"]
