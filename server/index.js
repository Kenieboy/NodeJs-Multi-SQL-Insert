import express from "express";
import mysql from "mysql";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "crud",
});

db.connect();

// ALL QUERY IN THIS AREA

app.post("/insertBooks", (req, res) => {
  const books = req.body;

  //res.json(books.length);

  books.forEach((book) => {
    const { title, description, cover, price } = book;
    const sql = `INSERT INTO books (title, description, cover, price) VALUES (?, ?, ?, ?)`;
    const values = [title, description, cover, price];

    db.query(sql, values, (err, data) => {
      if (err) {
        console.error("Error inserting book:", err);
        res.status(500).json({ message: "Error inserting book" });
      } else {
        console.log(`Book with TITLE ${title} inserted into the database`);
      }
    });
  });
});

app.get("/", (req, res) => {
  const sql = "SELECT * FROM books";

  db.query(sql, (err, data) => {
    if (err) res.json(err);
    res.json(data);
  });
});

// END ALL QUERY

process.on("SIGINT", () => {
  db.end();
  process.exit();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
