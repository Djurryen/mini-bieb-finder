export interface RouteResponse {
  routes: Array<{
    polyline: {
      encodedPolyline: string;
    };
    legs: Array<{
      steps: Array<{
        polyline: {
          encodedPolyline: string;
        };
      }>;
    }>;
  }>;
}