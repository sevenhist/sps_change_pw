"use client"; // Nur wenn du im App Router bist

import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

interface ChangePasswordResponse {
  // Typen anpassen je nach API-Antwortstruktur
  success: boolean;
  message: string;
}

export default function Home() {
  const [ip, setIp] = useState<string>('https://192.168.1.3');
  const [port, setPort] = useState<string>('443');
  const [username, setUsername] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // Typisierte Funktion für das Ändern des Passworts
  const handleChangePassword = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

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
          // Achtung: httpsAgent funktioniert nicht im Browser, das musst du serverseitig verwenden!
          // httpsAgent: new window.https.Agent({ rejectUnauthorized: false }),
        }
      );

      if (response.data.success) {
        setMessage('✅ Passwort erfolgreich geändert');
      } else {
        setMessage('⚠️ Unerwartete Antwort: ' + JSON.stringify(response.data));
      }
    } catch (error: any) {
      if (error.response) {
        setMessage(`❌ Fehler: ${JSON.stringify(error.response.data)}`);
      } else {
        setMessage(`❌ Netzwerkfehler: ${error.message}`);
      }
    }
  };

  return (
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
  );
}
