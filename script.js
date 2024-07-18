require([
  "esri/config",
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/rest/locator",
  "esri/widgets/Popup",
  "esri/widgets/Search"
], (
  esriConfig,
  Map,
  MapView,
  Graphic,
  locator,
  Popup,
  Search
) => {
  esriConfig.apiKey = "AAPK756f006de03e44d28710cb446c8dedb4rkQyhmzX6upFiYPzQT0HNQNMJ5qPyO1TnPDSPXT4EAM_DlQSj20ShRD7vyKa7a1H";

  var inputval = document.getElementById('inputval');
  const map = new Map({
    basemap: "arcgis-light-gray", //Basemap styles service
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-25, 30],
    zoom: 2,
    constraints: {
      snapToZoom: false
    },
    popup: new Popup({
      dockEnabled: true,
      dockOptions: {
        position: "bottom-right",
        buttonEnabled: false,
        breakpoint: false
      }
    })
  });
  view.ui.add(inputval, "top-right");


  // searchWidget = new Search({
  //   view: view,

  //   searchTerm: "1024 E 8th"
  // });

  // view.ui.add(searchWidget, "bottom-right");

  // view.when(() => {

  //   searchWidget.search();

  // });


    const select = document.createElement("calcite-select");
    select.width = "auto"

  inputval.addEventListener('calciteInputChange', () => {
    view.popup.actions = [];
    select.innerHTML = '';

    const option = document.createElement("calcite-option");
    option.innerHTML = `See suggestions for "${inputval.value}"...`;
    select.appendChild(option);
    view.ui.add(select, "top-right");

    geocodingServiceUrl = "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

    const params = {
      text: inputval.value, // Suggestion text
    };

    locator.suggestLocations(geocodingServiceUrl, params).then((response) => {
      // Show a list of the suggestions
      response.forEach((suggestion) => {
        showSuggestion(suggestion.text, suggestion.magicKey);
      });
      // When a suggestion is selected, geocode to find its location
      select.addEventListener("calciteSelectChange", (event) => {
        const text = event.target.innerHTML;
        const magicKey = event.target.value;
        geocodeSuggestion(text, magicKey);
      });
    });

    
  function showSuggestion(text, magicKey) {
    const option = document.createElement("calcite-option");
    option.innerHTML = text;
    option.value = magicKey;
    select.appendChild(option);
  }



  })


  // view.when(() => {



  // });

  function geocodeSuggestion(suggestionText, magicKey) {
    const params = {
      SingeLine: suggestionText, // suggestion text
      address: {
        magicKey: magicKey, // suggestion magic key
      },
      outFields: ["PlaceName", "Place_addr", "LongLabel"],
    };
    // Geocode suggestion and show location
    locator.addressToLocations(geocodingServiceUrl, params).then((results) => {
      showSearchResult(results);
    });
  }

  function showSearchResult(results) {
    if (!results.length) {
      return;
    }
    const result = results[0];
    view.graphics.removeAll();
    const graphic = new Graphic({
      symbol: {
        type: "simple-marker",
        color: "#000000",
        size: "8px",
        outline: {
          color: "#ffffff",
          width: "1px",
        },
      },
      geometry: result.location,
      attributes: result.attributes,
      popupTemplate: {
        title: "{PlaceName}",
        content: "Here we can add more details..."
        // content:
        //   "{LongLabel}" +
        //   "<br><br>" +
        //   result.location.longitude.toFixed(5) +
        //   "," +
        //   result.location.latitude.toFixed(5),
      },
    });
    view.graphics.add(graphic);

    view.goTo({
      target: result.location,
      zoom: 13,
    }).then(() => {
      view.openPopup({
        features: [graphic],
        location: result.location,
      });
    })
  }



})
