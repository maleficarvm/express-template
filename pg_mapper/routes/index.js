const express = require("express");
const cors = require("cors"); // require Express
const router = express.Router(); // setup usage of the Express router engine

/* PostgreSQL and PostGIS module and connection setup */
const { Client, Query } = require("pg");

// Setup connection
const username = "postgres"; // sandbox username
const password = "postgres"; // read only privileges on our table
const host = "kastor";
const database = "bd_reestr_v2"; // database name
const conString =
  "postgres://" + username + ":" + password + "@" + host + "/" + database; // Your Database Connection

// Set up your database query to display GeoJSON
const geojsonQuery =
  "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((obj_name, obj_authors, obj_year, type_of_work, obj_assoc_inv_nums, path_cloud)) As properties FROM \"uds_meta_view_v2\" As lg) As f) As fc";

const jsonQuery =
  "SELECT array_to_json(array_agg(t)) FROM (select * from uds_meta) as t";

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;

/* GET Postgres GeoJSON data */
router.get("/api/geojson", cors(), function (req, res) {
  const client = new Client(conString);
  client.connect();
  const query = client.query(new Query(geojsonQuery));
  query.on("row", function (row, result) {
    result.addRow(row);
  });
  query.on("end", function (result) {
    res.send(result.rows[0].row_to_json);
    res.end();
  });
});

/* GET Postgres JSON data */
router.get("/api/json", cors(), function (req, res) {
  const client = new Client(conString);
  client.connect();
  const query = client.query(new Query(jsonQuery));
  query.on("row", function (row, result) {
    result.addRow(row);
  });
  query.on("end", function (result) {
    res.send(result.rows[0].array_to_json);
    res.end();
  });
});
