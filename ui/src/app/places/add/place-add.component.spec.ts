import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PlaceAddComponent} from './place-add.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {LoggerTestingModule} from 'ngx-logger/testing';
import {RouterTestingModule} from '@angular/router/testing';
// imports: [RouterTestingModule, LoggerTestingModule, HttpClientTestingModule]
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';

describe('PlaceAddComponent', () => {
  let component: PlaceAddComponent;
  let fixture: ComponentFixture<PlaceAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaceAddComponent ],
      imports: [RouterTestingModule, LoggerTestingModule, HttpClientTestingModule, FormsModule, ReactiveFormsModule, MatIconModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // todo fix 	Error: No value accessor for form control with name: 'areaCode'
  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});