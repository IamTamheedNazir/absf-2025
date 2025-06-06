require("dotenv").config();
const { ethers } = require("hardhat");

const CONTRACT_ADDRESS = "0x8a2e85e49dae43832acd42c6464a5bddcec135e0";

const ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "modelHash", "type": "bytes32" },
      { "internalType": "bytes", "name": "inputData", "type": "bytes" }
    ],
    "name": "requestInference",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  }
];

async function main() {
  console.log("Sending new inference request...");

  const provider = new ethers.providers.InfuraProvider("sepolia", process.env.INFURA_API_KEY);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

  const modelHash = ethers.utils.formatBytes32String("demo-model");
  const inputText = "Hello from VS Code!";
  const inputData = ethers.utils.toUtf8Bytes(inputText);

  const tx = await contract.requestInference(modelHash, inputData, {
    value: ethers.utils.parseEther("0.01") // Minimum stake
  });

  console.log("Transaction submitted. Hash:", tx.hash);
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
