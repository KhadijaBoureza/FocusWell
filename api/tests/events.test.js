const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

describe("Events API", () => {
  test("GET /events returns an array", async () => {
    const res = await request(app).get("/events");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /events creates a valid event", async () => {
    const res = await request(app)
      .post("/events")
      .send({
        title: "Test event",
        date: "2026-04-29",
        time: "10:00",
        type: "meeting",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Test event");
    expect(res.body.date).toBe("2026-04-29");
    expect(res.body.time).toBe("10:00");
    expect(res.body.type).toBe("meeting");
    expect(res.body._id).toBeDefined();
  });

  test("POST /events defaults type to meeting", async () => {
    const res = await request(app)
      .post("/events")
      .send({
        title: "Default type event",
        date: "2026-04-29",
        time: "11:00",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.type).toBe("meeting");
  });

  test("POST /events rejects missing title", async () => {
    const res = await request(app)
      .post("/events")
      .send({
        date: "2026-04-29",
        time: "10:00",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("POST /events rejects missing date", async () => {
    const res = await request(app)
      .post("/events")
      .send({
        title: "Missing date",
        time: "10:00",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("POST /events rejects missing time", async () => {
    const res = await request(app)
      .post("/events")
      .send({
        title: "Missing time",
        date: "2026-04-29",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("POST /events rejects invalid type", async () => {
    const res = await request(app)
      .post("/events")
      .send({
        title: "Bad type",
        date: "2026-04-29",
        time: "10:00",
        type: "holiday",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(
      "Type must be one of: meeting, interview, schedule, event"
    );
  });

  test("DELETE /events/:id deletes a valid event", async () => {
    const created = await request(app)
      .post("/events")
      .send({
        title: "Delete event",
        date: "2026-04-29",
        time: "12:00",
      });

    const res = await request(app).delete(`/events/${created.body._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /events/:id rejects invalid id", async () => {
    const res = await request(app).delete("/events/not-valid-id");

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid event id");
  });

  test("DELETE /events/:id returns 404 for missing event", async () => {
    const missingId = new mongoose.Types.ObjectId();

    const res = await request(app).delete(`/events/${missingId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Event not found");
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});