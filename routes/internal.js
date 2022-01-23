const express = require("express");
const { getRandomInt, outputLog } = require("../helper");
const router = express.Router();

module.exports = (buffer) => {
  // Middleware
  router.use((req, res, next) => {
    const apiKey = req.headers["x-internal-api-key"];

    if (apiKey !== "internal-api-key")
      return res.status(401).send({
        message: "Invalid Internal Token",
      });

    next();
  });

  // Start and Stop Lottery System
  router.post("/start_system", (req, res) => {
    const drawInterval = req.body.draw_interval;

    if (typeof drawInterval !== "number")
      res.status(400).send({
        message: "draw_interval must be integer",
      });

    clearInterval(buffer.timer);
    buffer.timer = undefined;
    buffer.history = [];
    buffer.active = [];

    if (drawInterval <= 0) {
      outputLog(`Lottery Backend Status: Inactive`);
      return res.status(200).send({
        status: "inactive",
      });
    }

    buffer.timer = setInterval(() => {
      const active = buffer.active;
      const history = buffer.history;
      const drawNo = history.length + 1;

      if (active.length === 0) {
        history.push({
          draw_no: drawNo,
          winning_contestant_id: "-",
          winning_ticket_id: "-",
          all_tickets_this_round: [],
        });
      } else {
        const index = getRandomInt(0, active.length - 1);
        const ticket = active[index];

        history.push({
          draw_no: drawNo,
          winning_contestant_id: ticket.contestant_id,
          winning_ticket_id: ticket.ticket_id,
          all_tickets_this_round: active,
        });
      }
      buffer.active = [];

      const latest = buffer.history.at(-1);
      outputLog(
        `Draw #${latest.draw_no}: ${latest.winning_ticket_id} (Contestant ID: ${latest.winning_contestant_id})`
      );
    }, drawInterval * 1000);

    outputLog(`Lottery Backend Status: Active (Config: ${drawInterval}s)`);
    res.status(200).send({
      status: "active",
    });
  });

  // Check Status System
  router.get("/status_system", (req, res) => {
    if (buffer.timer === undefined)
      return res.status(200).send({ status: "inactive" });

    res.status(200).send({ status: "active" });
  });

  // Retrieve All Draws History
  router.get("/draw_history", (req, res) => {
    if (buffer.timer === undefined)
      return res
        .status(503)
        .send({ message: "Lottery system has not yet been started." });

    const history = buffer.history.sort((a, b) => a.draw_no - b.draw_no);
    res.send(history);
  });

  return router;
};
