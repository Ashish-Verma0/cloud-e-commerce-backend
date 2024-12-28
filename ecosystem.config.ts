module.exports = {
  apps: [
    {
      name: "e-commerce",
      script: "./dist/src/server.js", // Path to the compiled server file
      exec_mode: "cluster",
      instances: "max",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000, // Default port in production
      },
      env_development: {
        NODE_ENV: "development", // Ensure this environment variable is set
        PORT: process.env.PORT || 10000, // Default port for development
      },
    },
  ],
};
