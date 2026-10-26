export interface RouteResponse {
    routes: Array<{
        polyline: {
            encodedPolyline: string;
        }
    }>
}