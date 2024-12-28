require("reflect-metadata");
import AppDataSource from "./db/db";
import app from "./app";
// import cluster from "node:cluster";
// import { cpus } from "os";
import { PORTS } from "../contant";
const PORT = PORTS || 4000;

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`Server is running`);
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
  });

// if (cluster.isPrimary) {
//   const numCPUs = cpus().length;
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on("exit", (worker, code, signal) => {
//     console.log(`Worker ${worker.process.pid} died`);
//   });
// } else {
//   AppDataSource.initialize()
//     .then(() => {
//       console.log("Database connected");
//       app.listen(PORT, () => {
//         console.log(`Server running on http://localhost:${PORT}`);
//       });
//     })
//     .catch((error) => {
//       console.error("Error during Data Source initialization:", error);
//     });
// }
