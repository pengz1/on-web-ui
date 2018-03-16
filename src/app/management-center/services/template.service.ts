import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpResponse, HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, retry } from 'rxjs/operators';
import 'rxjs/add/operator/delay';
import {TEMPLATE_URL } from '../../models';

import { environment } from 'environments/environment';
import { RackhdHttpService } from './rackhd-http';

@Injectable()
export class TemplateService extends RackhdHttpService {

  constructor(public http: HttpClient) {
    super(http, TEMPLATE_URL);
  }
}