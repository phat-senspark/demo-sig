//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DemoSig is EIP712, Ownable, AccessControl{
    string private constant SIGNING_DOMAIN = "DEMO-SIG";
    string private constant SIGNATURE_VERSION = "1";

    mapping(address => mapping(uint256 => bool)) public usedNonces;
    
    struct VerifyData {
        address redeemer;
        uint256 a;
        string b;
        bool c;
        uint256 nonce;
        bytes signature; 
    }   

    constructor()  EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION)
    {
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override (AccessControl) returns (bool) {
        return AccessControl.supportsInterface(interfaceId);
    }

    function verifyV1(uint256 a, string memory b, bool c, uint256 nonce, bytes memory signature) public returns (bool)  {
        require(!usedNonces[msg.sender][nonce], "Nonce has used");
        usedNonces[msg.sender][nonce] = true;
        bytes32 rawMessage = keccak256(abi.encodePacked(msg.sender, a,b,c,nonce,address(this)));
        bytes memory s =  abi.encodePacked(rawMessage);
        bytes32 message = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n",Strings.toString(s.length),s));
        require(isValidAccessMessage(message, signature),"Message isn't correct");
        console.log("here");
        return true;
    }

    function splitSignature(bytes memory sig)internal pure returns(uint8 v, bytes32 r, bytes32 s) {
        require(sig.length == 65, "Signature isn't validate");

        assembly {
            // first 32 bytes, after the length prefix.
            r := mload(add(sig, 32))
            // second 32 bytes.
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes).
            v := byte(0, mload(add(sig, 96)))
        }
        return (v,r,s);
    }


    function isValidAccessMessage(bytes32 message, bytes memory signature) public view returns (bool){
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);
        return ecrecover(message,v,r,s) == owner();
    }

    function verifyVer2(VerifyData calldata data) public view returns (bool) {
        address signer = _verify(data);
        require(signer == owner(), "Signature invalid");
        return true;
    }

    function _hash(VerifyData calldata data) internal view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
        keccak256("VerifyData(address redeemer,uint256 a,string b,bool c,uint256 nonce)"),
        msg.sender,
        data.a,
        keccak256(bytes(data.b)),
        data.c,
        data.nonce
        )));
    }

    function _verify(VerifyData calldata data) internal view returns (address) {
        bytes32 digest = _hash(data);
        return ECDSA.recover(digest, data.signature);
    }  

}
