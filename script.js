
const mapBounds = L.latLngBounds(
  L.latLng(-150, -180), // Southwest corner
  L.latLng(150, 180) // Northeast corner
);

// Initialize the map
const map = L.map('map', {
  maxBounds: mapBounds, // Apply the bounds
  maxBoundsViscosity: 1.0 // Prevents dragging outside the bounds
}).setView([0, 0], 2);

// Add base map layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Stats box and filter
const statsBox = document.getElementById("global-stats");
const filter = document.getElementById("iucn-filter");

// Global variables
let globalStats = {};
let geojsonLayer;

// Fetch data
Promise.all([
  fetch("/custom.geo.json").then((response) => response.json()),
  fetch(
    "https://cdn.glitch.global/a968c492-8dae-4fe8-9620-55dffb21cfcb/updated_country_distribiution.xlsx?v=1732835126654"
  ).then((response) => response.arrayBuffer()),
])
  .then(([geojsonData, excelData]) => {
   
    const workbook = XLSX.read(excelData, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const excelJSON = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    console.log("Excel Data:", excelJSON);

   
    mergeDataIntoGeoJSON(geojsonData, excelJSON);
    console.log("Merged GeoJSON Data with Excel Data:", geojsonData.features);
    

  
    populateFilterOptions(excelJSON);
    // Calculate global stats
    calculateGlobalStats(excelJSON);
   
    renderMap(geojsonData, filter.value);

    
    filter.addEventListener("change", () => {
      const selectedCategory = filter.value;
      renderMap(geojsonData, selectedCategory);
      
    });
  })
  .catch((error) => {
    console.error("Error loading data:", error);
    alert("Could not load the data. Please check the file paths.");
  });


/**
 * Merge Excel data into GeoJSON
 */

function mergeDataIntoGeoJSON(geojson, excelJSON) {
  geojson.features.forEach((feature) => {
    const geoCountryName = feature.properties.name;

    const matchingRows = excelJSON.filter(
      (row) => row.geo_country === geoCountryName
    );

    if (matchingRows.length > 0) {
      feature.properties.buckets = {};

      matchingRows.forEach((row) => {
        feature.properties.buckets[row.iucn_bucket] = {
          distinct_species_count: row.distinct_species_count,
          species_count_bucket: row.species_count_bucket,
        };
      });
    } else {
      feature.properties.buckets = {}; 
    }
  });
}


/**
 * Populate the filter dropdown with unique IUCN buckets
 */
function populateFilterOptions(excelJSON) {
  filter.innerHTML = "";

  
  const uniqueBuckets = [
    ...new Set(excelJSON.map((row) => row.iucn_bucket).filter(Boolean)),
  ];

  uniqueBuckets.forEach((bucket) => {
    const option = document.createElement("option");
    option.value = bucket;
    option.textContent = bucket;
    filter.appendChild(option);
  });
}

/**
 * Render the map with updated styles and tooltips
 */
function renderMap(geojsonData, selectedCategory) {
  if (geojsonLayer) {
    map.removeLayer(geojsonLayer);
  }

  geojsonLayer = L.geoJSON(geojsonData, {
    style: (feature) => getStyle(feature, selectedCategory),
    onEachFeature: (feature, layer) => {
      const buckets = feature.properties.buckets || {};
      const dataForCategory = buckets[selectedCategory];

      if (dataForCategory) {
        const globalDistinctSpecies = globalStats.globalTotals.totalDistinctSpecies;
        const globalSpeciesCountBucket = globalStats.globalTotals.totalSpeciesCountBucket;

        const categoryStats = globalStats[selectedCategory] || {};
        const categoryDistinctSpecies = categoryStats.totalDistinctSpecies || 1;
        const categorySpeciesCountBucket = categoryStats.totalSpeciesCountBucket || 1;

        const distinctSpeciesCount = dataForCategory.distinct_species_count || 0;
        const speciesCountBucketRange = dataForCategory.species_count_bucket || "0-0";
        const speciesCountBucketMax = parseInt(speciesCountBucketRange.split("-").pop(), 10) || 0;

        const distinctSpeciesGlobalPercentage = (
          (distinctSpeciesCount / globalDistinctSpecies) *
          100
        ).toFixed(2);
        const distinctSpeciesCategoryPercentage = (
          (distinctSpeciesCount / categoryDistinctSpecies) *
          100
        ).toFixed(2);

        const speciesCountBucketGlobalPercentage = (
          (speciesCountBucketMax / globalSpeciesCountBucket) *
          100
        ).toFixed(2);
        const speciesCountBucketCategoryPercentage = (
          (speciesCountBucketMax / categorySpeciesCountBucket) *
          100
        ).toFixed(2);
        
        //IUCN Bucket: ${selectedCategory}<br>
        // (${speciesCountBucketGlobalPercentage}% of global, ${speciesCountBucketCategoryPercentage}% of category)
        // ${speciesCountBucketRange}  
        // (${distinctSpeciesGlobalPercentage}% of global, ${distinctSpeciesCategoryPercentage}% of category)
        layer.bindPopup(
          `<strong>${feature.properties.name}</strong>:
           
           ${distinctSpeciesCount} Species <br>`
        );
      } else {
        layer.unbindPopup();
      }
    },
  }).addTo(map);
}

function getStyle(feature, selectedCategory) {
  const buckets = feature.properties.buckets || {};
  const dataForCategory = buckets[selectedCategory];
  
  if (map) {
    addDynamicColorBar(map, selectedCategory);
  }

  if (dataForCategory) {
    const bucket = dataForCategory.species_count_bucket || "No Data";

   
    let numericRange = bucket.match(/\d+/g); 
    numericRange = numericRange ? numericRange.map(Number).sort((a, b) => a - b) : null;

    if (!numericRange || numericRange.length !== 2) {
      console.warn(
        `Invalid or missing numeric range for ${feature.properties.name}: ${bucket}`
      );
      return { fillOpacity: 0.0, weight: 0 }; 
    }

   
    const colorScales = {
      "Data Deficient or Unknown": [
        "#d2f2d4", 
        "#a9e6b0",
        "#7be382",
        "#48d757",
        "#26cc00", 
      ],
      "Extinct": [
        "#ffcccc", 
        "#ff6666",
      ],
      "Least Concern": [
        "#cce5ff", 
        "#99ccff",
        "#66b3ff",
        "#3385ff",
        "#005ce6", 
      ],
      "Threatened": [
        "#ffe5cc", 
        "#ffcc99",
        "#ff9966",
        "#ff6633",
        "#ff3300",
      ],
    };

    
    const colorScale = colorScales[selectedCategory];
    if (!colorScale) {
      console.error(`No color scale defined for category: ${selectedCategory}`);
      return { fillOpacity: 0.0, weight: 0 };
    }

  
    const predefinedRanges = {
      "Data Deficient or Unknown": [
        [1, 4],
        [4, 8],
        [8, 13],
        [13, 29],
        [29, 177],
      ],
      Extinct: [
        [1, 3],
        [3, 26],
      ],
      "Least Concern": [
        [16, 63],
        [63, 77],
        [77, 121],
        [121, 184],
        [184, 471],
      ],
      Threatened: [
        [3, 12],
        [12, 17],
        [17, 23],
        [23, 44],
        [44, 274],
      ],
    };

    const rangesForCategory = predefinedRanges[selectedCategory];
    if (!rangesForCategory) {
      console.error(`No predefined ranges found for category: ${selectedCategory}`);
      return { fillOpacity: 0.0, weight: 0 };
    }

   
    const bucketIndex = rangesForCategory.findIndex(
      (range) => range[0] === numericRange[0] && range[1] === numericRange[1]
    );

    if (bucketIndex === -1) {
      console.error(
        `Could not match ${numericRange.join("-")} in predefined ranges for ${selectedCategory}`
      );
      return { fillOpacity: 0.0, weight: 0 };
    }

 
    const color = colorScale[bucketIndex];

 
    console.log(`Assigned color for ${feature.properties.name}:`, color);

    if (color) {
      return { weight: 1.5, fillColor: color, fillOpacity: 0.7 };
    }
  } else {
    console.warn(
      `No data for selected category ${selectedCategory} in ${feature.properties.name}`
    );
  }

  return { fillOpacity: 0.0, weight: 0 };
}

let currentColorBar = null; 

function addDynamicColorBar(map, selectedCategory) {
  
  const colorScales = {
    "Data Deficient or Unknown": [
      "#d2f2d4", 
      "#a9e6b0",
      "#7be382",
      "#48d757",
      "#26cc00", 
    ],
    "Extinct": [
      "#ffcccc", 
      "#ff6666", 
    ],
    "Least Concern": [
      "#cce5ff", 
      "#99ccff",
      "#66b3ff",
      "#3385ff",
      "#005ce6", 
    ],
    "Threatened": [
      "#ffe5cc", 
      "#ffcc99",
      "#ff9966",
      "#ff6633",
      "#ff3300", 
    ],
  };

  const predefinedRanges = {
    "Data Deficient or Unknown": [4, 8, 13, 29, 177],
    Extinct: [3, 26],
    "Least Concern": [63, 77, 121, 184, 471],
    Threatened: [12, 17, 23, 44, 274],
  };

  const colorScale = colorScales[selectedCategory];
  const ranges = predefinedRanges[selectedCategory];

  if (!colorScale || !ranges) {
    console.error(`No color scale or ranges defined for category: ${selectedCategory}`);
    return;
  }

  // Remove the existing color bar
  if (currentColorBar) {
    map.removeControl(currentColorBar);
  }

  const colorBar = L.control({ position: "bottomright" });

  colorBar.onAdd = function () {
    const div = L.DomUtil.create("div", "info color-bar");
    
    div.style.position = "absolute";
    div.style.bottom = "50px"; 
    div.style.right = "10px"; 
    div.style.zIndex = "1000";
  
    div.innerHTML += `<strong>${selectedCategory}</strong><br>`;
    const gradient = `linear-gradient(to right, ${colorScale.join(", ")})`;
    div.innerHTML += `
      <div style="
        width: 200px;
        height: 20px;
        background: ${gradient};
        border: 1px solid #ccc;
        margin-bottom: 5px;
        position: relative;
      ">
      </div>
    `;

   
    const labelContainer = document.createElement("div");
    labelContainer.style.position = "relative";
    labelContainer.style.width = "200px";

    for (let i = 0; i < ranges.length; i++) {
      const position = (i / (ranges.length - 1)) * 100; 
      const label = document.createElement("span");
      label.style.position = "absolute";
      label.style.left = `${position}%`;
      label.style.transform = "translateX(-50%)";
      label.style.fontSize = "10px";
      label.innerHTML = ranges[i];
      labelContainer.appendChild(label);
    }

    div.appendChild(labelContainer);

    return div;
  };

  
  colorBar.addTo(map);
  currentColorBar = colorBar;
}
// Helper function: Calculate global stats for the selected category
function calculateGlobalStats(excelJSON) {
  const categories = [
    "Data Deficient or Unknown",
    "Extinct",
    "Least Concern",
    "Threatened",
  ];
  
  categories.forEach((category) => {
    globalStats[category] = {
      totalDistinctSpecies: 0,
      totalSpeciesCountBucket: 0,
    };

    excelJSON.forEach((row) => {
      if (row.iucn_bucket === category) {
        const bucketValue =
          parseInt(row.species_count_bucket.split("-").pop(), 10) || 0;
        globalStats[category].totalDistinctSpecies += row.distinct_species_count || 0;
        globalStats[category].totalSpeciesCountBucket += bucketValue;
      }
    });
  });

  // Calculate global totals across all categories
  globalStats.globalTotals = {
    totalDistinctSpecies: Object.values(globalStats).reduce(
      (sum, stats) => sum + (stats.totalDistinctSpecies || 0),
      0
    ),
    totalSpeciesCountBucket: Object.values(globalStats).reduce(
      (sum, stats) => sum + (stats.totalSpeciesCountBucket || 0),
      0
    ),
  };

  updateStatsBox(globalStats);
}

// Updated updateStatsBox function
function updateStatsBox(stats, countryStats = null, selectedCategory = "all") {
  if (!stats || typeof stats !== "object") {
    console.error("Invalid stats object:", stats);
    return;
  }

  let globalStatsHTML = `6,615 species worldwide <br> IUCN Status - Critical indicator of the health of the world’s biodiversity. <br>
  Dataset link: https://zenodo.org/records/7394529
    ${Object.keys(stats)
      .filter((cat) => cat === selectedCategory || selectedCategory === "all")
      .map((cat) => {
        const stat = stats[cat];
        return ``;
      })
      .join("")}
  <br>`;

  let countryStatsHTML = "";
  if (countryStats) {
    countryStatsHTML = `
      <h4>Country-Specific Stats</h4>
      ${Object.keys(countryStats)
        .map(
          (statKey) =>
            `${statKey}: ${countryStats[statKey] || 0} species<br>`
        )
        .join("")}
    `;
  }

  statsBox.innerHTML = globalStatsHTML + countryStatsHTML;
}


/*#stats-box {
  position: absolute;
  top: 70px;
  left: 40px;
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  font-family: Arial, sans-serif;
  z-index: 1000;
}*/







/////////////////////////////////////////////////////


// Variables
let pointerLayer;
let geojsonData;
const activeStatuses = new Set(); // Tracks which IUCN statuses are currently active

// Mapping of IUCN statuses to colors
const iucnColors = {
  "Least Concern": "yellow",
  "Data Deficient": "red",
  "Vulnerable": "orange",
  "Endangered": "green",
  "Near Threatened": "blue",
  "Critically Endangered": "violet",
  "Extinct": "black",
};

// Populating activeStatuses with all statuses initially
Object.keys(iucnColors).forEach((status) => activeStatuses.add(status));

// Creating custom Leaflet icon based on IUCN status
function createCustomIcon(iucnStatus) {
  const color = iucnColors[iucnStatus] || "grey"; // Defaults to grey if the status is not defined

// Pinpoint icon attributes  
  return L.icon({
    iconUrl: `https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-${color}.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41], // Size of the icon
    iconAnchor: [12, 41], // Point of the icon that corresponds to the marker's location
    popupAnchor: [1, -34], // Point where the popup opens relative to the icon anchor
    shadowSize: [41, 41], // Size of the shadow
  });
}

// Creates the legend control
const legend = L.control({ position: "bottomleft" });


legend.onAdd = function () {
  const div = L.DomUtil.create("div", "info legend"); // Creates a container for the legend
  div.style.background = "white";
  div.style.border = "1px solid #ccc";
  div.style.padding = "10px";
  div.style.borderRadius = "5px";
  div.style.marginBottom = "60px";

  div.innerHTML = "<strong>IUCN Status Legend</strong><br>"; // Adds legend title

  // Adding items for each IUCN status with toggle functionality
  for (const [status, color] of Object.entries(iucnColors)) {
    div.innerHTML += `
      <div 
        style="cursor: pointer; margin-bottom: 5px;" 
        data-status="${status}" 
        onclick="toggleStatusVisibility('${status}')">
        <i style="
          background-color: ${color};
          width: 12px;
          height: 12px;
          display: inline-block;
          margin-right: 6px;
          border-radius: 50%;
          border: 1px solid #ccc;
          opacity: ${activeStatuses.has(status) ? 1 : 0.4};"></i> 
        <span style="opacity: ${activeStatuses.has(status) ? 1 : 0.4};">${status}</span>
      </div>
    `;
  }

  return div;
};

// Adding the legend to the map
legend.addTo(map);
const legendContainer = legend.getContainer(); // Get the legend container element
legendContainer.style.display = "block"; // Make the legend visible by default

// Function to toggle visibility of a specific IUCN status
window.toggleStatusVisibility = function (status) {
  if (activeStatuses.has(status)) {
    activeStatuses.delete(status); // Removes the status from activeStatuses
  } else {
    activeStatuses.add(status); // Adds the status to activeStatuses
  }

  renderFilteredGeoJSON(); // Re-renders the filtered GeoJSON layer
  updateLegend(); // Updates the legend to reflect the current state
};

// Function to render the GeoJSON with the active statuses
function renderFilteredGeoJSON() {
  if (pointerLayer) {
    map.removeLayer(pointerLayer); // Removes the existing pointer layer
  }

  pointerLayer = L.geoJSON(geojsonData, {
    pointToLayer: function (feature, latlng) {
      const icon = createCustomIcon(feature.properties.iucnStatus); // Creates a marker icon based on the IUCN status
      return L.marker(latlng, { icon: icon }); // Adds a marker to the map
    },
    onEachFeature: function (feature, layer) {
      const props = feature.properties;

      const imageId = props.id; // Gets the image ID from the GeoJSON properties
      const imageUrl = `https://github.com/mgrafals/Species_Images/blob/main/Images/${imageId}.jpg?raw=true`;

      // Creates popup content for each marker
      let popupContent = `
        <strong>Common Name:</strong> ${props.mainCommonName}<br>
        <strong>Scientific Name:</strong> ${props.sciName}<br>
        <strong>Genus:</strong> ${props.genus}<br>
        <strong>Family:</strong> ${props.family}<br>
        <strong>Country Distribution:</strong> ${props.countryDistribution}<br>
        <strong>IUCN Status:</strong> ${props.iucnStatus}<br>
        <strong>Author:</strong> ${props.authoritySpeciesAuthor} (${props.authoritySpeciesYear})<br>
        <strong>Link:</strong> ${
        props.authoritySpeciesLink
          ? `<a href="${props.authoritySpeciesLink}" target="_blank">Link</a>`
          : "Not Available"
      }<br>
        <div style="margin-top: 10px; text-align: center;">
          ${
            imageId
              ? `<img src="${imageUrl}" alt="${props.mainCommonName}" 
                   style="max-width: 100%; height: auto; margin-top: 10px; border: 1px solid #ccc;" 
                   onerror="this.onerror=null; this.src='https://via.placeholder.com/150?text=Image+Unavailable';" />`
              : "<em>No image available</em>"
          }
        </div>
      `;

      layer.bindPopup(popupContent); // Binds the popup to the layer
    },
    filter: function (feature) {
      return activeStatuses.has(feature.properties.iucnStatus); // Filters markers based on active statuses
    },
  });

  pointerLayer.addTo(map); // Add the filtered layer to the map
}

