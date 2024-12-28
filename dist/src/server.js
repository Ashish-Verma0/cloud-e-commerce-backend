"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const db_1 = __importDefault(require("./db/db"));
const app_1 = __importDefault(require("./app"));
const node_cluster_1 = __importDefault(require("node:cluster"));
const os_1 = require("os");
const contant_1 = require("../contant");
const PORT = contant_1.PORTS || 4000;
// AppDataSource.initialize()
//   .then(() => {
//     console.log("Database connected");
//     app.listen(PORT, () => {
//       console.log(`Server running on http://localhost:${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error("Error during Data Source initialization:", error);
//   });
if (node_cluster_1.default.isPrimary) {
    const numCPUs = (0, os_1.cpus)().length;
    for (let i = 0; i < numCPUs; i++) {
        node_cluster_1.default.fork();
    }
    node_cluster_1.default.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
}
else {
    db_1.default.initialize()
        .then(() => {
        console.log("Database connected");
        app_1.default.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
        .catch((error) => {
        console.error("Error during Data Source initialization:", error);
    });
}
