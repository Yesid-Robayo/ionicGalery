import type { ApplicationConfig } from "@angular/core"
import { provideRouter } from "@angular/router"
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http"
import { provideIonicAngular, IonicRouteStrategy } from "@ionic/angular/standalone"
import { RouteReuseStrategy } from "@angular/router"

import { routes } from "./app.routes"
import { HTTP_INTERCEPTORS } from "@angular/common/http"

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIonicAngular(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
}

