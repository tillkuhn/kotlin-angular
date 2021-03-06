// Fix karma tests:
// https://www.hhutzler.de/blog/angular-6-using-karma-testing/#Error_Datails_NullInjectorError_No_provider_for_Router

import {Component, OnInit} from '@angular/core';
import {AuthService} from '@shared/services/auth.service';
import {NGXLogger} from 'ngx-logger';
import {MasterDataService} from '@shared/services/master-data.service';
import {EnvironmentService} from '@shared/services/environment.service';
import {ApiService} from '@shared/services/api.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss', '../shared/components/common.component.scss']
})
export class HomeComponent implements OnInit {

  private readonly className = 'LinkDetailsComponent';

  countUpConfig = {
    width: '32px',
    height: '32px',
    borderRadius: '60px',
    fontSize: '24px',
    padding: '18px',
    duration: 1500
  };

  // Entity Counts
  counts = {
    places: 0,
    dishes: 0,
    pois: 0,
    notes: 0,
    videos: 0,
    feeds: 0,
  };

  constructor(public authService: AuthService,
              private api: ApiService,
              private logger: NGXLogger,
              public route: ActivatedRoute,
              public masterData: MasterDataService,
              public env: EnvironmentService,
  ) {
  }

  ngOnInit(): void {
    this.logger.debug(`${this.className}.ngOnInit: Welcome Home`);

    this.api.getStats().subscribe(data => this.counts = data);
  }

}
