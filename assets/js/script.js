// linking JS variables with elements
var cityInput = $("#city-input");
var searchButton = $("#city-search-btn");
var fiveDayForecastContainer = $("#five-day-forecast");
var currentDayEl = $("#current-day");
var searchHistory = $("#search-history");
var errorMessage = $("#error-message");
// inital localstorage variable
var localStorageHistory = [];

$(function () {
  // on click event for search button, validate to make sure the field is not empty
  searchButton.on("click", function (event) {
    event.preventDefault();
    if (!cityInput.val()) {
      displayError();
      // exit's the function if input is invalid
      return;
    }
    // makes the input capitalized
    var city = cityInput.val().toUpperCase();
    // calls getCoorginates and gives it the parameter city
    getCoordinates(city);
    // calls setLocalStorage and gives it the parameter city
    setLocalStorage(city);
    // clears the input field
    cityInput.val("");
  });

  // checks if the city is already on the list, if it is then it reorganizes the list so that the most recent search is at the end of the index
  function setLocalStorage(city) {
    // checks if city is in the list, if it isn't add it to the end of the list
    if (localStorageHistory.indexOf(city) === -1) {
      localStorageHistory.push(city);
    }
    // reorganize the most recent search to the end of the list, to properly display search history
    else {
      localStorageHistory.splice(localStorageHistory.indexOf(city), 1);
      localStorageHistory.push(city);
    }
    // updates the localstorage with most updated list
    localStorage.setItem("History", JSON.stringify(localStorageHistory));
  }

  // gets the localstorage data and checks if it's empty, if it's empty then it makes localStorageHistory an empty list
  function getLocalStorage() {
    localStorageHistory = JSON.parse(localStorage.getItem("History"));
    if (!localStorageHistory) {
      localStorageHistory = [];
    }
    // calls getCoordinates and passes the last items on the list to display it on the page (most recent search)
    getCoordinates(localStorageHistory[localStorageHistory.length - 1]);
    // updates the history list
    displayHistory();
  }

  // displays the search history
  function displayHistory() {
    // clears the search history
    searchHistory.text("");
    // for every items in the list create div>li+p
    // div is the container for li and p
    // li is a city which was searched before
    // p is a X which when clicked removes item from the list
    for (let i = 0; i < localStorageHistory.length; i++) {
      var historyContainer = $("<div>");
      var listEl = $("<li>").text(
        localStorageHistory[localStorageHistory.length - 1 - i]
      );
      historyContainer.attr("data", localStorageHistory.length - 1 - i);
      historyContainer.append(listEl);
      historyContainer.append($("<p>").text("X"));
      searchHistory.append(historyContainer);
    }
    // adds onclick event to the li element
    // when clicked it looks at the element's parent and gets the data attribute
    // calls getCoordinates function and passes the index matching the data attribute clicked
    $("#search-history li").on("click", function (event) {
      getCoordinates(localStorageHistory[$(this).parent().attr("data")]);
    });
    //adds onclick event to the p element
    //which clicked it looks at the element's parent and gets the data attribute which correlates to the index the item is and splices it
    $("#search-history p").on("click", function (event) {
      localStorageHistory.splice($(this).parent().attr("data"), 1);
      localStorage.setItem("History", JSON.stringify(localStorageHistory));
      displayHistory();
    });
  }

  // display error on the screen for 2.5seconds
  function displayError() {
    errorMessage.text("Invalid Entry");
    setTimeout(function () {
      errorMessage.text("");
    }, 2500);
  }

  // takes a city name and calls the api which returns an object that contains the latitude and longitude
  function getCoordinates(city) {
    var urlGeo = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=a28b4bca4758cee1be1ac1e4e61612a1`;
    $.ajax(urlGeo).done(function (response) {
      // validation to make sure city was found
      if (response.length == 0) {
        //calls display error function which displays "invalid input"
        displayError();
        //removes the invalid entry from the localStorage list
        localStorageHistory.pop();
        // updates the localStorage list
        localStorage.setItem("History", JSON.stringify(localStorageHistory));
        return;
      }
      // updates the history list
      displayHistory();
      // calls the getWeather function and sends the response as a parameter
      getWeather(response);
    });
  }

  // using the lat and lon from the coordinates parameter, send from the getCoordinates function
  // call the api and returns an object with weather forecast
  // city names returned in this response is not the same name as the city searched but it's in the general coordinates
  function getWeather(coordinates) {
    var urlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates[0].lat}&lon=${coordinates[0].lon}&units=metric&appid=a28b4bca4758cee1be1ac1e4e61612a1`;
    $.ajax(urlForecast).done(function (response) {
      // call fiveDatForecast with parameter of object type
      fiveDayForecast(response);
    });
  }

  // using the response from getWeather function create elements and displays the forecast
  function fiveDayForecast(data) {
    generateCurrentDay(data);
    fiveDayForecastContainer.html(
      "<h3 id='forecast-title'>5-Day Forecast:</h3>"
    );
    for (let i = 0; i < data.list.length; i++) {
      // there is a list of 40 forecasts, every 3 hours for 5 days, instead of displaying every 3 hours, this condition checks
      // to see if the time is 15:00:00 then it will display the forecast, once a day for 5 days for that time period
      // 15:00 UTC is 11:00 EDT
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
        // calls the generateCards function and give 5 parameters
        generateCards(date, icon, tempurate, humidity, windspeed);
      }
    }
  }

  //using the most recent data generates the data on screen of current days forcast
  function generateCurrentDay(data) {
    currentDayEl.css("border", "gray solid");
    //clears the current day container
    currentDayEl.text("");
    // appends the city name, date and icon from the API
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

  // displays the forcast details for the next 5 days
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
  //inital call to display localstorage details
  getLocalStorage();
});
