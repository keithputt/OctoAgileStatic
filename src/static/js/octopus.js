// create a function called convertPeriod which takes a parameter period which can be today, now or tomorrow and coverts it to a date object, today should be the start of day today
function convertPeriodToFrom(period) {
  let date = new Date();
  
  if (period === 'today') {
    date.setHours(0, 0, 0, 0);
    return date;
  }
  
  if (period === 'tomorrow') {
    date.setHours(0, 0, 0, 0); 
    date.setDate(date.getDate() + 1);
    return date;
  }
  
  if (period === 'yesterday') {
    date.setHours(0, 0, 0, 0); 
    date.setDate(date.getDate() - 1);
    return date;
  }
  
  return date; // 'now' case returns current time
}

function convertPeriodToTo(period) {
  let date = new Date();
  
  if (period === 'today') {
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 1);
    return date;
  }
  
  if (period === 'tomorrow') {
    date.setHours(0, 0, 0, 0); 
    date.setDate(date.getDate() + 2);
    return date;
  }

    if (period === 'yesterday') {
    date.setHours(0, 0, 0, 0); 
    return date;
  }
  
  return date; // 'now' case returns current time
}

// create a function call loadOctopusPrices which takes two date objects period_from and period_to and calls the Octopus agile api,
// the url for octopus agile looks like this https://api.octopus.energy/v1/products/AGILE-24-04-03/electricity-tariffs/E-1R-AGILE-24-04-03-F/standard-unit-rates/?period_from=2025-05-27T17:20:00Z&period_to=2025-05-29T00:00:00Z
// the function should return a promise which resolves to the json response from the api
function loadOctopusPrices(period) {
  const period_from = convertPeriodToFrom(period);
  const period_to = convertPeriodToTo(period);

  const url = `https://api.octopus.energy/v1/products/AGILE-24-04-03/electricity-tariffs/E-1R-AGILE-24-04-03-F/standard-unit-rates/?period_from=${period_from.toISOString()}&period_to=${period_to.toISOString()}`;
// Fetch data from API and return the results from data.results
  return fetch(url)
    .then((response) => response.json())
    .then((data) => formatAndSortData(data.results));
}

function formatAndSortData(octopusData) {
  // format the data to be in the format we want
  octopusData = octopusData.map((item) => {
    return {
      timestamp: item.valid_from,
      timestamp_to: item.valid_to,
      value_inc_vat: item.value_inc_vat,
      price_category: getPriceCategory(item.value_inc_vat),
    };
  });
  // sort the data by timestamp
  octopusData.sort((a, b) => {
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
  return octopusData;
}

function getPriceCategory(price) {
  if (price < 10) {
    return 'very_low';
  } else if (price < 15) {
    return 'low';
  } else if (price < 25) {
    return 'medium';
  } else if (price < 35) {
    return 'high';
  } else {
    return 'very_high';
  }
}


