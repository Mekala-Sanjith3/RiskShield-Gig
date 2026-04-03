// Mock DB Connection for now
// Later replace with MySQL/PostgreSQL connection

const db = {
  connect: () => console.log("Mock Database Connected"),
  query: (sql, params) => {
    console.log(`Executing SQL: ${sql}`);
    return Promise.resolve({ insertId: 1 });
  },
};

module.exports = db;
