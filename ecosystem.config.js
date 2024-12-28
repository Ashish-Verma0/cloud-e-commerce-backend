module.exports = {
  apps: [
    {
      name: "e-commerce",
      script: "./dist/src/server.js",
      exec_mode: "cluster",
      instances: "max",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 10000,
      },
    },
  ],
};
console.log("env", process.env.PORT);
