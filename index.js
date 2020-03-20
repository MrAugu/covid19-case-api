const express = require("express");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");

const cache = {
    "all": {},
    "countries": [],
    "states": []
};

const updateAll = async () => {
  let response;
  try {
    response = await axios.get("https://www.worldometers.info/coronavirus/");
    if (response.status !== 200) {
      console.log("ERROR");
    }
  } catch (err) {
    return null;
  }

  const result = {};

  const html = cheerio.load(response.data);
  html(".maincounter-number").filter((i, el) => {
    let count = el.children[0].next.children[0].data || "0";
    count = parseInt(count.replace(/,/g, "") || "0", 10);
    // first one is
    if (i === 0) {
      result.cases = count;
    } else if (i === 1) {
      result.deaths = count;
    } else {
      result.recovered = count;
    }
  });

  console.log("Updated The Cases");
  cache["all"] = result;
};

const updateCountries = async () => {
  let response;
  try {
    response = await axios.get("https://www.worldometers.info/coronavirus/");
    if (response.status !== 200) {
      console.log("Error", response.status);
    }
  } catch (err) {
    return null;
  }

  const result = [];

  const html = cheerio.load(response.data);
  const countriesTable = html("table#main_table_countries_today");
  const countriesTableCells = countriesTable
    .children("tbody")
    .children("tr")
    .children("td");

  const totalColumns = 9;
  const countryColIndex = 0;
  const casesColIndex = 1;
  const todayCasesColIndex = 2;
  const deathsColIndex = 3;
  const todayDeathsColIndex = 4;
  const curedColIndex = 5;
  const activeColIndex = 6;
  const criticalColIndex = 7;

  for (let i = 0; i < countriesTableCells.length - totalColumns; i += 1) {
    const cell = countriesTableCells[i];
    
    if (i % totalColumns === countryColIndex) {
      let country =
        cell.children[0].data ||
        cell.children[0].children[0].data ||
        cell.children[0].children[0].children[0].data ||
        cell.children[0].children[0].children[0].children[0].data ||
        "";
      country = country.trim();
      if (country.length === 0) {
        country = cell.children[0].next.children[0].data || "";
      }
      result.push({ country: country.trim() || "" });
    }
    if (i % totalColumns === casesColIndex) {
      let cases = cell.children.length != 0 ? cell.children[0].data : "";
      result[result.length - 1].cases = parseInt(
        cases.trim().replace(/,/g, "") || "0",
        10
      );
    }
    if (i % totalColumns === todayCasesColIndex) {
      let cases = cell.children.length != 0 ? cell.children[0].data : "";
      result[result.length - 1].todayCases = parseInt(
        cases.trim().replace(/,/g, "") || "0",
        10
      );
    }
    if (i % totalColumns === deathsColIndex) {
      let deaths = cell.children.length != 0 ? cell.children[0].data : "";
      result[result.length - 1].deaths = parseInt(
        deaths.trim().replace(/,/g, "") || "0",
        10
      );
    }
    if (i % totalColumns === todayDeathsColIndex) {
      let deaths = cell.children.length != 0 ? cell.children[0].data : "";
      result[result.length - 1].todayDeaths = parseInt(
        deaths.trim().replace(/,/g, "") || "0",
        10
      );
    }
    if (i % totalColumns === curedColIndex) {
      let cured = cell.children.length != 0 ? cell.children[0].data : "";
      result[result.length - 1].recovered = parseInt(
        cured.trim().replace(/,/g, "") || 0,
        10
      );
    }
    if (i % totalColumns === activeColIndex) {
      let cured = cell.children.length != 0 ? cell.children[0].data : "";
      result[result.length - 1].active = parseInt(
        cured.trim().replace(/,/g, "") || 0,
        10
      );
    }
    if (i % totalColumns === criticalColIndex) {
      let critical = cell.children.length != 0 ? cell.children[0].data : "";
      result[result.length - 1].critical = parseInt(
        critical.trim().replace(/,/g, "") || "0",
        10
      );
    }
  }

  console.log("Updated The Countries.");
  cache["countries"] = result;
};

const updateStates = async () => {
  let response;
  try {
    response = await axios.get("https://www.worldometers.info/coronavirus/country/us/");
    if (response.status !== 200) {
      console.log("Error", response.status);
    }
  } catch (err) {
      console.log(err)
    return null;
  }
  const result = [];
  const html = cheerio.load(response.data);
  const statesTable = html("table#usa_table_countries_today");
  const tablecells = statesTable
    .children("tbody")
    .children("tr")
    .children("td");
  const totalColumns = 7;
  const stateColIndex = 0;
  const casesColIndex = 1;
  const todayCasesColIndex = 2;
  const deathsColIndex = 3;
  const todayDeathsColIndex = 4;
  const curedColIndex = 5;
  const activeColIndex = 6;
  for (let i = 0; i < tablecells.length - totalColumns; i += 1) {
    const cell = tablecells[i];

    if (i % totalColumns === stateColIndex) {
      let state =
        cell.children[0].data ||
        cell.children[0].children[0].data ||
        cell.children[0].children[0].children[0].data ||
        cell.children[0].children[0].children[0].children[0].data ||
        "";
      state = state.trim();
      if (state.length === 0) {
        state = cell.children[0].next.children[0].data || "";
      }
      result.push({ state: state.trim() || "" });
    }
    if (i % totalColumns === casesColIndex) {
      let cases = cell.children.length != 0 ? cell.children[0].data : "";
      result[result.length - 1].cases = parseInt(
        cases.trim().replace(/,/g, "") || "0",
        10
      );
    }
    if (i % totalColumns === todayCasesColIndex) {
      let cases = cell.children.length != 0 ? cell.children[0].data : "";
      result[result.length - 1].todayCases = parseInt(
        cases.trim().replace(/,/g, "") || "0",
        10
      );
    }
    if (i % totalColumns === deathsColIndex) {
      let deaths = cell.children.length != 0 ? cell.children[0].data : "";
      result[result.length - 1].deaths = parseInt(
        deaths.trim().replace(/,/g, "") || "0",
        10
      );
    }
    if (i % totalColumns === todayDeathsColIndex) {
      let deaths = cell.children.length != 0 ? cell.children[0].data : "";
      result[result.length - 1].todayDeaths = parseInt(
        deaths.trim().replace(/,/g, "") || "0",
        10
      );
    }
    if (i % totalColumns === curedColIndex) {
      let cured = cell.children.length != 0 ? cell.children[0].data : "";
      result[result.length - 1].recovered = parseInt(
        cured.trim().replace(/,/g, "") || 0,
        10
      );
    }
    if (i % totalColumns === activeColIndex) {
      let cured = cell.children.length != 0 ? cell.children[0].data : "";
      result[result.length - 1].active = parseInt(
        cured.trim().replace(/,/g, "") || 0,
        10
      );
    }
  }

  cache["states"] = result;
  console.log("Updated states.");
};

updateAll();
updateCountries();
updateStates();

setInterval(() => {
  updateAll();
  updateCountries();
  updateStates();
}, 600000)

app.get("/api/all/", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(cache["all"], null, 4));
});

app.get("/api/countries/", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(cache["countries"], null, 4));
});

app.get("/api/states/", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(cache["states"], null, 4));
});

app.listen(9669, function() {
  console.log("Listening on: 9669");
});
