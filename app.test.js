const test = require("supertest");
const app = require("./app");
const assert = require("assert");

const ir = "/api/v1/internal/";
const pr = "/api/v1/public/";
const iak = "internal-api-key";
const aAPI = "a-api-key";
const bAPI = "b-api-key";
const cAPI = "c-api-key";

describe("Testing for Success - Backend System Status", () => {
  it("Starting the backend system - Should be activated", async () => {
    const res = await test(app)
      .post(ir + "/start_system")
      .send({ draw_interval: 20 })
      .set("X-INTERNAL-API-KEY", iak);

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual("active");
  });

  it("Checking backend status - Should be 'active'", async () => {
    const res = await test(app)
      .get(ir + "/status_system")
      .set("X-INTERNAL-API-KEY", iak);

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual("active");
  });

  it("Stopping the backend system - Should be deactivated", async () => {
    const res = await test(app)
      .post(ir + "/start_system")
      .send({ draw_interval: 0 })
      .set("X-INTERNAL-API-KEY", iak);

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual("inactive");
  });

  it("Checking backend status - Should be 'inactive'", async () => {
    const res = await test(app)
      .get(ir + "/status_system")
      .set("X-INTERNAL-API-KEY", iak);

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual("inactive");
  });
});

describe("Testing for Failure - Backend System Status", () => {
  it("Starting the backend system with invalid payload - Should be 400", async () => {
    const res = await test(app)
      .post(ir + "/start_system")
      .send({ draw_interval: "whatever" })
      .set("X-INTERNAL-API-KEY", iak);

    expect(res.status).toEqual(400);
  });

  it("Starting the backend system without API key - Should be 401", async () => {
    const res = await test(app)
      .post(ir + "/start_system")
      .send({ draw_interval: 20 });

    expect(res.status).toEqual(401);
  });

  it("Checking backend status without API key - Should be 401", async () => {
    const res = await test(app).get(ir + "/status_system");

    expect(res.status).toEqual(401);
  });
});

describe("Testing for Failure - When Backend System is Off", () => {
  it("Stopping the backend system - Should be deactivated", async () => {
    const res = await test(app)
      .post(ir + "/start_system")
      .send({ draw_interval: 0 })
      .set("X-INTERNAL-API-KEY", iak);

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual("inactive");
  });

  it("Accessing draw_history/ - Should be 503", async () => {
    const res = await test(app)
      .get(ir + "/draw_history")
      .set("X-INTERNAL-API-KEY", iak);

    expect(res.status).toEqual(503);
  });

  it("Accessing buy_ticket - Should be 503", async () => {
    const res = await test(app)
      .get(pr + "/buy_ticket")
      .set("X-CONTESTANT-API-KEY", aAPI);

    expect(res.status).toEqual(503);
  });

  it("Accessing status_ticket - Should be 503", async () => {
    const res = await test(app)
      .get(pr + "/status_ticket")
      .set("X-CONTESTANT-API-KEY", aAPI);

    expect(res.status).toEqual(503);
  });

  it("Accessing my_tickets - Should be 503", async () => {
    const res = await test(app)
      .get(pr + "/my_tickets")
      .set("X-CONTESTANT-API-KEY", aAPI);

    expect(res.status).toEqual(503);
  });
});

