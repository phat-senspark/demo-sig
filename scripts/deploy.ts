// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers } from "hardhat";

export const deployDemoSig = async (deployer:SignerWithAddress): Promise<Contract> =>{
    const DemoSigArtifact = await ethers.getContractFactory("DemoSig", deployer);
    const demoSigInstance = await DemoSigArtifact.deploy();
    await demoSigInstance.deployed();
    console.log("Successfully deploy DemoSig at: ", demoSigInstance.address);
    return demoSigInstance;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.