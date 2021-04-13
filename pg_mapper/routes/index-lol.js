const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.listen(8000, () => {
  console.log(`Server is running.`);
});

const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "kastor",
  database: "bd_reestr_v2",
  password: "postgres",
  port: 5432,
});

app.get("/api/v1/issues", (req, res) => {
  pool.query("SELECT obj_name FROM ", [], (error, results) => {
    if (error) {
      throw error;
    }

    res.status(200).json(results.rows);
  });
});
