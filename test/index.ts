import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { deployDemoSig } from "../scripts/deploy";
import { hashMessage } from "../utils/hashMessage";
import { Auth, genSignature } from "../utils/signData";

let deployer :SignerWithAddress
let user: SignerWithAddress;
let DemoSigContract: Contract
describe("Greeter",  () =>  {
  beforeEach(async ()=>{
    [deployer,user ]= await ethers.getSigners();
    DemoSigContract = await deployDemoSig(deployer);
  });

  it("Test with verify signature classic version", async ()=>{
    // Sign message 
    const nonceUser = await user.getTransactionCount();
    const types = ["address", "uint256", "string", "bool", "uint256", "address"];
    const values = [user.address, ethers.utils.parseEther("10"), "Signed", true, nonceUser, DemoSigContract.address];
    const message = hashMessage(types,values);
    const signature = await deployer.signMessage(ethers.utils.arrayify(message));

    const status = await DemoSigContract.connect(user).verifyV1(ethers.utils.parseEther("10"), "Signed", true,nonceUser, signature);
    // console.log("status: ", status);
  });
  it("Test with verify signature new version", async ()=>{
    // Generate data
    const nonceUser = await user.getTransactionCount();
    const auth: Auth = {
      signer: deployer,
      contract: DemoSigContract.address
    }
    const types = {
      VerifyData: [
        {name: "redeemer", type: "address"},
        {name: "a", type: "uint256"},
        {name: "b", type: "string"},
        {name: "c", type: "bool"},
        {name: "nonce", type: "uint256"}
      ]
    };
    
    const voucher = {
      redeemer: user.address,
      a: ethers.utils.parseEther("10"),
      b: "Signed",
      c: true,
      nonce: nonceUser
    }

    const siganture = await genSignature(types,voucher, auth);
    const status = await DemoSigContract.connect(user).verifyVer2(siganture);
    console.log("status", status);

  })
});
