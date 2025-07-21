import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import GPSTracker from '../js/GPSTracker.js';

describe('GPSTracker', () => {
  let gpsTracker;
  let mockGeolocation;

  beforeEach(() => {
    gpsTracker = new GPSTracker(1000); // 1km snap distance for testing
    jest.clearAllMocks();

    // Mock geolocation
    mockGeolocation = {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn(),
      clearWatch: jest.fn()
    };

    global.navigator = {
      geolocation: mockGeolocation
    };

    // Mock fetch for GPX loading
    global.fetch = jest.fn();

    // Mock console methods
    global.console = {
      debug: jest.fn(),
      error: jest.fn()
    };

    // Mock DOMParser for GPX parsing
    global.DOMParser = jest.fn().mockImplementation(() => ({
      parseFromString: jest.fn().mockReturnValue({
        querySelector: jest.fn(),
        querySelectorAll: jest.fn().mockReturnValue([])
      })
    }));
  });

  describe('Constructor', () => {
    test('should initialize with default values', () => {
      const tracker = new GPSTracker();
      
      expect(tracker.currentPosition).toBeNull();
      expect(tracker.tracking).toBe(false);
      expect(tracker.watchId).toBeNull();
      expect(tracker.onMileUpdate).toBeNull();
      expect(tracker.mileMarkers).toEqual([]);
      expect(tracker.snapDistance).toBe(5000); // Default 5km
    });

    test('should accept custom snap distance', () => {
      const tracker = new GPSTracker(2000);
      expect(tracker.snapDistance).toBe(2000);
    });
  });

  describe('Mile Marker Loading', () => {
    test('should load sample PCT data as fallback', async () => {
      const mileMarkers = await gpsTracker.loadSamplePCTData();
      
      expect(mileMarkers).toHaveLength(11); // Miles 0-10
      expect(mileMarkers[0]).toEqual({
        mile: 0,
        lat: 32.5951,
        lng: -116.4656,
        name: "Mexican Border"
      });
      expect(mileMarkers[10]).toEqual({
        mile: 10,
        lat: 32.6671,
        lng: -116.5126,
        name: "Mile 10"
      });
    });

    test('should load mile markers and use fallback on fetch error', async () => {
      global.fetch.mockRejectedValue(new Error('Fetch failed'));
      
      const mileMarkers = await gpsTracker.loadMileMarkers('PCT');
      
      expect(global.fetch).toHaveBeenCalledWith('./data/Full_PCT_Mile_Marker.gpx');
      expect(mileMarkers).toHaveLength(11); // Should fall back to sample data
      expect(gpsTracker.mileMarkers).toEqual(mileMarkers);
    });

    test('should handle non-PCT trail', async () => {
      const mileMarkers = await gpsTracker.loadMileMarkers('CDT');
      
      expect(mileMarkers).toHaveLength(11); // Should use sample data
      expect(gpsTracker.mileMarkers).toEqual(mileMarkers);
    });

    test('should parse GPX data successfully', async () => {
      const mockGpxContent = '<gpx></gpx>';
      const mockWaypoints = [
        {
          getAttribute: jest.fn()
            .mockReturnValueOnce('32.5951') // lat
            .mockReturnValueOnce('-116.4656'), // lon
          querySelector: jest.fn().mockReturnValue({
            textContent: 'PCT Mile 0'
          })
        }
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockGpxContent)
      });

      const mockDoc = {
        querySelector: jest.fn().mockReturnValue(null), // No parse error
        querySelectorAll: jest.fn().mockReturnValue(mockWaypoints)
      };

      global.DOMParser.mockImplementation(() => ({
        parseFromString: jest.fn().mockReturnValue(mockDoc)
      }));

      const mileMarkers = await gpsTracker.loadMileMarkers('PCT');

      expect(mileMarkers).toHaveLength(1);
      expect(mileMarkers[0]).toEqual({
        mile: 0,
        lat: 32.5951,
        lng: -116.4656,
        name: 'PCT Mile 0'
      });
    });
  });

  describe('GPS Tracking', () => {
    test('should throw error if geolocation not supported', async () => {
      global.navigator.geolocation = undefined;
      
      await expect(gpsTracker.startTracking()).rejects.toThrow('GPS not supported on this device');
    });

    test('should start GPS tracking successfully', async () => {
      const mockCallback = jest.fn();
      const mockPosition = {
        coords: {
          latitude: 32.5951,
          longitude: -116.4656,
          accuracy: 10
        },
        timestamp: Date.now()
      };

      mockGeolocation.watchPosition.mockImplementation((success, error, options) => {
        setTimeout(() => success(mockPosition), 0);
        return 12345; // mock watch id
      });

      await gpsTracker.startTracking(mockCallback);

      expect(gpsTracker.tracking).toBe(true);
      expect(gpsTracker.watchId).toBe(12345);
      expect(gpsTracker.onMileUpdate).toBe(mockCallback);
      expect(mockGeolocation.watchPosition).toHaveBeenCalled();
    });

    test('should handle GPS errors', async () => {
      const mockError = new Error('Location access denied');
      
      mockGeolocation.watchPosition.mockImplementation((success, error, options) => {
        setTimeout(() => error(mockError), 0);
      });

      await expect(gpsTracker.startTracking()).rejects.toThrow('Location access denied');
    });

    test('should stop GPS tracking', () => {
      gpsTracker.watchId = 12345;
      gpsTracker.tracking = true;

      gpsTracker.stopTracking();

      expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(12345);
      expect(gpsTracker.watchId).toBeNull();
      expect(gpsTracker.tracking).toBe(false);
    });
  });

  describe('Position Handling', () => {
    beforeEach(async () => {
      await gpsTracker.loadSamplePCTData();
    });

    test('should handle position updates', () => {
      const mockCallback = jest.fn();
      gpsTracker.onMileUpdate = mockCallback;

      const mockPosition = {
        coords: {
          latitude: 32.5951,
          longitude: -116.4656,
          accuracy: 10
        },
        timestamp: Date.now()
      };

      gpsTracker.handlePositionUpdate(mockPosition);

      expect(gpsTracker.currentPosition).toEqual({
        lat: 32.5951,
        lng: -116.4656,
        timestamp: expect.any(Date),
        accuracy: 10
      });
    });

    test('should call mile update callback when mile changes', () => {
      const mockCallback = jest.fn();
      gpsTracker.onMileUpdate = mockCallback;

      // First position at mile 0
      const position1 = {
        coords: { latitude: 32.5951, longitude: -116.4656, accuracy: 10 },
        timestamp: Date.now()
      };
      gpsTracker.handlePositionUpdate(position1);

      expect(mockCallback).toHaveBeenCalledWith({
        mile: 0,
        position: expect.any(Object),
        previousMile: null,
        timestamp: expect.any(Date)
      });

      mockCallback.mockClear();

      // Second position at mile 1
      const position2 = {
        coords: { latitude: 32.6023, longitude: -116.4703, accuracy: 10 },
        timestamp: Date.now()
      };
      gpsTracker.handlePositionUpdate(position2);

      expect(mockCallback).toHaveBeenCalledWith({
        mile: 1,
        position: expect.any(Object),
        previousMile: 0,
        timestamp: expect.any(Date)
      });
    });
  });

  describe('Distance Calculations', () => {
    test('should calculate distance using Haversine formula', () => {
      // Distance between Mexican Border (mile 0) and mile 1 markers
      const distance = gpsTracker.calculateDistance(
        32.5951, -116.4656, // Mile 0
        32.6023, -116.4703  // Mile 1
      );

      // Should be approximately 1 mile (1609 meters)
      expect(distance).toBeGreaterThan(1500);
      expect(distance).toBeLessThan(2000);
    });

    test('should return 0 for same point', () => {
      const distance = gpsTracker.calculateDistance(
        32.5951, -116.4656,
        32.5951, -116.4656
      );

      expect(distance).toBe(0);
    });
  });

  describe('Mile Calculations', () => {
    beforeEach(async () => {
      await gpsTracker.loadSamplePCTData();
    });

    test('should return null when no position set', () => {
      expect(gpsTracker.getCurrentMile()).toBeNull();
    });

    test('should return null when no mile markers loaded', () => {
      gpsTracker.mileMarkers = [];
      gpsTracker.currentPosition = { lat: 32.5951, lng: -116.4656 };
      
      expect(gpsTracker.getCurrentMile()).toBeNull();
    });

    test('should snap to closest mile marker within range', () => {
      // Position very close to mile 0
      gpsTracker.currentPosition = { lat: 32.5951, lng: -116.4656 };
      
      expect(gpsTracker.getCurrentMile()).toBe(0);
    });

    test('should not snap when too far from any marker', () => {
      // Position far from any marker
      gpsTracker.currentPosition = { lat: 40.0, lng: -120.0 };
      
      expect(gpsTracker.getCurrentMile()).toBeNull();
    });

    test('should find closest mile marker even if not exact', () => {
      // Position slightly off mile 1
      gpsTracker.currentPosition = { lat: 32.6020, lng: -116.4700 };
      
      expect(gpsTracker.getCurrentMile()).toBe(1);
    });
  });

  describe('Utility Methods', () => {
    beforeEach(async () => {
      await gpsTracker.loadSamplePCTData();
      gpsTracker.currentPosition = { lat: 32.5951, lng: -116.4656 };
    });

    test('should return current position', () => {
      const position = gpsTracker.getPosition();
      expect(position).toEqual({ lat: 32.5951, lng: -116.4656 });
    });

    test('should return tracking status', () => {
      expect(gpsTracker.isTracking()).toBe(false);
      gpsTracker.tracking = true;
      expect(gpsTracker.isTracking()).toBe(true);
    });

    test('should return mile markers', () => {
      const markers = gpsTracker.getMileMarkers();
      expect(markers).toHaveLength(11);
      expect(markers[0].mile).toBe(0);
    });

    test('should return closest mile markers', () => {
      const closest = gpsTracker.getClosestMileMarkers(3);
      
      expect(closest).toHaveLength(3);
      expect(closest[0].mile).toBe(0); // Closest should be mile 0
      expect(closest[0].distance).toBeLessThan(closest[1].distance);
      expect(closest[1].distance).toBeLessThan(closest[2].distance);
    });

    test('should handle empty markers for closest search', () => {
      gpsTracker.mileMarkers = [];
      
      const closest = gpsTracker.getClosestMileMarkers();
      expect(closest).toEqual([]);
    });

    test('should handle no position for closest search', () => {
      gpsTracker.currentPosition = null;
      
      const closest = gpsTracker.getClosestMileMarkers();
      expect(closest).toEqual([]);
    });
  });
});