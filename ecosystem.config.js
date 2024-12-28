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
    },
  ],
};
