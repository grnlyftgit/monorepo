"use client";

import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => setData(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <main className="flex min-h-screen w-full items-center justify-center">
        <h1 className="font-axiforma-medium">Hello Console</h1>
        {error && <p className="text-red-500">Error: {error}</p>}
        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      </main>
    </div>
  );
}
