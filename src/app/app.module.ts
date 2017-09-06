import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DiscoveryModule } from 'vidal-ngx-discovery';
import { SesameModule } from 'vidal-ngx-sesame';
import { ToolbarModule } from './modules/toolbar/toolbar.module';
import { RouterModule } from '@angular/router';
import { Ng2BootstrapModule } from 'ngx-bootstrap';

export const APP_ROUTER_PROVIDERS = RouterModule.forRoot([
  { path: '', component: AppComponent },
]);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    APP_ROUTER_PROVIDERS,
    BrowserModule,
    DiscoveryModule.forRoot('/api/discovery'),
    SesameModule.forRoot('http://sesame.vidal.net/api'),
    ToolbarModule,
    Ng2BootstrapModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
