// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ChemAwareRegistry
/// @notice Stores immutable, community-submitted chemical safety reports.
/// Only a hash of the full report (pinned on IPFS) is stored on-chain to
/// keep gas costs low while still allowing anyone to verify the off-chain
/// content matches what was originally submitted.
contract ChemAwareRegistry {
    struct Report {
        string productId;      // e.g. PubChem CID, OpenFDA id, or OFF barcode
        string productName;
        bytes32 reportHash;    // keccak256 hash of the full report JSON
        string ipfsCid;        // IPFS CID pointing to the full report JSON
        address submitter;
        uint256 timestamp;
        uint256 upvotes;
        uint256 flags;
    }

    Report[] private reports;

    // reportId => voter => whether they've already voted (prevents double voting)
    mapping(uint256 => mapping(address => bool)) private hasUpvoted;
    mapping(uint256 => mapping(address => bool)) private hasFlagged;

    // Prevents the exact same report content (by hash) from being submitted twice.
    mapping(bytes32 => bool) private hashSubmitted;

    event ReportSubmitted(
        uint256 indexed reportId,
        string productId,
        string productName,
        bytes32 reportHash,
        string ipfsCid,
        address indexed submitter,
        uint256 timestamp
    );

    event ReportUpvoted(uint256 indexed reportId, address indexed voter, uint256 newUpvoteCount);
    event ReportFlagged(uint256 indexed reportId, address indexed flagger, string reason, uint256 newFlagCount);

    error DuplicateReport();
    error InvalidReportId();
    error AlreadyVoted();
    error EmptyField();

    modifier validReportId(uint256 reportId) {
        if (reportId >= reports.length) revert InvalidReportId();
        _;
    }

    /// @notice Submits a new verified report. Reverts if the exact same
    /// report content (by hash) has already been submitted by anyone.
    function submitReport(
        string calldata productId,
        string calldata productName,
        bytes32 reportHash,
        string calldata ipfsCid
    ) external returns (uint256 reportId) {
        if (bytes(productId).length == 0 || bytes(productName).length == 0 || bytes(ipfsCid).length == 0) {
            revert EmptyField();
        }
        if (hashSubmitted[reportHash]) revert DuplicateReport();

        hashSubmitted[reportHash] = true;

        reports.push(
            Report({
                productId: productId,
                productName: productName,
                reportHash: reportHash,
                ipfsCid: ipfsCid,
                submitter: msg.sender,
                timestamp: block.timestamp,
                upvotes: 0,
                flags: 0
            })
        );

        reportId = reports.length - 1;

        emit ReportSubmitted(reportId, productId, productName, reportHash, ipfsCid, msg.sender, block.timestamp);
    }

    /// @notice Upvotes a report. Each address may upvote a given report once.
    function upvoteReport(uint256 reportId) external validReportId(reportId) {
        if (hasUpvoted[reportId][msg.sender]) revert AlreadyVoted();
        hasUpvoted[reportId][msg.sender] = true;
        reports[reportId].upvotes += 1;
        emit ReportUpvoted(reportId, msg.sender, reports[reportId].upvotes);
    }

    /// @notice Flags a report as potentially incorrect. Each address may flag once.
    function flagReport(uint256 reportId, string calldata reason) external validReportId(reportId) {
        if (hasFlagged[reportId][msg.sender]) revert AlreadyVoted();
        hasFlagged[reportId][msg.sender] = true;
        reports[reportId].flags += 1;
        emit ReportFlagged(reportId, msg.sender, reason, reports[reportId].flags);
    }

    function getReportCount() external view returns (uint256) {
        return reports.length;
    }

    function getReport(uint256 reportId) external view validReportId(reportId) returns (Report memory) {
        return reports[reportId];
    }

    /// @notice Returns whether `voter` has already upvoted `reportId` — lets
    /// the frontend disable the button instead of relying on a revert.
    function hasAddressUpvoted(uint256 reportId, address voter) external view returns (bool) {
        return hasUpvoted[reportId][voter];
    }

    function hasAddressFlagged(uint256 reportId, address voter) external view returns (bool) {
        return hasFlagged[reportId][voter];
    }
}
