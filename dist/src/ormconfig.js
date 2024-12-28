module.exports = {
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "your_db_user",
    password: "your_db_password",
    database: "your_db_name",
    entities: ["src/entity/*.ts"],
    synchronize: true,
    logging: false,
};
