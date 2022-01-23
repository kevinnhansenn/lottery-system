const express = require("express");
const router = express.Router();
const { v4: uuid } = require("uuid");

module.exports = (buffer) => {
  // Middleware
  router.use((req, res, next) => {
    if (buffer.timer === undefined)
      return res
        .status(503)
        .send({ message: "Lottery system has not yet been started." });

    const apiKey = req.headers["x-contestant-api-key"];

    if (!apiKey || !apiKey.includes("-api-key"))
      return res.status(401).send({
        message: "Invalid Contestant Token",
      });

    req.contestantId = apiKey.replace("-api-key", "");

    next();
  });

  // Buy Lottery Ticket Using Contestant API Key
  router.get("/buy_ticket", (req, res) => {
    const contestantId = req.contestantId;
    const exists = buffer.active.find((a) => a.contestant_id === contestantId);

    if (exists)
      return res.status(403).send({
        message: "You are only allow to possess one ticket for the next draw.",
      });

    const ticketId = uuid();

    buffer.active.push({
      contestant_id: contestantId,
      ticket_id: ticketId,
    });
    res.status(200).send({ ticket_id: ticketId });
  });

  // Check Latest Lottery Ticket Status
  router.get("/status_ticket", (req, res) => {
    const contestantId = req.contestantId;
    const exists = buffer.active.find((a) => a.contestant_id === contestantId);

    if (exists)
      return res
        .status(200)
        .send({ status: "waiting", ticket_id: exists.ticket_id });

    const history = buffer.history.reverse();

    let status;
    let ticketId;

    for (let h of history) {
      if (h.winning_contestant_id === contestantId) {
        status = "win";
        ticketId = h.winning_ticket_id;
        break;
      }
      const exists = h.all_tickets_this_round.find(
        (t) => t.contestant_id === contestantId
      );
      if (exists) {
        status = "lose";
        ticketId = exists.ticket_id;
        break;
      }
    }

    if (status === undefined)
      return res.status(404).send("You haven't purchase any lottery ticket.");

    res.status(200).send({ status, ticket_id: ticketId });
  });

  // Retrieve All history of Contestant Ticket
  router.get("/my_tickets", (req, res) => {
    const contestantId = req.contestantId;
    const exists = buffer.active.find((a) => a.contestant_id === contestantId);

    let active_ticket = "-";
    let all_tickets = [];

    if (exists) {
      active_ticket = exists.ticket_id;
    }

    const history = buffer.history.reverse();
    for (let h of history) {
      if (h.winning_contestant_id === contestantId) {
        all_tickets.push(`WIN: ${h.winning_ticket_id}`);
        continue;
      }
      const exists = h.all_tickets_this_round.find(
        (t) => t.contestant_id === contestantId
      );
      if (exists) {
        all_tickets.push(`LOSE: ${exists.ticket_id}`);
      }
    }

    res.status(200).send({ active_ticket, all_tickets });
  });
  return router;
};
