"use client"; // Nur wenn du im App Router bist

import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [value, setValue] = useState<string>("--");
  const [counter, setCounter] = useState<number>(1);

  useEffect(() => {
    const url = "https://192.168.1.3/api/jsonrpc";
    const headers = { "Content-Type": "application/json" };

    const loginPayload = {
      jsonrpc: "2.0",
      id: 1,
      method: "Api.Login",
      params: {
        user: "json",
        password: "json",
      },
    };

    const fetchData = async () => {
      try {
        // Login
        const loginRes = await axios.post(url, loginPayload, { headers });
        const token = loginRes.data.result.token;
        console.log("Token:", token);

        // Set an interval to fetch data from the PLC
        const interval = setInterval(async () => {
          const readRequestData = {
            jsonrpc: "2.0",
            method: "PlcProgram.Read",
            params: {
              var: "\"somedata_DB\".counter",
            },
            id: counter,
          };

          const readRes = await axios.post(url, readRequestData, {
            headers: {
              "Content-Type": "application/json",
              "X-Auth-Token": token,
            },
          });

          console.log("Read Response:", readRes.data);
          setValue(readRes.data.result);
          setCounter((prevCounter) => prevCounter + 1); // Update counter
        }, 100);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
      } catch (err) {
        console.error("Fehler beim Abrufen:", err);
        setValue("Fehler beim Abrufen");
      }
    };

    fetchData();
  }, [counter]);

  return (
    <div>
      <h2>Hello</h2>
      <p id="value">{value}</p>
      <p id="counter">{counter}</p>
    </div>
  );
}
