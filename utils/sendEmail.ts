import nodemailer from "nodemailer";
import { data } from "../contant";
type EmailOptions = {
  email: string;
  subject: string;
  message: string;
  htmlTemplate?: string;
};

const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: data.SMPT_HOST,
    port: Number(data.SMPT_PORT),
    service: data.SMPT_SERVICE,
    auth: {
      user: data.SMPT_MAIL,
      pass: data.SMPT_PASSWORD,
    },
  });

  const mailOptions = {
    from: data.SMPT_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
