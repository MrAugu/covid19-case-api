const express = require("express");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");

console.log("-- Starting --");

const cache = {
    "all": {},
    "countries": [],
    "states": []
};

const updateAll = async () => {
  console.log("Updating all...");
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
  console.log("Updating countries...");
  let response;
  try {
      response = await axios.get("https://www.worldometers.info/coronavirus/");
      if (response.status !== 200) {
          console.log("Error", response.status);
      }
  } catch (err) {
      return null;
  }
  // to store parsed data
  const result = [];
  // get HTML and parse death rates
  const html = cheerio.load(response.data);
  const countriesTable = html("table#main_table_countries_today");
  const countriesTableCells = countriesTable
      .children("tbody")
      .children("tr")
      .children("td");
  // NOTE: this will change when table format change in website
  const totalColumns = 10;
  const countryColIndex = 0;
  const casesColIndex = 1;
  const todayCasesColIndex = 2;
  const deathsColIndex = 3;
  const todayDeathsColIndex = 4;
  const curedColIndex = 5;
  const activeColIndex = 6;
  const criticalColIndex = 7;
  const casesPerOneMillionColIndex = 8;
  const deathsPerOneMillionColIndex = 9;

  // minus totalColumns to skip last row, which is total
  for (let i = 0; i < countriesTableCells.length - totalColumns; i += 1) {
      const cell = countriesTableCells[i];

      // get country
      if (i % totalColumns === countryColIndex) {
          let country =
              cell.children[0].data ||
              cell.children[0].children[0].data ||
              // country name with link has another level
              cell.children[0].children[0].children[0].data ||
              cell.children[0].children[0].children[0].children[0].data ||
              "";
          country = country.trim();
          if (country.length === 0) {
              // parse with hyperlink
              country = cell.children[0].next.children[0].data || "";
          }
        
          result.push({
              country: country.trim(),
          });
      }
      // get cases
      if (i % totalColumns === casesColIndex) {
          let cases = cell.children.length != 0 ? cell.children[0].data : "";
          result[result.length - 1].cases = parseInt(
             cases.trim().replace(/,/g, "") || "0",
             10
          );
      }
      // get today cases
      if (i % totalColumns === todayCasesColIndex) {
          let cases = cell.children.length != 0 ? cell.children[0].data : "";
          result[result.length - 1].todayCases = parseInt(
              cases.trim().replace(/,/g, "") || "0",
              10
          );
      }
      // get deaths
      if (i % totalColumns === deathsColIndex) {
          let deaths = cell.children.length != 0 ? cell.children[0].data : "";
          result[result.length - 1].deaths = parseInt(
              deaths.trim().replace(/,/g, "") || "0",
              10
          );
      }
      // get today deaths
      if (i % totalColumns === todayDeathsColIndex) {
          let deaths = cell.children.length != 0 ? cell.children[0].data : "";
          result[result.length - 1].todayDeaths = parseInt(
              deaths.trim().replace(/,/g, "") || "0",
              10
          );
      }
      // get cured
      if (i % totalColumns === curedColIndex) {
          let cured = cell.children.length != 0 ? cell.children[0].data : "";
          result[result.length - 1].recovered = parseInt(
              cured.trim().replace(/,/g, "") || 0,
              10
          );
      }
      // get active
      if (i % totalColumns === activeColIndex) {
          let cured = cell.children.length != 0 ? cell.children[0].data : "";
          result[result.length - 1].active = parseInt(
              cured.trim().replace(/,/g, "") || 0,
              10
          );
      }
      // get critical
      if (i % totalColumns === criticalColIndex) {
          let critical = cell.children.length != 0 ? cell.children[0].data : "";
          result[result.length - 1].critical = parseInt(
              critical.trim().replace(/,/g, "") || "0",
              10
          );
      }
      // get total cases per one million population
      if (i % totalColumns === casesPerOneMillionColIndex) {
          let casesPerOneMillion = cell.children.length != 0 ? cell.children[0].data : "";
          result[result.length - 1].casesPerOneMillion = parseFloat(
              casesPerOneMillion.trim().replace(/,/g, "") || "0"
          );
      }

      // get total deaths per one million population
      if (i % totalColumns === deathsPerOneMillionColIndex) {
          let deathsPerOneMillion = cell.children.length != 0 ? cell.children[0].data : "";
          result[result.length - 1].deathsPerOneMillion = parseFloat(
              deathsPerOneMillion.trim().replace(/,/g, "") || "0"
          );
      }
  }

  console.log("Updated The Countries. (" + (result.length) + ")");
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
  // to store parsed data
  const result = [];
  // get HTML and parse death rates
  const html = cheerio.load(response.data);
  const statesTable = html("table#usa_table_countries_today");
  const tableRows = statesTable
    .children("tbody")
    .children("tr:not(.total_row)").toArray();
  // NOTE: this will change when table format change in website

  const stateColIndex = 0;
  const dataColIndexes = {
    cases: 1,
    todayCases: 2,
    deaths: 3,
    todayDeaths: 4,
    active: 5
  };

  for (const row of tableRows) {

    const cells = row.children.filter(c => c.name === "td");

    const stateData = { state: parseStateCell(cells[stateColIndex]) };

    for (const property in dataColIndexes)
      stateData[property] = parseNumberCell(cells[dataColIndexes[property]]);

    result.push(stateData);
  }

  cache["states"] = result;
  console.log("Updated states.");
};

updateCountries().then(() => updateAll().then(() => updateStates()));

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

function parseStateCell(cell) {
  let state =
    cell.children[0].data ||
    cell.children[0].children[0].data ||
    // state name with link has another level
    cell.children[0].children[0].children[0].data ||
    cell.children[0].children[0].children[0].children[0].data ||
    "";
  state = state.trim();
  if (state.length === 0) {
    // parse with hyperlink
    state = cell.children[0].next.children[0].data || "";
  }
  return state.trim() || "";
}

function parseNumberCell (cell) {
  const cellValue = cell.children.length != 0 ? cell.children[0].data : "";
  return parseFloat(cellValue.replace(/[,\+\-\s]/g, ""), 10) || 0;
}
