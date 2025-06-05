"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import TempChart from "./Temp";


const Chart = dynamic(() => import("react-google-charts").then((mod) => mod.Chart), {
  ssr: false,
}); // für die kreise

// wenn rpm grösser ist als 200 dann wird Temperatur sich erhöhen

export default function Home() {
  const [gas, setGas] = useState(0);
  const [brake, setBrake] = useState(false);
  const [rpm, setRpm] = useState(0);
  const [temp, setTemp] = useState(0);
  const [oilTemp, setOilTemp] = useState(0);
  const [fault, setFault] = useState(false);

  const [tempSeries, setTempSeries] = useState<[number, number][]>([]);
  const [oilSeries, setOilSeries] = useState<[number, number][]>([]);
  const [rpmSeries, setRpmSeries] = useState<[number, number][]>([]);

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
  }; // für die kreise

  useEffect(() => { // überprüft jedes 100 millisekunden welches pedal ist gedrückt
    const interval = setInterval(() => {
      if (gasPressed.current) {
        setGas((g) => Math.min(5000, g + 200)); // wenn wir Gas gedrückt haben dann wird es bis 5000 200 immer dazu hinzufügen
        setBrake(false); // bremsen deaktivieren
        brakePressed.current = false;
      } else if (brakePressed.current) {
        setGas(0); 
        setBrake(true); // bremsen aktivieren
      } else {
        setBrake(false);
      }
    }, 100);

    return () => clearInterval(interval); // passiert wenn der Effekt neu ausgeführt oder Komponente entfernt wird, wird dann timer gestoppt
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const targetRpm = brake ? 0 : gas;
      const newRpm = rpm + (targetRpm - rpm) * 0.1; // formel für die rpm simulator änderung, damit es nicht so schnell jedesmal addiert wird

      let newTemp = temp;
      if (newRpm > 200) newTemp += 0.4 * (newRpm / 1000); // wenn drehzahl mehr als 200 dann wird temperatur höher
      else newTemp -= 2.0; // anderfalls wenn Drehzahl weniger als 200 dann wird temperatur weniger
      newTemp = Math.max(0, Math.min(newTemp, 120)); // grenzen defenierung

      // wird nicht so schnell addiert als bei normale temperatur, nämlich langsamer(0.25)
      let newOilTemp = oilTemp;
      if (newRpm > 200) newOilTemp += 0.25 * (newRpm / 1000);
      else newOilTemp -= 1.5; // auch langsamer wird weniger werden als bei normalle temperatur
      newOilTemp = Math.max(0, Math.min(newOilTemp, 120)); // grenzen defenierung

      const newFault = newTemp > 100 || newOilTemp > 100; // wenn die Temperatur mehr als 100 dann bekommen wir Fehlermeldung

      // für graphics Speicherung
      const now = Date.now();
      // nimmt die letzten 49 Punkten aus vorheriges koordinat und hinzufügt neues Punkt immer dazu 
      setTempSeries((prev) => [...prev.slice(-49), [now, newTemp]]); // neues Punkt gilt als datum und aktuelles Wert(temp oder drehzahl)
      setOilSeries((prev) => [...prev.slice(-49), [now, newOilTemp]]);
      setRpmSeries((prev) => [...prev.slice(-49), [now, newRpm]]);

      // aktualisieren parameter in use state
      setRpm(newRpm);
      setTemp(newTemp);
      setOilTemp(newOilTemp);
      setFault(newFault);

      if (brake && newRpm < 10) setBrake(false); // wenn die Bremsen gedrückt sind aber geschwindigkeit weniger als 10 dann werden bremsen deaktiviert
    }, 200);

    return () => clearInterval(interval); // wird dann timer gestoppt
  }, [gas, brake, rpm, temp, oilTemp]);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>🚘 Motorsimulator 🚗</h1>

      {/* Gauge-Anzeigen */}
      <div
        style={{
          display: "flex",
          gap: "40px",
          marginTop: "40px",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Chart
            chartType="Gauge"
            width="300px"
            height="240px"
            data={[["Label", "Value"], ["RPM", Math.round(rpm)]]}
            options={{
              ...baseOptions,
              redFrom: 4500,
              redTo: 5000,
              yellowFrom: 4000,
              yellowTo: 4500,
              max: 5000,
            }}
          />
          <p style={{ fontSize: "1.3em", fontWeight: "bold", textAlign: "center", width: "250px" }}>Drehzahl</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Chart
            chartType="Gauge"
            width="300px"
            height="240px"
            data={[["Label", "Value"], ["°C", Math.round(temp)]]}
            options={baseOptions}
          />
          <p style={{ fontSize: "1.3em", fontWeight: "bold", marginTop: "10px" }}>Temperatur</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Chart
            chartType="Gauge"
            width="300px"
            height="240px"
            data={[["Label", "Value"], ["Öl °C", Math.round(oilTemp)]]}
            options={baseOptions}
          />
          <p style={{ fontSize: "1.3em", fontWeight: "bold", marginTop: "10px" }}>Öl Temperatur</p>
        </div>
      </div>
      <div style={{ display: "flex", columnGap: "100px" , marginTop: "40px" }}>
        <div style={{ maxWidth: "800px", height: "420px", marginBottom: "60px auto" }}>
          <TempChart tempData={tempSeries} oilData={oilSeries} rpmData={rpmSeries} />
        </div>

        {/* Pedale */}
        <div style={{ display: "flex", flexDirection: "column", rowGap: "40px", alignItems: "center" }}>
          <div style={{ fontSize: "1.2em", color: fault ? "red" : "green", textAlign: "center" }}>
            {fault ? "⚠️ Fehler: Überhitzung!" : "✅ Status: OK"}
          </div>
          <div style={{ marginTop: 20, display: "flex", gap: 30, justifyContent: "right", alignItems: "center" }}>
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
        </div>
      </div>
    </div>
  );
}
