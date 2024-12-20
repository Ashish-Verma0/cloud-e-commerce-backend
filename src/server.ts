require("reflect-metadata");
import AppDataSource from "./db/db";
import app from "./app";
import { PORTS } from "../contant";
const PORT = PORTS || 4000;

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
  });
