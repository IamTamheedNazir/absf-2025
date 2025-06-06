
#!/usr/bin/env python3
import time
import numpy as np
from web3 import Web3

RPC_URL = "YOUR_POLYGON_RPC_URL"
PRIVATE_KEY = "YOUR_PRIVATE_KEY"
CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS"

STAKE_AMOUNT = Web3.to_wei(0.1, 'ether')

def run_tests():
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    if not w3.is_connected():
        raise Exception("Web3 connection failed. Check RPC URL.")
    account = w3.eth.account.from_key(PRIVATE_KEY)
    address = account.address

    contract_abi = []  # Replace with actual ABI
    contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=contract_abi)

    request_latencies = []
    request_gas = []
    answer_latencies = []
    answer_gas = []

    nonce = w3.eth.get_transaction_count(address)
    for i in range(100):
        tx_req = contract.functions.requestInference(b"TestInputData").build_transaction({
            'from': address,
            'value': STAKE_AMOUNT,
            'gas': 300000,
            'gasPrice': w3.eth.gas_price,
            'nonce': nonce
        })
        signed_req = account.sign_transaction(tx_req)
        start_req = time.time()
        tx_hash_req = w3.eth.send_raw_transaction(signed_req.raw_transaction)
        receipt_req = w3.eth.wait_for_transaction_receipt(tx_hash_req)
        end_req = time.time()
        request_latencies.append(end_req - start_req)
        request_gas.append(receipt_req.gas_used)
        nonce += 1

        tx_ans = contract.functions.submitAnswer(i, b"TestOutputData").build_transaction({
            'from': address,
            'value': STAKE_AMOUNT,
            'gas': 300000,
            'gasPrice': w3.eth.gas_price,
            'nonce': nonce
        })
        signed_ans = account.sign_transaction(tx_ans)
        start_ans = time.time()
        tx_hash_ans = w3.eth.send_raw_transaction(signed_ans.raw_transaction)
        receipt_ans = w3.eth.wait_for_transaction_receipt(tx_hash_ans)
        end_ans = time.time()
        answer_latencies.append(end_ans - start_ans)
        answer_gas.append(receipt_ans.gas_used)
        nonce += 1

    print("Request Gas: min {:.0f}, max {:.0f}, avg {:.0f}".format(
        np.min(request_gas), np.max(request_gas), np.mean(request_gas)))
    print("Answer Gas: min {:.0f}, max {:.0f}, avg {:.0f}".format(
        np.min(answer_gas), np.max(answer_gas), np.mean(answer_gas)))
    print("Request Latency (s): min {:.2f}, max {:.2f}, avg {:.2f}".format(
        np.min(request_latencies), np.max(request_latencies), np.mean(request_latencies)))
    print("Answer Latency (s): min {:.2f}, max {:.2f}, avg {:.2f}".format(
        np.min(answer_latencies), np.max(answer_latencies), np.mean(answer_latencies)))

if __name__ == "__main__":
    run_tests()
