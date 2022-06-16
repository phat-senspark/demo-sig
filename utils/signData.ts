import hre from "hardhat" 

const SIGNING_DOMAIN = "DEMO-SIG";
const SIGNATURE_VERSION = "1";

export interface Auth {
    signer: any;
    contract: string;
  }

export const genSignature = async (types: any, voucher: any, auth: Auth) => {
    const domain = {
      name: SIGNING_DOMAIN,
      version: SIGNATURE_VERSION,
      verifyingContract: auth.contract,
      chainId: hre.network.config.chainId
    };
    const signature = await auth.signer._signTypedData(domain, types, voucher);
  
    return {
      ...voucher,
      signature,
    };
  };