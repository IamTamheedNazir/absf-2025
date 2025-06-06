import React, { useState, useEffect } from "react";
import {
  BrowserProvider,
  Contract,
  parseEther,
  toUtf8Bytes
} from "ethers";
import "./App.css"; // Optional if you want to add custom fonts/colors

const contractAddress = "0x72e01f10A3BB54d6945383d50d1509464687EA34";
const contractABI = [
  "function requestInference(bytes32 modelHash, bytes inputData) payable returns (uint256)",
  "function postInference(uint256 requestId, bytes outputData)",
  "function requests(uint256) view returns (address requester, address prover, address challenger, bytes32 modelHash, bytes inputData, bytes outputData, uint256 stake, uint256 disputeWindow, bool disputed, bool settled)"
];

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [input, setInput] = useState("");
  const [requestId, setRequestId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      if (window.ethereum) {
        try {
          const prov = new BrowserProvider(window.ethereum);
          await prov.send("eth_requestAccounts", []);
          const signer = await prov.getSigner();
          const address = await signer.getAddress();
          const cont = new Contract(contractAddress, contractABI, signer);

          setProvider(prov);
          setSigner(signer);
          setContract(cont);
          setAccount(address);
        } catch (err) {
          console.error("Wallet connection failed:", err);
        }
      } else {
        alert("Please install MetaMask!");
      }
    }
    init();
  }, []);

  const handleRequestInference = async () => {
    if (!contract || !signer) return;
    setLoading(true);
    try {
      const modelHash = "0x" + "abc123".padEnd(64, "0");
      const inputData = toUtf8Bytes(input);
      const value = parseEther("0.01");

      const tx = await contract.requestInference(modelHash, inputData, { value });
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      setRequestId(receipt.hash || "Submitted");
    } catch (err) {
      console.error("Inference request failed:", err);
      alert("Transaction failed. Check console for details.");
    }
    setLoading(false);
  };

  return (
    <div className="app bg-gradient-to-br from-[#0f172a] to-[#1e293b] min-h-screen text-white p-8 font-sans">
      <div className="max-w-xl mx-auto border border-gray-700 rounded-xl shadow-2xl bg-[#1e293b] p-8">
        <h1 className="text-3xl font-bold mb-4 text-blue-400">🔗 AI-Blockchain Inference</h1>
        <p className="mb-4 text-sm text-gray-300">
          <strong>Wallet:</strong>{" "}
          <span className="text-emerald-400 font-mono">
            {account || "Not connected"}
          </span>
        </p>

        <input
          type="text"
          placeholder="Enter inference input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg border border-gray-600 bg-[#0f172a] text-white placeholder-gray-400"
        />

        <button
          onClick={handleRequestInference}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold"
        >
          {loading ? "Submitting..." : "Request Inference"}
        </button>

        {requestId && (
          <p className="mt-4 text-green-400 font-mono">
            ✅ Request ID: {requestId}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
