import {Component, OnInit, ViewChild} from '@angular/core';
import {EnvironmentService} from '@shared/services/environment.service';
import {NGXLogger} from 'ngx-logger';
import {MapboxGeoJSONFeature, MapLayerMouseEvent} from 'mapbox-gl';
import {Feature, Point} from 'geojson';
import {POI} from '@domain/poi';
import {environment} from '../../environments/environment';
// we need to import as alias since we foolishly called our class also MapComponent :-)
import {MapComponent as OfficialMapComponent} from 'ngx-mapbox-gl';
import {MasterDataService} from '@shared/services/master-data.service';
import {ActivatedRoute} from '@angular/router';
import {REGEXP_COORDINATES} from '@shared/domain/smart-coordinates';
import {AreaStoreService} from '../areas/area-store.service';
import {LinkStoreService} from '@app/links/link-store.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  // https://docs.mapbox.com/help/glossary/zoom-level/
  // 10 ~ detailed like bangkok + area, 5 ~ southeast asia, 0 ~ the earth
  static readonly DEEPLINK_POI_ZOOM = 12; // if called with maps/@lat,lon
  static readonly ON_CLICK_POI_ZOOM = 6; // if poi is clicked
  static readonly DEFAULT_POI_ZOOM = 2; // default when /map is launched w/o args

  private readonly className = 'MapComponent';
  private locationType2Maki: Map<string, string> = new Map();

  // https://angular-2-training-book.rangle.io/advanced-components/access_child_components
  @ViewChild(OfficialMapComponent) mapbox: OfficialMapComponent;

  // check https://docs.mapbox.com/mapbox-gl-js/example/setstyle/ for alternative styles, streets-v11,
  // https://docs.mapbox.com/api/maps/#styles
  readonly mapStyles = [
    {
      description: 'Outdoor',
      id: 'outdoors-v11'
    },
    {
      description: 'Satellite',
      id: 'satellite-streets-v11' // 'satellite-v9' is w/o streets
    } // no longer needed: {description: 'Street',id: 'streets-v11'}
  ];

  mapStyle = `mapbox://styles/mapbox/${this.mapStyles[0].id}`; // default outdoor
  cursorStyle: string; // e.g. '' or 'pointer'

  coordinates: number[] = [18, 18]; // default center coordinates, [100.523186, 13.736717] = bangkok lon,lat style
  zoom = [MapComponent.DEFAULT_POI_ZOOM];
  accessToken = this.env.mapboxAccessToken;
  points: GeoJSON.FeatureCollection<GeoJSON.Point>;
  selectedPOI: MapboxGeoJSONFeature | null;
  poiLayerLayout = {
    'icon-image': '{icon}-15',
    'icon-allow-overlap': true,
    // https://stackoverflow.com/questions/61032600/scale-marker-size-relative-to-the-zoom-level-in-mapbox-gl-js
    // zoom => size pairs for "interpolate" expressions must be arranged with input values in strictly ascending order.
    'icon-size': ['interpolate', ['linear'], ['zoom'], 2, 1.0, 6, 1.5, 12, 3.0]
  };

  constructor(private env: EnvironmentService,
              private masterData: MasterDataService,
              private linkStore: LinkStoreService,
              private areaStore: AreaStoreService,
              private route: ActivatedRoute,
              private logger: NGXLogger) {
  }

  ngOnInit(): void {
    this.logger.debug(`${this.className}.ngOnInit: Ready to load map, token len=${this.env.mapboxAccessToken.length}`);

    // populate locationType2Maki which maps  api location type enum values to Maki identifiers
    this.masterData.getLocationTypes().forEach(locationType => {
      this.locationType2Maki.set(locationType.value, locationType.maki);
    });

    // check if component is called with coordinates e.g. http://localhost:4200/map/@14.067381,103.0984788
    if (this.route.snapshot.params.coordinates) {
      const match = this.route.snapshot.params.coordinates.match(REGEXP_COORDINATES); // match[1]=lat, match[2]=lon or match==null
      if (match != null) {
        this.logger.info(`${this.className} Zooming in to lat=${match[1]} lon=${match[2]}`);
        this.coordinates = [match[2] as number, match[1] as number];
        this.zoom = [MapComponent.DEEPLINK_POI_ZOOM]; // zoom in
      } else {
        this.logger.warn(`${this.className} ${this.route.snapshot.params.coordinates} does not match regexp ${REGEXP_COORDINATES}`);
      }
    }
    const queryParams = this.route.snapshot.queryParamMap;
    const feature = queryParams.has('from') ? queryParams.get('from') : null;
    switch (feature) {
      case 'videos':
        this.logger.debug('Feature: Video Mode, using exclusive display');
        this.initVideos(queryParams.has('id') ? queryParams.get('id') : null);
        break;
      case 'komoot-tours':
        this.logger.debug('Feature: Komoot Tour mode, show only tour links');
        this.initKomootTours(queryParams.has('id') ? queryParams.get('id') : null);
        break;
      case 'dishes':
        this.logger.debug('Feature: Dishes mode, delegate to standard mode POI');
        this.initCountries(queryParams.get('areaCode'));
        break;
      case 'places':
        this.logger.debug('Feature: Places mode, delegate to standard mode POI');
        this.initPOIs();
        break;
      default:
          this.logger.debug('Feature: Default mode POI');
          this.initPOIs(); // includes 'places' mode
    }
  }

  initCountries(areaCode?: string): void {
    this.logger.debug(`Country Display areaCode=${areaCode}`);
    if (areaCode) {
      this.masterData.countries.subscribe(areas => {
        for (const area of areas) {
          if ((area.coordinates?.length > 0) && area.code === areaCode) {
            this.logger.info(`Area ${area.name} matches and has coordinates, let's zoom in`);
            this.coordinates = area.coordinates;
            this.zoom = [MapComponent.ON_CLICK_POI_ZOOM];
            // Add item to lis
            const features: Array<Feature<GeoJSON.Point>> = []; // we'll push to this array while iterating through all POIs
            features.push({
              type: 'Feature',
              properties: {
                name: 'Country Location',
                areaCode,
                imageUrl: '',
                icon: 'attraction'
              },
              geometry: {
                type: 'Point',
                coordinates: area.coordinates
              }
            });
            this.points = {type: 'FeatureCollection', features};
            break;
          }
        }
      });
    }
  }

  // Experimental Video Layer ...
  initVideos(id?: string): void {
    // check if other components linked into map e.g. with ?from=somewhere
    const features: Array<Feature<GeoJSON.Point>> = []; // we'll push to this array while iterating through all POIs
    this.linkStore.getVideo$()
      .subscribe(videos => {
        videos.filter(video => video.coordinates?.length > 1)
          .forEach(video =>
            features.push({
              type: 'Feature',
              properties: {
                name: video.name + (video.id === id ? ' *' : ''), // cheap marker for the video we focus on, we can do better
                areaCode: null,
                imageUrl: '/assets/icons/camera.svg',
                routerLink: `/videos/${video.id}`,
                icon: 'cinema'
              },
              geometry: {type: 'Point', coordinates: video.coordinates}
            })
          );
        this.applyFeatures(features);
      });
  }

  // Experimental Komoot Tour Layer ...
  initKomootTours(id?: string): void {
    // check if other components linked into map e.g. with ?from=somewhere
    const features: Array<Feature<GeoJSON.Point>> = []; // we'll push to this array while iterating through all POIs
    this.linkStore.getKomootTours$()
      .subscribe(tours => {
        tours.filter(tour => tour.coordinates?.length > 1)
          .forEach(tour =>
            features.push({
              type: 'Feature',
              properties: {
                name: tour.name + (tour.id === id ? ' *' : ''), // cheap marker for the video we focus on, we can do better
                areaCode: null,
                imageUrl: tour.linkUrl + '/embed?image=1&profile=1',
                // routerLink: tour.linkUrl,
                icon: 'veterinary'
              },
              geometry: {type: 'Point', coordinates: tour.coordinates}
            })
          );
        this.applyFeatures(features);
      }); // end subscription callback
  }

  // Standard init pois
  initPOIs(): void {
    // Load POIs from backend and put them on the map
    this.areaStore.getPOIs()
      .subscribe((poiList: POI[]) => {
        const features: Array<Feature<GeoJSON.Point>> = []; // we'll push to this array while iterating through all POIs

        poiList.forEach(poi => {
          if (!poi.coordinates) {
            this.logger.warn(`${this.className} ${poi.id} empty coordinates, skipping`);
            return;
          }

          features.push({
            type: 'Feature',
            properties: {
              name: poi.name,
              areaCode: poi.areaCode,
              imageUrl: this.getThumbnail(poi.imageUrl),
              routerLink: `/places/details/${poi.id}`,
              icon: this.getMakiIcon(poi.locationType)
            },
            geometry: {
              type: 'Point',
              coordinates: poi.coordinates
            }
          });
        }); // end poiList loop
        this.applyFeatures(features);
      }); // end subscription callback
  }

  // Set the GeoJSON.FeatureCollection which is bound to
  // <mgl-geojson-source /> element with [data]
  private applyFeatures(features: Array<Feature<GeoJSON.Point>> ) {
    this.points = {
      type: 'FeatureCollection',
      features  // Object-literal shorthand, means "features: features"
    };
  }

  // E.g. attraction, see https://labs.mapbox.com/maki-icons/
  getMakiIcon(locationType: string) {
    return this.locationType2Maki.has(locationType) && this.locationType2Maki.get(locationType).length > 0
      ? this.locationType2Maki.get(locationType) : 'attraction';
  }

  getThumbnail(imageUrl: string): string {
    if (imageUrl === null || imageUrl === undefined || (!imageUrl.startsWith(environment.apiUrlImagine))) {
      return '';
    }
    return imageUrl.replace('?large', '?small');
  }

  // triggered when used picks a different style, e.g. switch from satellite to street view
  onMapboxStyleChange(entry: { [key: string]: any }) {
    this.logger.info(`${this.className} Switch to mapbox://styles/mapbox/${entry.id}`);
    this.mapStyle = 'mapbox://styles/mapbox/' + entry.id;
  }

  // Handle the details popup when user clicks on an icon
  onPOIClick(evt: MapLayerMouseEvent) {
    // https://stackoverflow.com/questions/35614957/how-can-i-read-current-zoom-level-of-mapbox
    // https://wykks.github.io/ngx-mapbox-gl/demo/edit/center-on-symbol
    this.selectedPOI = evt.features[0];
    // center map at POI
    this.coordinates = (evt.features[0].geometry as Point).coordinates;
    const actualZoom = this.mapbox.mapInstance.getZoom();
    if (actualZoom < MapComponent.ON_CLICK_POI_ZOOM) {
      this.logger.debug(`${this.className} Current Zoom level is ${actualZoom}, zooming in to ${MapComponent.ON_CLICK_POI_ZOOM}`);
      this.zoom = [MapComponent.ON_CLICK_POI_ZOOM]; // zoom in
    }
  }

}
