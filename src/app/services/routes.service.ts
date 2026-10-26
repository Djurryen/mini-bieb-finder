import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { RouteResponse } from '../models/route-response.interface';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class RoutesService {
  #http = inject(HttpClient);

  getRoute(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
  ): Observable<RouteResponse> {
    const url = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${environment.googleMapsApiKey}`;

    const body = {
      origin: {
        location: { latLng: origin },
      },
      destination: {
        location: { latLng: destination },
      },
      travelMode: 'WALK',
    };

    return this.#http.post<RouteResponse>(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-FieldMask':
          'routes.legs.steps.polyline.encodedPolyline,routes.polyline.encodedPolyline',
      },
    });
  }
}
