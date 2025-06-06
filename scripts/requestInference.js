require("dotenv").config();
const { ethers } = require("hardhat");

const CONTRACT_ADDRESS = "0x8a2e85e49dae43832acd42c6464a5bddcec135e0";

const ABI = [ /* 👇 Paste your ABI here */ 
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "requestId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "challenger", "type": "address" }
    ],
    "name": "InferenceDisputed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "requestId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "prover", "type": "address" },
      { "indexed": false, "internalType": "bytes", "name": "outputData", "type": "bytes" }
    ],
    "name": "InferencePosted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "requestId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "requester", "type": "address" },
      { "indexed": false, "internalType": "bytes32", "name": "modelHash", "type": "bytes32" }
    ],
    "name": "InferenceRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "requestId", "type": "uint256" },
      { "indexed": false, "internalType": "bool", "name": "valid", "type": "bool" }
    ],
    "name": "InferenceSettled",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DISPUTE_WINDOW",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_STAKE",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_requestId", "type": "uint256" },
      { "internalType": "bytes", "name": "counterExample", "type": "bytes" }
    ],
    "name": "disputeInference",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_requestId", "type": "uint256" },
      { "internalType": "bytes", "name": "outputData", "type": "bytes" }
    ],
    "name": "postInference",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "requestId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "modelHash", "type": "bytes32" },
      { "internalType": "bytes", "name": "inputData", "type": "bytes" }
    ],
    "name": "requestInference",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "requests",
    "outputs": [
      { "internalType": "address", "name": "requester", "type": "address" },
      { "internalType": "address", "name": "prover", "type": "address" },
      { "internalType": "address", "name": "challenger", "type": "address" },
      { "internalType": "bytes32", "name": "modelHash", "type": "bytes32" },
      { "internalType": "bytes", "name": "inputData", "type": "bytes" },
      { "internalType": "bytes", "name": "outputData", "type": "bytes" },
      { "internalType": "uint256", "name": "stake", "type": "uint256" },
      { "internalType": "uint256", "name": "disputeWindow", "type": "uint256" },
      { "internalType": "bool", "name": "disputed", "type": "bool" },
      { "internalType": "bool", "name": "settled", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

async function main() {
  console.log("Sending inference request...");

  const provider = new ethers.providers.InfuraProvider("sepolia", process.env.INFURA_API_KEY);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

  const modelHash = ethers.utils.formatBytes32String("MyModelV1");
  const inputData = ethers.utils.toUtf8Bytes("sample input data");

  const tx = await contract.requestInference(modelHash, inputData, {
    value: ethers.utils.parseEther("0.01"), // Change this if needed based on MIN_STAKE
  });

  console.log("Waiting for confirmation...");
  await tx.wait();

  console.log("Inference requested successfully!");
  console.log("Tx hash:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
