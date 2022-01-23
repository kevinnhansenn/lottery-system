const outputLog = (msg) => {
  return console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
};

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = {
  outputLog,
  getRandomInt,
};
