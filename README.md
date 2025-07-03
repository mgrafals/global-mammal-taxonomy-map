# Mammal Taxonomy Global Mapping Project

An interactive map visualizing the global distribution, taxonomy, and conservation status of 6,600+ mammal species using data from the Mammal Diversity Database and IUCN.

## Overview

This project visualizes mammal biodiversity across the world through two layers:
- **Choropleth Layer**: Highlights countries based on the number of species in a selected IUCN status category.
- **Pointer Layer**: Displays geospatial markers for 1,100+ species with latitude/longitude data and interactive popups containing species taxonomy, conservation info, and images.

Built with JavaScript (Leaflet.js), Python (for data wrangling and web scraping), and GeoJSON for geographic rendering.

## Dataset & Sources

- [Mammal Diversity Database (Zenodo)](https://zenodo.org/records/7394529)
- IUCN conservation statuses
- Images scraped using Google Search and hosted on [GitHub Images Repo](https://github.com/mgrafals/Species_Images)
- Country borders and base map: OpenStreetMap

## Features

- Filter map by IUCN category (e.g., Endangered, Critically Endangered, Least Concern, etc.)
- Toggle pointers on/off to declutter the map
- Clickable pointers with:
  - Scientific/common name
  - Genus, family
  - Conservation status and author link
  - Species image (or fallback image if unavailable)
- Hover/click countries to view summary stats for a given category

## Project Structure

├── /data/ # Cleaned dataset files (Excel, GeoJSON)
├── /map/ # Frontend map visualization (HTML, JS, CSS)
├── /assets/ # Icons or visuals
└── README.md


## Scripts Used

- Data cleaning and transformation scripts (Jupyter) for formatting GeoJSON and Excel files

## Reflection

Some species lacked coordinates, limiting pointer coverage. Additionally, improvements could be made by showing more species-level info per country or refining pointer clustering.

## Resources

- https://zenodo.org/records/7394529
- https://github.com/mgrafals/Species_Images
- https://chloromaps.com/map/world
- https://developers.google.com/maps/documentation/javascript/dds-boundaries/style-polygon
- Leaflet.js: https://leafletjs.com/
