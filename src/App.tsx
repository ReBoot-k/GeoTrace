import { useEffect, useState, useMemo } from 'react';
import { Sensors, ISensorData } from './sensors/sensors';
import './styles/App.css';

const INITIAL_SENSOR_DATA: ISensorData = {
    accelerometer: { x: null, y: null, z: null },
    accelerometerIncludingGravity: { x: null, y: null, z: null },
    gyroscope: { roll: null, pitch: null, yaw: null },
    absolute: { x: null, y: null, z: null }
};

const SENSOR_UPDATE_FREQUENCY_HZ = 1000;
const UPDATE_INTERVAL = SENSOR_UPDATE_FREQUENCY_HZ > 0
    ? (1000 / SENSOR_UPDATE_FREQUENCY_HZ)
    : 1;
const UNAVAILABLE_VALUE = 'N/A' as const;

function App() {
    const [sensorData, setSensorData] = useState<ISensorData>(INITIAL_SENSOR_DATA);
    const [isCanGetData, setIsCanGetData] = useState<boolean>(false);
    const [deltaTime, setDeltaTime] = useState<number>(0);

    const sensors = useMemo(() => new Sensors(), []);

    useEffect(() => {
        try {
            const canGetData = sensors.canGetData();
            setIsCanGetData(canGetData);
        } catch (error) {
            console.error('Error checking sensor data availability:', error);
        }
    }, [sensors]);

    useEffect(() => {
        if (!isCanGetData) return;

        const intervalId = setInterval(() => {
            try {
                const data = sensors.getRawData();
                setSensorData(data);
                setDeltaTime((deltaTime) => (deltaTime + UPDATE_INTERVAL));
            } catch (error) {

                console.error('Error fetching sensor data:', error);
            }
        }, UPDATE_INTERVAL);

        return () => clearInterval(intervalId);
    }, [isCanGetData, sensors]);

    const renderSensorData = () => (
        <div>
            <p>
                Accelerometer: X: {sensorData.accelerometer.x?.toFixed(2) ?? UNAVAILABLE_VALUE}, Y:{' '}
                {sensorData.accelerometer.y?.toFixed(2) ?? UNAVAILABLE_VALUE}, Z:{' '}
                {sensorData.accelerometer.z?.toFixed(2) ?? UNAVAILABLE_VALUE}
            </p>
            <p>
                Accelerometer (with gravity): X:{' '}
                {sensorData.accelerometerIncludingGravity.x?.toFixed(2) ?? UNAVAILABLE_VALUE}, Y:{' '}
                {sensorData.accelerometerIncludingGravity.y?.toFixed(2) ?? UNAVAILABLE_VALUE}, Z:{' '}
                {sensorData.accelerometerIncludingGravity.z?.toFixed(2) ?? UNAVAILABLE_VALUE}
            </p>
            <p>
                Gyroscope: Roll: {sensorData.gyroscope.roll?.toFixed(2) ?? UNAVAILABLE_VALUE}, Pitch:{' '}
                {sensorData.gyroscope.pitch?.toFixed(2) ?? UNAVAILABLE_VALUE}, Yaw:{' '}
                {sensorData.gyroscope.yaw?.toFixed(2) ?? UNAVAILABLE_VALUE}
            </p>
            <p>
                Absolute: X: {sensorData.absolute.x?.toFixed(2) ?? UNAVAILABLE_VALUE}, Y:{' '}
                {sensorData.absolute.y?.toFixed(2) ?? UNAVAILABLE_VALUE}, Z:{' '}
                {sensorData.absolute.z?.toFixed(2) ?? UNAVAILABLE_VALUE}
            </p>
        </div>
    );

    const renderGraph = () => (
       <canvas style={{ width: '100%' }} id="canvasGraph"></canvas>
    );

    useEffect(() => {
        const graph = document.getElementById("canvasGraph") as HTMLCanvasElement;
        if (!graph) {
            return;
        }

        const context = graph.getContext("2d") as CanvasRenderingContext2D;
        context.stroke();
        const intervalId = setInterval(() => {
            if (deltaTime >= graph.width) {
                setDeltaTime(0);
                context.beginPath();
                context.clearRect(0, 0, graph.width, graph.height);
                moveTo(0,0);
            }
            if (sensorData.gyroscope.roll) {
                context.lineTo(deltaTime, sensorData.gyroscope.roll);
            }
             
        }, UPDATE_INTERVAL);
        return () => clearInterval(intervalId);
    });

    return (
        <div>
            {isCanGetData ? renderSensorData() : <p>Нет доступа к данным</p>}
            {renderGraph()}
        </div>
    );
}

export default App;