module.exports = {
  apps: [
    {
      name: "cinemarathi-admin",
      cwd: "/var/www/cinemarathi-api",
      script: "./node_modules/.bin/next",
      args: "start -p 3000 --hostname 0.0.0.0",
      interpreter: "node",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "cinemarathi-api",
      cwd: "/var/www/cinemarathi-api",
      script: "server.js",
      interpreter: "node",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}
