import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, AfterViewInit, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, AfterViewInit {
  readonly initPosition = signal<google.maps.LatLngLiteral>({ lat: 0, lng: 0 });

  private activePath: google.maps.Polyline | null = null;
  readonly mapOptions = MapOptions;

  private readonly userPosition$ = new BehaviorSubject<google.maps.LatLngLiteral | null>(null);
  private readonly activePoi$ = new BehaviorSubject<google.maps.LatLngLiteral | null>(null);

  @ViewChild('map', { static: false }) map!: GoogleMap;

  readonly #routesService = inject(RoutesService);
  readonly #markerService = inject(MarkerService);
  readonly #destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.#setInitialPosition();

    this.#watchUserPosition()
      .pipe(
        distinctUntilChanged((a, b) => a.lat === b.lat && a.lng === b.lng),
        takeUntilDestroyed(this.#destroyRef),
      )
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
        takeUntilDestroyed(this.#destroyRef),
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
        const userPosition: google.maps.LatLngLiteral = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

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

    if (!decodedPath) return;

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
}
