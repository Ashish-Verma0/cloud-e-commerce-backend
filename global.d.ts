declare namespace NodeJS {
  interface ProcessEnv {
    JWT_SECRET: string;
    SELLER_JWT_SECRET: string;
    SMPT_SERVICE: string;
    SMPT_MAIL: string;
    SMPT_PASSWORD: string;
    SMPT_HOST: string;
    SMPT_PORT: string;
    PORTS: string;
    DB_HOSTNAME: string;
    DB_PORT: string;
    DB_DATABASE: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
  }
}
