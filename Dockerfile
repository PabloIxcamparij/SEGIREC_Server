# Usa la imagen oficial de Node.js como base
FROM node:18-alpine AS build

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Imagen final
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install 
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 4040
CMD [ "npm", "start" ]