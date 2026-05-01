const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

describe("Wellbeing API", () => {
  describe("Moods", () => {
    test("GET /wellbeing/moods returns an array", async () => {
      const res = await request(app).get("/wellbeing/moods");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("POST /wellbeing/moods creates a valid mood", async () => {
      const res = await request(app)
        .post("/wellbeing/moods")
        .send({ mood: "good" });

      expect(res.statusCode).toBe(200);
      expect(res.body.mood).toBe(4);
      expect(res.body.label).toBe("Good");
      expect(res.body._id).toBeDefined();
    });

    test("POST /wellbeing/moods rejects invalid mood", async () => {
      const res = await request(app)
        .post("/wellbeing/moods")
        .send({ mood: "angry" });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    test("DELETE /wellbeing/moods/:id deletes a valid mood", async () => {
      const created = await request(app)
        .post("/wellbeing/moods")
        .send({ mood: "okay" });

      const res = await request(app).delete(
        `/wellbeing/moods/${created.body._id}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("DELETE /wellbeing/moods/:id rejects invalid id", async () => {
      const res = await request(app).delete("/wellbeing/moods/not-valid-id");

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Invalid mood entry id");
    });

    test("DELETE /wellbeing/moods/:id returns 404 for missing valid id", async () => {
      const missingId = new mongoose.Types.ObjectId();

      const res = await request(app).delete(`/wellbeing/moods/${missingId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Mood entry not found");
    });
  });

  describe("Journal", () => {
    test("GET /wellbeing/journal returns an array", async () => {
      const res = await request(app).get("/wellbeing/journal");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("POST /wellbeing/journal creates normal journal entry", async () => {
      const res = await request(app)
        .post("/wellbeing/journal")
        .send({
          text: "Testing journal entry",
          mood: 4,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.text).toBe("Testing journal entry");
      expect(res.body.mood).toBe(4);
      expect(res.body.locked).toBe(false);
      expect(res.body._id).toBeDefined();
    });

    test("POST /wellbeing/journal rejects empty unlocked journal", async () => {
      const res = await request(app)
        .post("/wellbeing/journal")
        .send({ text: "" });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Journal text is required");
    });

    test("POST /wellbeing/journal creates locked encrypted journal", async () => {
      const res = await request(app)
        .post("/wellbeing/journal")
        .send({
          text: "",
          locked: true,
          encrypted: {
            ciphertext: "fakeCiphertext",
            iv: "fakeIv",
            salt: "fakeSalt",
          },
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.locked).toBe(true);
      expect(res.body.text).toBe("");
      expect(res.body.encrypted.ciphertext).toBe("fakeCiphertext");
      expect(res.body.encrypted.iv).toBe("fakeIv");
      expect(res.body.encrypted.salt).toBe("fakeSalt");
    });

    test("POST /wellbeing/journal rejects locked journal missing encrypted payload", async () => {
      const res = await request(app)
        .post("/wellbeing/journal")
        .send({ locked: true });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain("Missing encrypted fields");
    });

    test("POST /wellbeing/journal rejects locked journal missing one encrypted field", async () => {
      const res = await request(app)
        .post("/wellbeing/journal")
        .send({
          locked: true,
          encrypted: {
            ciphertext: "fakeCiphertext",
            iv: "fakeIv",
          },
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain("salt");
    });

    test("POST /wellbeing/journal rejects invalid mood", async () => {
      const res = await request(app)
        .post("/wellbeing/journal")
        .send({
          text: "Invalid mood test",
          mood: 8,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Mood must be one of: 1, 2, 3, 4, 5");
    });

    test("POST /wellbeing/journal rejects invalid locked type", async () => {
      const res = await request(app)
        .post("/wellbeing/journal")
        .send({
          text: "Bad locked type",
          locked: "yes",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("locked must be true or false");
    });

    test("DELETE /wellbeing/journal/:id deletes a valid journal entry", async () => {
      const created = await request(app)
        .post("/wellbeing/journal")
        .send({ text: "Delete me" });

      const res = await request(app).delete(
        `/wellbeing/journal/${created.body._id}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("DELETE /wellbeing/journal/:id rejects invalid id", async () => {
      const res = await request(app).delete("/wellbeing/journal/not-valid-id");

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Invalid journal entry id");
    });

    test("DELETE /wellbeing/journal/:id returns 404 for missing valid id", async () => {
      const missingId = new mongoose.Types.ObjectId();

      const res = await request(app).delete(`/wellbeing/journal/${missingId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Journal entry not found");
    });
  });

  describe("Passcode", () => {
    test("GET /wellbeing/journal/passcode returns passcodeHash property", async () => {
      const res = await request(app).get("/wellbeing/journal/passcode");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("passcodeHash");
    });

    test("PUT /wellbeing/journal/passcode saves passcode hash", async () => {
      const res = await request(app)
        .put("/wellbeing/journal/passcode")
        .send({ passcodeHash: "testHash123" });

      expect(res.statusCode).toBe(200);
      expect(res.body.passcodeHash).toBe("testHash123");
    });

    test("PUT /wellbeing/journal/passcode rejects empty passcode hash", async () => {
      const res = await request(app)
        .put("/wellbeing/journal/passcode")
        .send({ passcodeHash: "" });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe(
        "passcodeHash must be a non-empty string or null"
      );
    });

    test("PUT /wellbeing/journal/passcode clears passcode hash with null", async () => {
      const res = await request(app)
        .put("/wellbeing/journal/passcode")
        .send({ passcodeHash: null });

      expect(res.statusCode).toBe(200);
      expect(res.body.passcodeHash).toBe(null);
    });
  });
});

// afterAll(async () => {
//   await mongoose.connection.close();
// });