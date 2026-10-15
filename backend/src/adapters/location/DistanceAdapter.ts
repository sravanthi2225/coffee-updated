export interface Coordinates {
  latitude: number;
  longitude: number;
}

export class DistanceAdapter {
  /**
   * Calculate distance between two lat/lng coordinates in kilometers using Haversine formula
   */
  static calculateDistanceKm(c1: Coordinates, c2: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(c2.latitude - c1.latitude);
    const dLon = this.deg2rad(c2.longitude - c1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(c1.latitude)) *
        Math.cos(this.deg2rad(c2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
