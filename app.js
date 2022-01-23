const express = require("express");
const redoc = require("redoc-express");
const cors = require("cors");
const bodyParser = require("body-parser");
const internalRouter = require("./routes/internal");
const publicRouter = require("./routes/public");

const app = express();

// For simplicity, buffer (data) is written as object instead of Class.
const buffer = {
  timer: undefined,
  active: [
    // {
    //   contestant_id: 'x',
    //   ticket_id: 'x'
    // }
  ],
  history: [
    // {
    //   draw_no: x,
    //   winning_contestant_id: 'x',
    //   winning_ticket_id: 'x',
    //   all_tickets_this_round: [
    //     {
    //       contestant_id: 'x',
    //       ticket_id: 'x'
    //     }
    //   ]
    // },
  ],
};

app.kill = () => {
  clearInterval(buffer.timer);
};

app.use(cors());
app.use(express.json());
app.use("/api/v1/internal", internalRouter(buffer));
app.use("/api/v1/public", publicRouter(buffer));

app.get("/docs/swagger.yaml", (req, res) => {
  res.sendFile("swagger.yaml", { root: "." });
});

app.get(
  "/docs",
  redoc({
    title: "API Docs",
    specUrl: "/docs/swagger.yaml",
  })
);

module.exports = app;
