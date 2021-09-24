const express = require("express");
const cors = require("cors"); // require Express
const router = express.Router(); // setup usage of the Express router engine
/* PostgreSQL and PostGIS module and connection setup */
const { Client, Query } = require("pg");
const { MongoClient } = require("mongodb");
// or as an es module:
// import { MongoClient } from 'mongodb'
// Initialize connection once
MongoClient.connect(
  "mongodb://192.168.6.201:27017/admin",
  function (err, database) {
    if (err) return console.error(err);
    db = database;
  }
);
// Setup connection
const username = "postgres"; // sandbox username
const password = "postgres"; // read only privileges on our table
const host = "kastor";
const database = "bd_reestr_v3"; // database name
const conString =
  "postgres://" + username + ":" + password + "@" + host + "/" + database; // Your Database Connection

// Set up your database query to display GeoJSON
const geojsonQuery =
  "SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, object, row_to_json((array_to_string(array_agg(obj_name), '; '), array_to_string(array_agg(obj_authors), '; '), array_to_string(array_agg(obj_year), '; '), array_to_string(array_agg(type_of_work), '; '), array_to_string(array_agg(obj_assoc_inv_nums), '; '), array_to_string(array_agg(path_cloud), '; '), array_to_string(array_agg(lat_center), '; '), array_to_string(array_agg(lon_center), '; '), array_to_string(array_agg(stor_folder), '; ') )) As properties FROM uds_meta_view_mat_v4 As lg group by geom, object, area_skm order by area_skm desc) As f)As fc;";

const geojsonAprQuery =
  "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((objname, sinopsis, link, rang, catall, piobj, dop, funds, org_zayv)) As properties FROM \"uds_meta_apr_geom_view\" As lg) As f) As fc";

const layout1MQuery =
  "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((indexfull, url)) As properties FROM \"layout1m_shift_lng_mat\" As lg) As f) As fc";

const layout200KQuery =
  "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((name, url)) As properties FROM \"layout200k_shift_lng_mat\" As lg) As f) As fc";

const layout100KQuery =
  "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((indexfull, url)) As properties FROM \"layout100k_shift_lng_mat\" As lg) As f) As fc";

const test_newest =
  "SELECT row_to_json(fc) FROM (select 'FeatureCollection' As type, array_to_json(array_agg(gr1)) As features from (select 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, object as obj_name, (select array_to_json(array_agg(f)) from (select row_to_json((obj_name, obj_authors, obj_year, type_of_work, obj_assoc_inv_nums, path_cloud, lat_center, lon_center, stor_folder)) as f, geom, object from uds_meta_view_mat_v4 where id in (select id from uds_meta_view_mat_v4 where geom = lg.geom and object=lg.object group by geom, object, id)) as gr2 group by geom, object) as properties from uds_meta_view_mat_v4 as lg group by geom, object, area_skm order by area_skm desc) as gr1) As fc;";

// Set up your database query to display JSON
const jsonQuery =
  "SELECT array_to_json(array_agg(t)) FROM (select * from uds_meta) as t";

const jsonAprQuery =
  "SELECT array_to_json(array_agg(t)) FROM (select * from uds_meta_apr) as t";

const jsonFundQuery =
  "SELECT array_to_json(array_agg(t)) FROM (select * from fund) as t";

const jsonLibraryQuery =
  "SELECT array_to_json(array_agg(t)) FROM (select * from library) as t";

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;

router.get("/api/login", cors(), function (req, res, next) {
  db.collection("users", function (err, collection) {
    collection.find({}).toArray(function (err, data) {
      res.json(data);
    });
  });
});

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

router.get("/api/aprgeojson", cors(), function (req, res) {
  const client = new Client(conString);
  client.connect();
  const query = client.query(new Query(geojsonAprQuery));
  query.on("row", function (row, result) {
    result.addRow(row);
  });
  query.on("end", function (result) {
    res.send(result.rows[0].row_to_json);
    res.end();
  });
});

router.get("/api/layout1m", cors(), function (req, res) {
  const client = new Client(conString);
  client.connect();
  const query = client.query(new Query(layout1MQuery));
  query.on("row", function (row, result) {
    result.addRow(row);
  });
  query.on("end", function (result) {
    res.send(result.rows[0].row_to_json);
    res.end();
  });
});

router.get("/api/layout200K", cors(), function (req, res) {
  const client = new Client(conString);
  client.connect();
  const query = client.query(new Query(layout200KQuery));
  query.on("row", function (row, result) {
    result.addRow(row);
  });
  query.on("end", function (result) {
    res.send(result.rows[0].row_to_json);
    res.end();
  });
});

router.get("/api/layout100K", cors(), function (req, res) {
  const client = new Client(conString);
  client.connect();
  const query = client.query(new Query(layout100KQuery));
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

router.get("/api/apr", cors(), function (req, res) {
  const client = new Client(conString);
  client.connect();
  const query = client.query(new Query(jsonAprQuery));
  query.on("row", function (row, result) {
    result.addRow(row);
  });
  query.on("end", function (result) {
    res.send(result.rows[0].array_to_json);
    res.end();
  });
});

router.get("/api/fund", cors(), function (req, res) {
  const client = new Client(conString);
  client.connect();
  const query = client.query(new Query(jsonFundQuery));
  query.on("row", function (row, result) {
    result.addRow(row);
  });
  query.on("end", function (result) {
    res.send(result.rows[0].array_to_json);
    res.end();
  });
});

router.get("/api/library", cors(), function (req, res) {
  const client = new Client(conString);
  client.connect();
  const query = client.query(new Query(jsonLibraryQuery));
  query.on("row", function (row, result) {
    result.addRow(row);
  });
  query.on("end", function (result) {
    res.send(result.rows[0].array_to_json);
    res.end();
  });
});

router.get("/api/test_newest", cors(), function (req, res) {
  const client = new Client(conString);
  client.connect();
  const query = client.query(new Query(test_newest));
  query.on("row", function (row, result) {
    result.addRow(row);
  });
  query.on("end", function (result) {
    res.send(result.rows[0].row_to_json);
    res.end();
  });
});
