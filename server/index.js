import express from "express";
import mysql from "mysql";
import cors from "cors";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
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

app.get("/", (req, res) => {
  console.log("Cookies:", req.cookies);

  req.clearCookie("name");

  console.log("Signed Cookies", req.signedCookies);
});

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

app.get("/books", (req, res) => {
  const sql = "SELECT * FROM books";

  db.query(sql, (err, data) => {
    if (err) res.json(err);
    res.json(data);
  });
});

app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, data) => {
    if (err) throw err;
    res.json(data);
  });
});

app.post("/users", (req, res) => {
  const myPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(myPassword, 10);

  const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
  const values = [req.body.username, req.body.email, hashedPassword];
  db.query(sql, values, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error inserting user into database" });
      return;
    }
    res.json("User successfully inserted into the database.");
  });
});

app.get("/authenticate", (req, res) => {
  const { username, password } = req.body;

  // Log start time
  const startTime = new Date();

  const sql = `SELECT * FROM users WHERE username = ?`;

  db.query(sql, [username], async (err, data) => {
    // Log end time
    const endTime = new Date();

    // Calculate duration in milliseconds
    const queryTime = endTime - startTime + 2000;

    console.log(`Query execution time: ${queryTime}ms`);

    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    if (data.length === 0) {
      res.status(400).json({ error: "User not found" });
      return;
    }

    const user = data[0];

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const { id, username, email } = user;

      res.json({ id, username, email, queryTime });
    } else {
      res.status(401).json({ error: "Authentication failed" });
    }
  });
});

app.get("/test/:id/:anotherid", (req, res) => {
  const { id, anotherid } = req.params;
  res.json(`${id}, ${anotherid}`);
});

// END ALL QUERY

process.on("SIGINT", () => {
  db.end();
  process.exit();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
