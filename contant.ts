import dotenv from "dotenv";

dotenv.config();
export const data = {
  jwt_secret: process.env.JWT_SECRET,

  seller_jwt_secret: process.env.SELLER_JWT_SECRET,

  SMPT_SERVICE: process.env.SMPT_SERVICE,

  SMPT_MAIL: process.env.SMPT_MAIL,

  SMPT_PASSWORD: process.env.SMPT_PASSWORD,

  SMPT_HOST: process.env.SMPT_HOST,

  SMPT_PORT: process.env.SMPT_PORT,
};

export const dbConfig = {
  Hostname: process.env.DB_HOSTNAME,
  Port: process.env.DB_PORT,
  Database: process.env.DB_DATABASE,
  Username: process.env.DB_USERNAME,
  Password: process.env.DB_PASSWORD,
};
