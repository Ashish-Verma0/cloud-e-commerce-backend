"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const db_1 = __importDefault(require("./db/db"));
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = Number(process.env.PORT) || 4000;
db_1.default.initialize()
    .then(() => {
    console.log("Database connected");
    app_1.default.listen(10000, () => {
        console.log(`Server is running ON PORT:-${PORT}`);
    });
})
    .catch((error) => {
    console.error("Error during Data Source initialization:", error);
});
// import cluster from "node:cluster";
// import { cpus } from "os";
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
