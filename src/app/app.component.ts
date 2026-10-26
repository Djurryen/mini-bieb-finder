import { Component, ViewChild, WritableSignal, inject, signal } from '@angular/core';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { points_of_interest } from './data/points-of-interest';
import { RoutesService } from './services/routes.service';
import { RouteResponse } from './models/route-response.interface';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  timer,
} from 'rxjs';
import { MapOptions } from './config/map-options.config';
import { MarkerService } from './services/marker.service';
import { palette } from './data/colors';

@Component({
  selector: 'app-root',
  imports: [GoogleMapsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  initPosition: WritableSignal<google.maps.LatLngLiteral> = signal({ lat: 0, lng: 0 });
  orientationEnabled: WritableSignal<boolean> = signal(false);
  activePath: google.maps.Polyline | null = null;
  mapOptions = MapOptions;

  userPosition$ = new BehaviorSubject<google.maps.LatLngLiteral | null>(null);
  activePoi$ = new BehaviorSubject<google.maps.LatLngLiteral | null>(null);

  @ViewChild('map', { static: false }) map!: GoogleMap;

  #routesService = inject(RoutesService);
  #markerService = inject(MarkerService);

  ngOnInit(): void {
    this.#setInitialPosition();
    this.#watchUserPosition()
      .pipe(distinctUntilChanged())
      .subscribe(position => {
        this.userPosition$.next(position);
      });

    combineLatest([this.userPosition$, this.activePoi$])
      .pipe(
        filter(([user, poi]) => !!user && !!poi),
        switchMap(([user, poi]) =>
          this.#routesService.getRoute(
            { latitude: user!.lat, longitude: user!.lng },
            { latitude: poi!.lat, longitude: poi!.lng },
          ),
        ),
      )
      .subscribe((route: RouteResponse) => this.#drawPath(route));
  }

  ngAfterViewInit(): void {
    for (const position of points_of_interest) {
      this.#markerService.createPoiMarker(this.map, position, () => this.#navigateToPoi(position));
    }
  }

  #setInitialPosition(): void {
    navigator.geolocation.getCurrentPosition(position => {
      this.initPosition.set({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  }

  #watchUserPosition(): Observable<google.maps.LatLngLiteral> {
    return timer(0, 10000).pipe(
      switchMap(
        () =>
          new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject),
          ),
      ),
      map(position => {
        const userPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        } as google.maps.LatLngLiteral;

        this.#markerService.createUserMarker(this.map, userPosition);

        return userPosition;
      }),
    );
  }

  #navigateToPoi(poi: google.maps.LatLngLiteral): void {
    this.activePoi$.next(poi);
  }

  #drawPath(data: RouteResponse): void {
    const encoded = data.routes?.[0]?.polyline?.encodedPolyline;

    if (!encoded) return;

    const decodedPath = google.maps.geometry?.encoding.decodePath(encoded);

    if (this.activePath) {
      this.activePath.setPath(decodedPath);
    } else {
      this.activePath = new google.maps.Polyline({
        path: decodedPath,
        map: this.map.googleMap!,
        strokeColor: palette.pink_dark,
        strokeWeight: 5,
      });
    }
  }

  // enableOrientation(): void {
  //   this.orientationEnabled.set(true);

  //   let currentHeading = 0;

  //   const handleOrientation = (event: DeviceOrientationEvent) => {
  //     const target = event.alpha;

  //     if (target != null) {
  //       currentHeading = currentHeading + (target - currentHeading) * 0.1;
  //       this.map.googleMap?.setHeading(currentHeading);
  //     }
  //   };

  //   const addOrientationTracking = () => {
  //     this.map.googleMap?.setTilt(45);
  //     window.addEventListener('deviceorientation', handleOrientation);
  //     window.addEventListener('pointerdown', removeOrientationTracking);
  //   };

  //   const removeOrientationTracking = () => {
  //     this.map.googleMap?.setTilt(0);
  //     this.orientationEnabled.set(false);
  //     window.removeEventListener('deviceorientation', handleOrientation);
  //     window.removeEventListener('pointerdown', removeOrientationTracking);
  //   };

  //   if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
  //     (DeviceOrientationEvent as any).requestPermission().then((state: string) => {
  //       if (state === 'granted') {
  //         addOrientationTracking();
  //       }
  //     });
  //   } else {
  //     addOrientationTracking();
  //   }
  // }
}