describe("Testing for Success - Contestant trying to buy a ticket", () => {
  let ticketA;
  let ticketB;

  it("Starting the backend system - Should be activated", async () => {
    const res = await test(app)
      .post(ir + "/start_system")
      .send({ draw_interval: 20 })
      .set("X-INTERNAL-API-KEY", iak);

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual("active");
  });

  it("Contestant-A try to buy a ticket - Should be 200 and receive ticket_id", async () => {
    const res = await test(app)
      .get(pr + "/buy_ticket")
      .set("X-CONTESTANT-API-KEY", aAPI);

    expect(res.status).toEqual(200);
    expect(res.body.ticket_id).toBeDefined();
    ticketA = res.body.ticket_id;
  });

  it("Contestant-A try to check its status - Should be 200 and should match her waiting ticket", async () => {
    const res = await test(app)
      .get(pr + "/status_ticket")
      .set("X-CONTESTANT-API-KEY", aAPI);

    expect(res.status).toEqual(200);
    expect(res.body.ticket_id).toEqual(ticketA);
    expect(res.body.status).toEqual("waiting");
  });

  it("Contestant-A try to check all of her tickets - Should be 200 and get her own wallet", async () => {
    const res = await test(app)
      .get(pr + "/my_tickets")
      .set("X-CONTESTANT-API-KEY", aAPI);

    expect(res.status).toEqual(200);
    expect(res.body.active_ticket).toEqual(ticketA);
    expect(res.body.all_tickets).toEqual([]);
  });

  it("Contestant-B try to buy a ticket - Should be 200 and receive another ticket_id", async () => {
    const res = await test(app)
      .get(pr + "/buy_ticket")
      .set("X-CONTESTANT-API-KEY", bAPI);

    expect(res.status).toEqual(200);
    expect(res.body.ticket_id).toBeDefined();
    ticketB = res.body.ticket_id;
  });

  it("Contestant-B try to check its status - Should be 200 and should match her waiting ticket", async () => {
    const res = await test(app)
      .get(pr + "/status_ticket")
      .set("X-CONTESTANT-API-KEY", bAPI);

    expect(res.status).toEqual(200);
    expect(res.body.ticket_id).toEqual(ticketB);
    expect(res.body.status).toEqual("waiting");
  });

  it("Contestant-B try to check all of her tickets - Should be 200 and get her own wallet", async () => {
    const res = await test(app)
      .get(pr + "/my_tickets")
      .set("X-CONTESTANT-API-KEY", bAPI);

    expect(res.status).toEqual(200);
    expect(res.body.active_ticket).toEqual(ticketB);
    expect(res.body.all_tickets).toEqual([]);
  });
});

describe("Testing for Failure - Contestant trying to buy a ticket", () => {
  let ticketA;
  let ticketB;

  it("Starting the backend system - Should be activated", async () => {
    const res = await test(app)
      .post(ir + "/start_system")
      .send({ draw_interval: 20 })
      .set("X-INTERNAL-API-KEY", iak);

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual("active");
  });

  it("Contestant-A try to buy a ticket - Should be 200 and receive ticket_id", async () => {
    const res = await test(app)
      .get(pr + "/buy_ticket")
      .set("X-CONTESTANT-API-KEY", aAPI);

    expect(res.status).toEqual(200);
    expect(res.body.ticket_id).toBeDefined();
    ticketA = res.body.ticket_id;
  });

  it("Contestant-A try to buy a ticket again - Should be 403", async () => {
    const res = await test(app)
      .get(pr + "/buy_ticket")
      .set("X-CONTESTANT-API-KEY", aAPI);

    expect(res.status).toEqual(403);
  });

  it("Accessing /buy_ticket without API key - Should be 401", async () => {
    const res = await test(app).get(pr + "/buy_ticket");

    expect(res.status).toEqual(401);
  });

  it("Accessing /status_ticket without API key - Should be 401", async () => {
    const res = await test(app).get(pr + "/status_ticket");

    expect(res.status).toEqual(401);
  });

  it("Accessing /my_tickets without API key - Should be 401", async () => {
    const res = await test(app).get(pr + "/my_tickets");

    expect(res.status).toEqual(401);
  });

  it("Check ticket when the contestant does not have a ticket - Should be 404", async () => {
    const res = await test(app)
      .get(pr + "/check_ticket")
      .set("X-CONTESTANT-API-KEY", cAPI);

    expect(res.status).toEqual(404);
  });
});

afterEach(function () {
  app.kill(); // prevent memory leaks.
});
