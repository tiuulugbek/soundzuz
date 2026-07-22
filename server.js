const http = require('http');
const path = require('path');
const next = require('next');

const port = Number.parseInt(process.env.PORT || '3000', 10);
const hostname = process.env.HOST || '0.0.0.0';
const appDirectory = path.join(__dirname, 'apps', 'web');

const app = next({
  dev: false,
  dir: appDirectory,
  hostname,
  port,
});

const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = http.createServer((request, response) => {
      handle(request, response);
    });

    server.listen(port, hostname, () => {
      console.log(`Soundz web application is running on ${hostname}:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start the Soundz web application:', error);
    process.exit(1);
  });
