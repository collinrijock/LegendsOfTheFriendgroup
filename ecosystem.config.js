module.exports = {
  apps: [
    {
      name: "lotf-server",
      script: "packages/server/dist/server.js", // Path to the compiled server entry point
      cwd: __dirname, // Set current working directory to the project root
      watch: false, // Disable watching for production, or configure carefully
      env: {
        NODE_ENV: "development", // Default environment
      },
      env_production: {
        NODE_ENV: "production", // Environment for `pm2 start ecosystem.config.js --env production`
        // PORT: 4001, // You can override .env variables here if needed
      },
      // Log files configuration (optional)
      // out_file: "./logs/lotf-server-out.log",
      // error_file: "./logs/lotf-server-err.log",
      // log_date_format: "YYYY-MM-DD HH:mm Z",
      // merge_logs: true,
    },
  ],
};