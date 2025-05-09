export interface ISensorData {
    accelerometer: {
        x: number | null;
        y: number | null;
        z: number | null;
    };
    accelerometerIncludingGravity: {
        x: number | null;
        y: number | null;
        z: number | null;
    };
    gyroscope: {
        roll: number | null;  // beta
        pitch: number | null; // gamma
        yaw: number | null;   // alpha
    };
    absolute: {
        x: number | null; // beta: -180..180
        y: number | null; // gamma: -90..90
        z: number | null; // alpha: 0..360
    };
}

export class Sensors {
    private readonly _isExistMotionEvent: boolean;
    private readonly _isExistOrientationEvent: boolean;
    private _latestData: ISensorData;

    constructor() {
        this._isExistMotionEvent = typeof window.DeviceMotionEvent !== 'undefined';
        this._isExistOrientationEvent = typeof window.DeviceOrientationEvent !== 'undefined';
        
        this._latestData = this._getInitialSensorData();
        
        this._initializeEventListeners();
    }

    private _getInitialSensorData(): ISensorData {
        return {
            accelerometer: { x: null, y: null, z: null },
            accelerometerIncludingGravity: { x: null, y: null, z: null },
            gyroscope: { roll: null, pitch: null, yaw: null },
            absolute: { x: null, y: null, z: null }
        };
    }

    private _initializeEventListeners(): void {
        if (this._isExistMotionEvent) {
            window.addEventListener('devicemotion', this._handleMotionEvent.bind(this));
        }
        if (this._isExistOrientationEvent) {
            window.addEventListener('deviceorientation', this._handleOrientationEvent.bind(this));
        }
    }

    private _handleMotionEvent(event: DeviceMotionEvent): void {
        this._latestData = {
            ...this._latestData,
            accelerometer: {
                x: event.acceleration?.x ?? null,
                y: event.acceleration?.y ?? null,
                z: event.acceleration?.z ?? null,
            },
            accelerometerIncludingGravity: {
                x: event.accelerationIncludingGravity?.x ?? null,
                y: event.accelerationIncludingGravity?.y ?? null,
                z: event.accelerationIncludingGravity?.z ?? null,
            },
            gyroscope: {
                roll: event.rotationRate?.beta ?? null,
                pitch: event.rotationRate?.gamma ?? null,
                yaw: event.rotationRate?.alpha ?? null,
            },
        };
    }

    private _handleOrientationEvent(event: DeviceOrientationEvent): void {
        this._latestData = {
            ...this._latestData,
            absolute: {
                x: event.beta ?? null,
                y: event.gamma ?? null,
                z: event.alpha ?? null,
            }
        };
    }

    /**
     * Validates if the sensor data contains any non-null values
     */
    public isCorrectData(data: unknown): boolean {
        if (!data || typeof data !== 'object') {
            return false;
        }

        return Object.values(data).some(nestedObj => {
            if (!nestedObj || typeof nestedObj !== 'object') {
                return false;
            }
            return Object.values(nestedObj).some(value => value !== null);
        });
    }

    public canGetData(): boolean {
        return this._isExistMotionEvent && this._isExistOrientationEvent;
        // TODO: Implement _isCorrectData check
    }

    public getRawData(): ISensorData {
        return this._latestData;
    }
}