import {
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';

import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-route/app-routing.module';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { IconService } from './icon.service';



/**
 * App wide providers, inject all global services.
 * This providers also can be regard as a global service list for retriving.
 */
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  IconService
];

/**
 * The core module that provides global services for the whole app.
 * It only can be import only once by app.module(root module).
 * usually this moule will only have "providers"
 */
@NgModule({
  /**
   * Expose our Services and Providers into Angular's dependency injection.
   */
  providers:[
    ...APP_PROVIDERS
  ]
})

export class AppCoreModule {
  // prevent to import this module twice.
  constructor (@Optional() @SkipSelf() parentModule: AppCoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}