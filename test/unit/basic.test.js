describe("Basic Tests", () => {
  test("should pass basic math", () => {
    expect(1 + 1).toBe(2);
  });

  test("should check environment", () => {
    expect(process.env.NODE_ENV).toBe("test");
  });
});
