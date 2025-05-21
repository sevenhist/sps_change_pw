"use client"; // Nur wenn du im App Router bist

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

// Typisierung der API-Antworten
interface LoginResponse {
  result: {
    token: string;
  };
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export default function Home() {
  // State für Login-Daten und Passwortänderung
  const [msg, setMsg] = useState<string>("--");
  const [ip, setIp] = useState<string>("192.168.1.3");
  const [port, setPort] = useState<string>("443");
  const [username, setUsername] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  let counter = 1;

  // Funktion zum Login und Abrufen des Tokens
  const login = async (): Promise<void> => {
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

    try {
      const loginRes = await axios.post<LoginResponse>(url, loginPayload, { headers });
      const token = loginRes.data.result.token;
      setToken(token);
      console.log("Token:", token);
      setMsg("Login erfolgreich");
    } catch (err) {
      console.error("Fehler beim Login:", err);
      setMsg("Login fehlgeschlagen");
    }
  };

  // Funktion zum Ändern des Passworts
  const handleChangePassword = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!token) {
      setMessage("❌ Bitte zuerst einloggen!");
      return;
    }

    const url = `https://${ip}:${port}/api/ChangePassword`;

    try {
      const response = await axios.post<ChangePasswordResponse>(
        url,
        {
          username: username,
          password: currentPassword,
          new_password: newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": token,
          },
        }
      );

      if (response.data.success) {
        setMessage("✅ Passwort erfolgreich geändert");
      } else {
        setMessage("⚠️ Unerwartete Antwort: " + JSON.stringify(response.data));
      }
    } catch (error: any) {
      if (error.response) {
        setMessage(`❌ Fehler: ${JSON.stringify(error.response.data)}`);
      } else {
        setMessage(`❌ Netzwerkfehler: ${error.message}`);
      }
    }
  };

  // Login wird beim ersten Rendern ausgeführt
  useEffect(() => {
    login();
  }, []);

  return (
    <div>
      <h2>Willkommen!</h2>
      <p>{msg}</p>

      <form onSubmit={handleChangePassword} style={{ maxWidth: 400 }}>
        <h2>Passwort ändern</h2>
        <input
          placeholder="SPS-IP-Adresse"
          value={ip}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setIp(e.target.value)}
          required
        />
        <input
          placeholder="Port"
          value={port}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPort(e.target.value)}
          required
        />
        <input
          placeholder="Benutzername"
          value={username}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Aktuelles Passwort"
          value={currentPassword}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Neues Passwort"
          value={newPassword}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit">Ändern</button>
        <div>{message}</div>
      </form>
    </div>
  );
}
