// =================================================================
// Configuracion de nodemailer
// =================================================================
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "j.pablo.sorto@gmail.com",
    pass: "zqzy qybh fpvk lsgi",
  },
});