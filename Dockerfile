# Usa la imagen oficial de Node.js como base
FROM node:18-alpine

# Define el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia todo el código fuente de tu aplicación al contenedor
COPY . .

# Expone el puerto que usa tu servidor Express
EXPOSE 4040

# Define el comando para iniciar la aplicación cuando el contenedor se inicie
CMD [ "npm", "start" ]