import {Component, OnInit} from '@angular/core';
import {EnvironmentService} from '../shared/environment.service';
import {NGXLogger} from 'ngx-logger';
import {MapboxGeoJSONFeature, MapLayerMouseEvent} from 'mapbox-gl';
import {ApiService} from '../shared/api.service';
import {Feature, Point} from 'geojson';
import {POI} from '../domain/poi';
import {environment} from '../../environments/environment';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  // zoom into ... The latitude of Bangkok, Thailand is 13.736717, and the longitude is 100.523186.
  // check https://docs.mapbox.com/mapbox-gl-js/example/setstyle/ for alternative styles, streets-v11,
  // https://docs.mapbox.com/api/maps/#styles
  readonly mapstyles = [
    {
      description: 'Outdoor',
      id: 'outdoors-v11'
    },
    {
      description: 'Satellite',
      id: 'satellite-streets-v11' // 'satellite-v9' is w/o streets
    } // ,{description: 'Street',id: 'streets-v11'}
  ];
  // selectedMapstyle = this.mapstyles[0].id;

  // http://www.alternatestack.com/development/angular-material-toggle-buttons-group-with-binding/
  mapstyle = 'mapbox://styles/mapbox/' + this.mapstyles[0].id; // default outdoor
  // [51.2097352,35.6970118] teheran ~middle between europe + SE asia
  // [100.523186, 13.736717] = bangkok

  coordinates = [51.2097352, 35.6970118];
  zoom = [3]; // 10 ~ detailed like bangkok + area, 5 ~ southease asia
  accessToken = this.envservice.mapboxAccessToken;
  points: GeoJSON.FeatureCollection<GeoJSON.Point>;
  selectedPOI: MapboxGeoJSONFeature | null;
  cursorStyle: string;

  constructor(private envservice: EnvironmentService,
              private apiService: ApiService,
              private logger: NGXLogger) {
  }

  onMapboxStyleChange(entry: { [key: string]: any }) {
    this.logger.info('Switch to mapbox://styles/mapbox/' + entry.id);
    this.mapstyle = 'mapbox://styles/mapbox/' + entry.id;
  }

  ngOnInit(): void {
    this.logger.info('Mapper is ready token len=', this.envservice.mapboxAccessToken.length);
    this.apiService.getPOIs()
      .subscribe((poiList: POI[]) => {
        const features: Array<Feature<GeoJSON.Point>> = [];
        poiList.forEach(poi => {
          if (!poi.coordinates) {
            this.logger.warn(poi.id + ' empty coordinates');
            return;
          }
          features.push({
            type: 'Feature',
            properties: {
              id: poi.id,
              name: poi.name,
              areaCode: poi.areaCode,
              imageUrl: this.getThumbnail(poi.imageUrl),
              // Toso: Map of https://labs.mapbox.com/maki-icons/
              // available out of the box, e.g. vetenary etc.
              icon: 'attraction'
            },
            geometry: {
              type: 'Point',
              coordinates: poi.coordinates
            }
          });
        });
        this.points = {
          type: 'FeatureCollection',
          features
        };
      });
  }

  getThumbnail(imgageUrl: string): string {
    if (imgageUrl === null || imgageUrl === undefined || (!imgageUrl.startsWith(environment.apiUrlImagine))) {
      return '';
    }
    const newUrl = imgageUrl.replace('?large', '?small');
    return newUrl;
  }

  onPOIClick(evt: MapLayerMouseEvent) {
    // this.selectedPoint = evt.features![0];
    // 50:26  error    This assertion is unnecessary ... typescript-eslint/no-unnecessary-type-assertion ß?
    this.selectedPOI = evt.features[0];
    // center map
    this.coordinates = (evt.features[0].geometry as Point).coordinates;
  }


  // https://wykks.github.io/ngx-mapbox-gl/demo/edit/center-on-symbol
  // centerMapTo(evt: MapMouseEvent) {
  // this.coordinates = (<any>evt).features[0].geometry.coordinates;
  //}
}
