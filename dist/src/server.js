"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const db_1 = __importDefault(require("./db/db"));
const app_1 = __importDefault(require("./app"));
// import cluster from "node:cluster";
// import { cpus } from "os";
const contant_1 = require("../contant");
const PORT = contant_1.PORTS || 4000;
db_1.default.initialize()
    .then(() => {
    console.log("Database connected");
    app_1.default.listen(PORT, () => {
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
