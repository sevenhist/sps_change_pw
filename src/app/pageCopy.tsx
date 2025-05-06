"use client"; // Nur wenn du im App Router bist

import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [msg, setMsg] = useState("--");
  let counter=1;
  useEffect(() => {
    const url = "https://192.168.1.3/api/jsonrpc";
    const headers = { "Content-Type": "application/json" };

    const fetchData = async () => {
      try {
        // Login
        const loginPayload = {
          jsonrpc: "2.0",
          id: 1,
          method: "Api.Login",
          params: {
            user: "json",
            password: "json",
          },
        };

        const loginRes = await axios.post(url, loginPayload, { headers });
        const token = loginRes.data.result.token;
        console.log("Token:", token);

        // Read Request
        const readPayload = {
          jsonrpc: "2.0",
          method: "PlcProgram.Read",
          params: {
            var: "\"test\".alex",
          },
          id: counter++,
        };

        const readRes = await axios.post(url, readPayload, {
          headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": token,
          },
        });

        console.log("Read response:", readRes.data);
        setMsg(JSON.stringify(readRes.data.result));
      } catch (err) {
        console.error("Fehler beim Abrufen:", err);
        setMsg("Fehler beim Abrufen");
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Hello</h2>
      <p id="value">Alex ist {msg} Jahre Alt</p>
      <p id="counter">--</p>
    </div>
  );
}
