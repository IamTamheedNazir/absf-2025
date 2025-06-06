// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OptimisticOracle {
    struct InferenceRequest {
        address requester;
        address prover;
        address challenger;
        bytes32 modelHash;
        bytes inputData;
        bytes outputData;
        uint256 stake;
        uint256 disputeWindow;
        bool disputed;
        bool settled;
    }

    mapping(uint256 => InferenceRequest) public requests;
    uint256 public requestId;
    uint256 public constant DISPUTE_WINDOW = 120; // seconds
    uint256 public constant MIN_STAKE = 0.1 ether;

    event InferenceRequested(uint256 indexed requestId, address indexed requester, bytes32 modelHash);
    event InferencePosted(uint256 indexed requestId, address indexed prover, bytes outputData);
    event InferenceDisputed(uint256 indexed requestId, address indexed challenger);
    event InferenceSettled(uint256 indexed requestId, bool valid);

    function requestInference(bytes32 modelHash, bytes memory inputData) external payable returns (uint256) {
        require(msg.value >= MIN_STAKE, "Insufficient stake");

        requestId++;
        requests[requestId] = InferenceRequest({
            requester: msg.sender,
            prover: address(0),
            challenger: address(0),
            modelHash: modelHash,
            inputData: inputData,
            outputData: "",
            stake: msg.value,
            disputeWindow: block.timestamp + DISPUTE_WINDOW,
            disputed: false,
            settled: false
        });

        emit InferenceRequested(requestId, msg.sender, modelHash);
        return requestId;
    }

    function postInference(uint256 _requestId, bytes memory outputData) external {
        InferenceRequest storage req = requests[_requestId];
        require(block.timestamp <= req.disputeWindow, "Dispute window closed");
        require(req.outputData.length == 0, "Output already posted");
        require(msg.sender != req.requester, "Requester cannot post inference");
        require(!req.settled, "Already settled");

        req.outputData = outputData;
        req.prover = msg.sender;

        emit InferencePosted(_requestId, msg.sender, outputData);
    }

    function disputeInference(uint256 _requestId, bytes memory counterExample) external payable {
        InferenceRequest storage req = requests[_requestId];
        require(block.timestamp <= req.disputeWindow, "Dispute window closed");
        require(msg.value >= req.stake, "Insufficient challenger stake");
        require(!req.disputed, "Already disputed");
        require(!req.settled, "Already settled");

        req.disputed = true;
        req.challenger = msg.sender;

        emit InferenceDisputed(_requestId, msg.sender);

        // Simplified verification
        bool valid = verifyCounterExample(counterExample);
        settleInference(_requestId, valid);
    }

    function settleInference(uint256 _requestId, bool valid) internal {
        InferenceRequest storage req = requests[_requestId];
        require(!req.settled, "Already settled");
        req.settled = true;

        uint256 totalStake = req.stake * 2;

        if (valid) {
            // Reward requester (inference is correct)
            payable(req.requester).transfer(totalStake);
        } else {
            // Reward challenger (inference is incorrect)
            payable(req.challenger).transfer(totalStake);
        }

        emit InferenceSettled(_requestId, valid);
    }

    function verifyCounterExample(bytes memory counterExample) internal pure returns (bool) {
        // Replace this logic with a real fraud-proof system (zkSNARKs, etc.)
        return keccak256(counterExample) != keccak256(abi.encode("invalid"));
    }
}
