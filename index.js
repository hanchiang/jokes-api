const app = require('./app');

const PORT = process.env.PORT || 3000;
const routes = require('./routes');

app.use(routes);

app.listen(PORT, () => {
  console.log(`Express is running on port ${PORT}.`)
})