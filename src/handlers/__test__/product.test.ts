import request from "supertest";
import server from "../../server";

describe("POST /api/products", () => {
  it("should display validation errors", async () => {
    const response = await request(server).post("/api/products/").send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");

    expect(response.status).not.toBe(404);
  });

  it("should validate that the price is greater than 0", async () => {
    const response = await request(server).post("/api/products/").send({
      name: "A - Test",
      price: 0,
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");

    expect(response.status).not.toBe(404);
  });

  it("should validate that the price is a string", async () => {
    const response = await request(server).post("/api/products/").send({
      name: "A - Test",
      price: "word",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");

    expect(response.status).not.toBe(404);
  });

  it("should create a new product", async () => {
    const response = await request(server).post("/api/products").send({
      name: "A - Test",
      price: 100,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("data");

    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(404);
    expect(response.body).not.toHaveProperty("errors");
  });
});

describe("GET /api/products", () => {
  it("should check if api/products ulr exits", async () => {
    const response = await request(server).get("/api/products");
    expect(response.status).not.toBe(404);
  });

  it("should a JSON response", async () => {
    const response = await request(server).get("/api/products");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).not.toHaveProperty("errors");
  });
});

describe("GET /api/products/:id", () => {
  it("should return a 404 reponse for a non-existent product", async () => {
    const productID = 2000;
    const response = await request(server).get(`/api/products/${productID}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Producto no encontrado");

    expect(response.status).not.toBe(200);
  });

  it("should check a valid id in the URL", async () => {
    const response = await request(server).get("/api/products/not-valid-url");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");

    expect(response.body.errors[0].msg).toBe("Valor no valido");
  });

  it("get a JSON response for a single product", async () => {
    const response = await request(server).get("/api/products/1");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
  });
});

describe("PUT /api/products/:id", () => {
  it("should return a 404 reponse for a non-existent product", async () => {
    const productID = 2000;
    const response = await request(server)
      .put(`/api/products/${productID}`)
      .send({
        name: "B - Test",
        price: 100,
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Producto no encontrado");

    expect(response.status).not.toBe(200);
  });

  it("should check a valid id in the URL", async () => {
    const response = await request(server)
      .put("/api/products/not-valid-url")
      .send({
        name: "B - Test",
        price: 100,
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");

    expect(response.body.errors[0].msg).toBe("Valor no valido");
  });

  it("should display validation error messages when a product", async () => {
    const response = await request(server).put("/api/products/1").send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");

    expect(response.status).not.toBe(200);
    expect(response.body).not.toHaveProperty("data");
  });

  it("should validation that the price is greater than 0", async () => {
    const response = await request(server).put("/api/products/1").send({
      name: "B - Test",
      price: -100,
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeTruthy();
    expect(response.body.errors[0].msg).toBe("Precio no valido");

    expect(response.status).not.toBe(200);
    expect(response.body).not.toHaveProperty("data");
  });

  it("should update an existing product with valid data", async () => {
    const response = await request(server).put("/api/products/1").send({
      name: "B - Test",
      price: 100,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");

    expect(response.status).not.toBe(400);
    expect(response.body).not.toHaveProperty("errors");
  });
});

describe('PATCH  /api/products/:id', () => {
  it("should check a valid id in the URL", async () => {
    const response = await request(server).patch(
      "/api/products/not-valid-url"
    );

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");

    expect(response.body.errors[0].msg).toBe("Valor no valido");
  });

  it("should return a 404 reponse for a non-existent product", async () => {
    const productID = 2000;
    const response = await request(server).patch(`/api/products/${productID}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Producto no encontrado");

    expect(response.status).not.toBe(200);

  });

  it("should update the product availability", async () => {
    const response = await request(server).patch('/api/products/1');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");

    expect(response.body.data.availability).toBe(false);    

    expect(response.status).not.toBe(404);
    expect(response.status).not.toBe(400);

  });
});

describe("DELETE /api/products/:id", () => {
  it("should check a valid id in the URL", async () => {
    const response = await request(server).delete(
      "/api/products/not-valid-url"
    );

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");

    expect(response.body.errors[0].msg).toBe("Valor no valido");
  });

  it("should return a 404 reponse for a non-existent product", async () => {
    const productID = 2000;
    const response = await request(server).delete(`/api/products/${productID}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Producto no encontrado");

    expect(response.status).not.toBe(200);

  });

  it("should return a 404 reponse for a non-existent product", async () => {
    const response = await request(server).delete('/api/products/1');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");

    expect(response.status).not.toBe(484);
    expect(response.status).not.toBe(400);
  });

});

