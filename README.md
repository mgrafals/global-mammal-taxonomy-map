# Mammal Taxonomy Global Mapping Project

An interactive web visualization of global mammal species distribution using taxonomic data and conservation statuses, powered by Leaflet.js, GeoJSON, and Python-based data processing.

## Project Summary

This project visualizes the spatial distribution of over 6,600 mammal species from the Mammal Diversity Database (MDD). Using geospatial pointers and choropleth shading by country, users can interactively explore IUCN conservation statuses, taxonomic details, and visual references for each species.

## Live Demo

[View Live Visualization](https://ivory-free-bone.glitch.me/)  

## Technologies Used

- **JavaScript / Leaflet.js** for map interactivity and dynamic pointer filtering
- **Python / Pandas / Jupyter Notebooks** for data wrangling and preprocessing
- **HTML/CSS** for layout and styling
- **GeoJSON** for spatial overlays
- **GitHub CDN** for image hosting

## Features

- Species-level **interactive popups** with taxonomic info, country distribution, and dynamically scraped images
- Toggleable **pointer layer**, with color-coded markers by IUCN status
- Clickable **legend** to filter markers by conservation status (grayed-out = inactive)
- Choropleth layer indicating **country-level species counts** by IUCN category
- Toggle between views for **exploratory data analysis**

## File Guide

| File | Description |
|------|-------------|
| `index.html` | Base HTML file rendering the visualization |
| `script.js` | JavaScript logic for pointers, filtering, popups |
| `style.css` | Styling and layout for the interface |
| `pointers.geojson` | GeoJSON with 1,100+ mapped species and metadata |
| `custom.geo.json` | Country-level spatial layer used in choropleth view |
| `InitialEDA.ipynb` | Notebook for early dataset exploration |
| `speciesproject.ipynb` | Final data transformation and export notebook |
| `updated_country_distribiution.xlsx` | Aggregated species counts per country |
| `README.md` | Overview and usage |
| `FULL_METHOD.md` | Full methodology, sourcing, and project context |
| `.gitignore` | File to exclude unnecessary local files (see below) |

## Additional Documentation

- [Full Methodology & User Guide](./FULL_METHOD.md) — A narrative explanation of the dataset, visual design, limitations, and how to interpret the visualization.

## Resources and References

- [Mammal Diversity Database (MDD) – Zenodo](https://zenodo.org/records/7394529)
- [Mammal Diversity Database Website](https://mammaldiversity.org)
- [Species Images GitHub Repo](https://github.com/mgrafals/Species_Images)
- [Leaflet.js Documentation](https://leafletjs.com/)
- [Google Maps Polygon Styling](https://developers.google.com/maps/documentation/javascript/dds-boundaries/style-polygon)
- [Chloromaps World Data Visualizations](https://chloromaps.com/map/world)

---

## Contributors

- Matthew Grafals: Interactive pointer system, species image integration, toggle logic
- Adi: Country-level data aggregation, web scraping for images
- Jason: Choropleth map styling, slide deck and visual content
