import { useState } from "react";
import useSWR from "swr";
import Papa from "papaparse";
import Flag from "react-flagkit";
import "./App.css";

type BinRecord = {
  BIN: string;
  Brand: string;
  Type: string;
  Category: string;
  Issuer: string;
  IssuerPhone: string;
  IssuerUrl: string;
  isoCode2: string;
  isoCode3: string;
  CountryName: string;
};

const fetcher = async (url: string) => {
  const text = await fetch(url).then((res) => res.text());
  const { data } = Papa.parse<BinRecord>(text, {
    header: true,
    skipEmptyLines: true,
  });
  const map = new Map<string, BinRecord>();
  for (const row of data) {
    if (row.BIN) map.set(row.BIN.trim(), row);
  }
  return map;
};

const FIELDS: { key: keyof BinRecord; label: string }[] = [
  { key: "BIN", label: "BIN" },
  { key: "Brand", label: "Brand" },
  { key: "Type", label: "Type" },
  { key: "Category", label: "Category" },
  { key: "Issuer", label: "Issuer" },
  { key: "IssuerPhone", label: "Issuer Phone" },
  { key: "IssuerUrl", label: "Issuer URL" },
];

function App() {
  const BIN_LIST_URL =
    "https://rawcdn.githack.com/venelinkochev/bin-list-data/refs/heads/master/bin-list-data.csv";

  const { data, error, isLoading } = useSWR(BIN_LIST_URL, fetcher, {
    revalidateOnFocus: false,
  });
  const [bin, setBin] = useState("");

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-lg">Downloading BIN list…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="alert alert-error max-w-md">
          <span>Failed to download the BIN list. Please try again later.</span>
        </div>
      </div>
    );
  }

  const query = bin.trim();
  const record = query ? data.get(query) : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-2xl bg-base-200 shadow-xl">
        <div className="card-body gap-6">
          <h1 className="card-title text-2xl">BIN Check</h1>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Enter a BIN</span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 002102"
              className="input input-bordered w-full"
              value={bin}
              onChange={(e) => setBin(e.target.value)}
            />
          </label>

          {record ? (
            <div className="overflow-x-auto">
              <table className="table">
                <tbody>
                  {FIELDS.map(({ key, label }) => (
                    <tr key={key}>
                      <th className="w-1/3">{label}</th>
                      <td>
                        {key === "IssuerUrl" && record[key] ? (
                          <a
                            href={record[key]}
                            target="_blank"
                            rel="noreferrer"
                            className="link link-primary break-all"
                          >
                            {record[key]}
                          </a>
                        ) : (
                          record[key] || "—"
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <th className="w-1/3">Country</th>
                    <td>
                      <span className="flex items-center gap-2">
                        {record.isoCode2 && <Flag country={record.isoCode2} size={24} />}
                        <span>{record.CountryName || "—"}</span>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : query ? (
            <div className="alert">
              <span>No match found for "{query}".</span>
            </div>
          ) : (
            <p className="text-base-content/60">Start typing a BIN to see its details.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