// Update legend to gray out inactive statuses
function updateLegend() {
  const legendDiv = document.querySelector(".info.legend");
  legendDiv.innerHTML = "<strong>IUCN Status Legend</strong><br>";

  for (const [status, color] of Object.entries(iucnColors)) {
    legendDiv.innerHTML += `
      <div 
        style="cursor: pointer; margin-bottom: 5px;" 
        data-status="${status}" 
        onclick="toggleStatusVisibility('${status}')">
        <i style="
          background-color: ${color};
          width: 12px;
          height: 12px;
          display: inline-block;
          margin-right: 6px;
          border-radius: 50%;
          border: 1px solid #ccc;
          opacity: ${activeStatuses.has(status) ? 1 : 0.4};"></i> 
        <span style="opacity: ${activeStatuses.has(status) ? 1 : 0.4};">${status}</span>
      </div>
    `;
  }
}

// Adding toggle switch for "Show Pointers"
const togglePointers = document.createElement("input");
togglePointers.type = "checkbox";
togglePointers.id = "toggle-pointers";
togglePointers.checked = true; // Initially checked

const toggleLabel = document.createElement("label");
toggleLabel.htmlFor = "toggle-pointers";
toggleLabel.textContent = "Show Pointers";

// Adding toggle switch to the map
const toggleContainer = document.createElement("div");
toggleContainer.style.position = "absolute";
toggleContainer.style.bottom = "10px";
toggleContainer.style.left = "10px";
toggleContainer.style.zIndex = "1000";
toggleContainer.style.background = "white";
toggleContainer.style.padding = "10px";
toggleContainer.style.border = "1px solid #ccc";
toggleContainer.style.borderRadius = "5px";
toggleContainer.appendChild(togglePointers);
toggleContainer.appendChild(toggleLabel);
document.getElementById("map").appendChild(toggleContainer);

// Adding event listener to toggle "Show Pointers" functionality
togglePointers.addEventListener("change", () => {
  if (togglePointers.checked) {
    legendContainer.style.display = "block"; // Show legend
    renderFilteredGeoJSON(); // Render pointers
  } else {
    legendContainer.style.display = "none"; // Hide legend
    if (pointerLayer) {
      map.removeLayer(pointerLayer); // Removes pointers
    }
  }
});

// Loading GeoJSON data and rendering initial layer
fetch("pointers.geojson")
  .then((response) => response.json())
  .then((data) => {
    geojsonData = data; // Store the GeoJSON data
    renderFilteredGeoJSON(); // Render the initial layer
  })
  .catch((error) => console.error("Error loading GeoJSON:", error));