# Methodology

The goal of this project is to create an interactive and informative visualization of global mammal species distribution using the International Union for Conservation of Nature (IUCN) conservation status as a critical indicator. This visualization aims to provide insight into the health of global biodiversity by categorizing species into IUCN statuses such as "Least Concern," "Vulnerable," "Endangered," and others. The tool enables users to explore species distribution, conservation data, and biodiversity trends worldwide.

## Dataset Overview and Origin

The dataset used for this project originates from the Mammal Diversity Database (MDD), hosted on Zenodo. This database is a digital, publicly accessible, and updateable list of all mammalian species, available online at mammaldiversity.org. The MDD serves as a critical resource for the mammalogy community, providing an evolutionary framework for taxon sampling and interpreting biological diversity results.

The database builds upon the 3rd edition of Mammal Species of the World (MSW3) by integrating taxonomic changes published since 2004. It includes hierarchical links to species names, original descriptions, and subsequent revisionary articles. Similar to established digital taxonomic resources for amphibians (AmphibiaWeb), birds (IOC World Bird List), reptiles (The Reptile Database), and fish (FishBase), the MDD ensures taxonomic accuracy and accessibility for the mammalogy community. The database is critical for tracking mammalian species and higher taxonomic changes as new manuscripts are published.

The MDD dataset used in this visualization includes detailed information on mammalian species such as:

- Scientific and Common Names
- Genus and Family Classification
- Country Distribution
- IUCN Status
- Links to source material or related articles

Each species is assigned a unique ID, linked to an image of the species (when available).

In addition to the MDD data, species images were scraped from Google using a Python script for species with latitude and longitude data. These images were manually verified for accuracy and linked to their corresponding species entries in the dataset. This enhances the visualization by providing users with visual references for the species.

## Data Transformation and Processing

To integrate the dataset into this visualization, several preprocessing steps were applied:

#### 1. Data Cleaning:

- The raw MDD data, which includes species information and country distribution, was cleaned to ensure consistency and accuracy. Missing or incomplete entries were addressed, and all fields were standardized for uniformity.

#### 2. Spatial Data Integration:

- The cleaned dataset was merged with GeoJSON spatial data to enable the mapping of species distribution by country.

#### 3. Image Integration:

- A column of image URLs was generated based on species IDs, linking to images hosted in a GitHub repository. If an image for a species is unavailable, a placeholder image is displayed dynamically in the visualization.

#### 4. IUCN Status Mapping:

- A color-coded classification system was designed to represent the IUCN statuses visually, making the data intuitive and accessible.

#### 5. IUCN Status Grouping:

- To simplify filters and ensure better usability, IUCN statuses were grouped into broader categories such as "Threatened" and "Least Concern." This grouping ensures users can efficiently explore species distributions and identify conservation patterns.

#### 6. Duplicate Removal:

- The dataset was thoroughly cleaned to remove duplicates, ensuring accurate and unique species representation across the map.

These preprocessing steps ensured that the dataset was optimized for visualization, enabling dynamic exploration of species distribution and conservation statuses.

## Using the Visualization

This interactive map allows users to explore global mammal species distribution and conservation statuses with ease. Here’s how to use the visualization:

#### 1. Legend and Filters:

- The IUCN Status Legend, located at the bottom-left of the map, indicates the conservation status categories and their corresponding colors. Users can click on a status to toggle its visibility. Inactive statuses are grayed out in the legend, and their corresponding pinpoints are hidden on the map. Clicking again reactivates the category.

#### 2. Show/Hide Pointers:

- Use the "Show Pointers" toggle button at the bottom-left of the map to display or hide all species pinpoints. This also controls the visibility of the legend.

#### 3. Exploring Data Points:

- Each pinpoint on the map represents a mammal species and is color-coded according to its IUCN status. Clicking on a pinpoint displays a popup with detailed species information, including:
  - Common and Scientific Names
  - Genus and Family Classification
  - Country Distribution
  - IUCN Status
  - Image (or placeholder if unavailable)
  - Author(s) and publication year
  - Links to source material or related articles, if available

#### 4. Navigation Tips:

- Users can zoom and pan the map to explore species distributions across specific regions. Clicking on points provides detailed information about the species, including images and conservation statuses.

#### 5. Dynamic Updates:

- The visualization dynamically updates based on user interactions. For instance, toggling a status in the legend instantly removes or displays its pinpoints on the map. This feature enables users to focus on specific conservation statuses or explore the overall biodiversity.

## Intended Audience

This tool is designed for use by conservationists, researchers, policymakers, educators, and the general public. It provides an engaging way to visualize critical biodiversity data and raises awareness about the current state of global mammalian diversity. Whether for academic purposes or general interest, the visualization offers valuable insights into species distribution and conservation priorities.

## Resources
### Project Files
- [Sharepoint](https://mailcitytechcuny-my.sharepoint.com/:f:/g/personal/jason_jara_mail_citytech_cuny_edu/Egs2PxjHaIFNmJ1p0-itJusBRLrV3R0RUgEB9M8sKR1fdw?e=iypfpO)

#### Data Sources

- [Mammal Diversity Database (MDD) on Zenodo](https://zenodo.org/records/7394529)
- [GitHub Repository for Species Images](https://github.com/mgrafals/Species_Images)

#### Javascript Code References

- [Leaflet Documentation](https://leafletjs.com/)
- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript/dds-boundaries/style-polygon)
- [Chloromaps for World Data Visualization](https://chloromaps.com/map/world)
- [Custom pointers](https://github.com/pointhi/leaflet-color-markers)
