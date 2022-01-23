const app = require("./app");
const { outputLog } = require("./helper");

const start = (port) => {
  try {
    app.listen(port, () => {
      console.log(`==========================================================`);
      console.log(`Lottery Backend System`);
      console.log();
      console.log(`Server is running on port ${port}`);
      console.log(`API Documentation is served on http://0.0.0.0:${port}/docs`);
      console.log(`==========================================================`);
      console.log();
      console.log(`System Log:`);
      outputLog("Lottery Backend Status: Inactive");
    });
  } catch (e) {
    console.err(e);
    app.kill();
    process.exit();
  }
};

start(3456);
