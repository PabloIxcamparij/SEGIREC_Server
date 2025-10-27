import e from "express";
import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  swaggerDefinition: {
    openapi: "3.0.2",
    tags: [
      { name: "Message management", description: "API operations related to managing message sending, reporting and user control" },
    ],
    info: {
        title: 'REST API Node.js / Express / TypeScript',
        version: '1.0.0',
        description: "API Docs for message"
    }
  },
   apis: ["./src/router/*.ts"] 
};

const swaggerSpec = swaggerJSDoc(options)

export default swaggerSpec