// Test the routing logic
process.env.VERCEL = 'true';
const app = require('./server/dist/app.js');

console.log('App routes:');
app._router.stack.forEach((layer) => {
  if (layer.route) {
    console.log(`  ${layer.route.stack[0].method.toUpperCase()} ${layer.route.path}`);
  } else if (layer.regexp && layer.regexp.source) {
    console.log(`  Middleware: ${layer.regexp.source}`);
  }
});
