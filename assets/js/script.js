// api.openweathermap.org/data/2.5/forecast?lat=43.836915001007554&lon=-79.28722704405882&appid=a28b4bca4758cee1be1ac1e4e61612a1

// http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid=a28b4bca4758cee1be1ac1e4e61612a1
// 43.836915001007554, -79.28722704405882;
var cityInput = $("#city-input");
var stateInput = $("#state-input");
var countryInput = $("#country-input");
var searchButton = $("#city-search-btn");
var fiveDayForecastContainer = $("#five-day-forecast");
var localStorageWeather = [];
var localStorageHistory = [];
var currentDayEl = $("#current-day");

searchButton.on("click", function (event) {
  event.preventDefault();
  if (localStorageHistory.indexOf(cityInput.val()) === -1) {
    localStorageHistory.push(cityInput.val());
  }
  localStorage.setItem("History", JSON.stringify(localStorageHistory));
  getCoordinates(cityInput.val(), stateInput.val(), countryInput.val());
  cityInput.val("");
  stateInput.val("");
  countryInput.val("");
});

function getCoordinates(city, state, country) {
  var urlGeo = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},${country}&limit=1&appid=a28b4bca4758cee1be1ac1e4e61612a1`;
  $.ajax(urlGeo).done(function (response) {
    getWeather(response);
  });
}

function getWeather(coordinates) {
  var urlForecast = `http://api.openweathermap.org/data/2.5/forecast?lat=${coordinates[0].lat}&lon=${coordinates[0].lon}&units=metric&appid=a28b4bca4758cee1be1ac1e4e61612a1`;
  $.ajax(urlForecast).done(function (response) {
    localStorageWeather.push(response);
    localStorage.setItem("Response", JSON.stringify(localStorageList));
    fiveDayForecast(response);
  });
}

function fiveDayForecast(data) {
  generateCurrentDay(data);
  for (let i = 0; i < data.list.length; i++) {
    //15:00 UTC is 11:00 EDT
    if (data.list[i].dt_txt.split(" ")[1] == "15:00:00") {
      var forecastData = data.list[i];
      var mainData = forecastData.main;
      var windData = forecastData.wind;
      var date = dayjs.unix(forecastData.dt).format("M/DD/YYYY");
      var icon =
        "https://openweathermap.org/img/wn/" +
        forecastData.weather[0].icon +
        ".png";
      var tempurate = "Temp: " + mainData.temp + "°C";
      var humidity = "Humidity: " + mainData.humidity + "%";
      var windspeed = "Wind: " + windData.speed + "m/s";
      generateCards(date, icon, tempurate, humidity, windspeed);
    }
  }
}

function generateCurrentDay(data) {
  currentDayEl.append(
    $("<h3>").text(
      data.city.name + " " + dayjs.unix(data.list[0].dt).format("M/DD/YYYY")
    )
  );

  currentDayEl.append(
    $("<img>")
      .attr(
        "src",
        "https://openweathermap.org/img/wn/" +
          data.list[0].weather[0].icon +
          ".png"
      )
      .attr("alt", "weather-icon")
  );
  var forecastDetails = data.list[0];
  currentDayEl.append(
    $("<p>").text("Tempurate: " + forecastDetails.main.temp + "°C")
  );
  currentDayEl.append(
    $("<p>").text("Wind: " + forecastDetails.wind.speed + "m/s")
  );
  currentDayEl.append(
    $("<p>").text("Humidity: " + forecastDetails.main.humidity + "%")
  );
}

function generateCards(date, icon, tempurate, humidity, windspeed) {
  var forecastDetails = [tempurate, windspeed, humidity];
  var cardContainer = $("<div>");
  fiveDayForecastContainer.append(cardContainer);
  cardContainer.append($("<h4>").text(date));
  cardContainer.append(
    $("<img>").attr("src", icon).attr("alt", "weather-icon")
  );
  for (let i = 0; i < forecastDetails.length; i++) {
    cardContainer.append($("<p>").text(forecastDetails[i]));
  }
}
