"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-google-charts").then(mod => mod.Chart), {
  ssr: false,
});

export default function Home() {
  const [gas, setGas] = useState(0);
  const [brake, setBrake] = useState(false);
  const [rpm, setRpm] = useState(0);
  const [temp, setTemp] = useState(0);
  const [oilTemp, setOilTemp] = useState(0);
  const [fault, setFault] = useState(false);

  // Ref um Gas und Bremse als gedrückt zu tracken
  const gasPressed = useRef(false);
  const brakePressed = useRef(false);

  const baseOptions = {
    width: 300,
    height: 240,
    redFrom: 100,
    redTo: 120,
    yellowFrom: 80,
    yellowTo: 100,
    minorTicks: 5,
    max: 120,
  };

  // Gas und Bremse simulieren durch Halten der Buttons
  useEffect(() => {
    const interval = setInterval(() => {
      if (gasPressed.current) {
        setGas((g) => Math.min(5000, g + 200));
        setBrake(false);
        brakePressed.current = false;
      } else if (brakePressed.current) {
        setGas(0);
        setBrake(true);
      } else {
        setBrake(false);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const targetRpm = brake ? 0 : gas;
      const newRpm = rpm + (targetRpm - rpm) * 0.1;

      let newTemp = temp;
      if (newRpm > 200) newTemp += 0.4 * (newRpm / 1000);
      else newTemp -= 2.0;
      newTemp = Math.max(0, Math.min(newTemp, 120));

      let newOilTemp = oilTemp;
      if (newRpm > 200) newOilTemp += 0.25 * (newRpm / 1000);
      else newOilTemp -= 1.5;
      newOilTemp = Math.max(0, Math.min(newOilTemp, 120));

      const newFault = newTemp > 100;

      setRpm(newRpm);
      setTemp(newTemp);
      setOilTemp(newOilTemp);
      setFault(newFault);

      if (brake && newRpm < 10) setBrake(false);
    }, 200);

    return () => clearInterval(interval);
  }, [gas, brake, rpm, temp, oilTemp]);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>🧪 Motorsimulator</h1>

      {/* Pedale Container */}
      <div style={{ marginTop: 20, display: "flex", gap: 30, justifyContent: "center" }}>
        {/* Gaspedal */}
        <div
          onMouseDown={() => (gasPressed.current = true)}
          onMouseUp={() => (gasPressed.current = false)}
          onMouseLeave={() => (gasPressed.current = false)}
          onTouchStart={() => (gasPressed.current = true)}
          onTouchEnd={() => (gasPressed.current = false)}
          style={{
            width: 100,
            height: 200,
            background: gasPressed.current ? "#2ecc40" : "#27ae60",
            borderRadius: 20,
            boxShadow: gasPressed.current ? "inset 0 0 10px #27ae60" : "0 5px 10px rgba(0,0,0,0.2)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            color: "white",
            fontWeight: "bold",
            fontSize: 18,
            userSelect: "none",
            cursor: "pointer",
            paddingBottom: 20,
            transition: "background 0.2s, box-shadow 0.2s",
          }}
        >
          Gas
        </div>

        {/* Bremspedal */}
        <div
          onMouseDown={() => (brakePressed.current = true)}
          onMouseUp={() => (brakePressed.current = false)}
          onMouseLeave={() => (brakePressed.current = false)}
          onTouchStart={() => (brakePressed.current = true)}
          onTouchEnd={() => (brakePressed.current = false)}
          style={{
            width: 100,
            height: 200,
            background: brakePressed.current ? "#e74c3c" : "#c0392b",
            borderRadius: 20,
            boxShadow: brakePressed.current ? "inset 0 0 10px #c0392b" : "0 5px 10px rgba(0,0,0,0.2)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            color: "white",
            fontWeight: "bold",
            fontSize: 18,
            userSelect: "none",
            cursor: "pointer",
            paddingBottom: 20,
            transition: "background 0.2s, box-shadow 0.2s",
          }}
        >
          Bremse
        </div>
      </div>

      {/* Anzeigen */}
      <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap", justifyContent: "center" }}>
        <Chart
          chartType="Gauge"
          width="300px"
          height="240px"
          data={[["Label", "Value"], ["Drehzahl (rpm)", rpm]]}
          options={{ ...baseOptions, redFrom: 4500, redTo: 5000, yellowFrom: 4000, yellowTo: 4500, max: 5000 }}
        />
        <Chart
          chartType="Gauge"
          width="300px"
          height="240px"
          data={[["Label", "Value"], ["Temperatur (°C)", temp]]}
          options={baseOptions}
        />
        <Chart
          chartType="Gauge"
          width="300px"
          height="240px"
          data={[["Label", "Value"], ["Öl Temperatur (°C)", oilTemp]]}
          options={baseOptions}
        />
      </div>
      <div style={{ fontSize: "1.2em", marginTop: "10px", color: fault ? "red" : "green", textAlign: "center" }}>
        {fault ? "⚠️ Fehler: Überhitzung!" : "✅ Status: OK"}
      </div>
    </div>
  );
}
