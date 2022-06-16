import { ethers } from "ethers"

export const hashMessage = (types: Array<string>, values: Array<any> )=>{
    return ethers.utils.solidityKeccak256(types,values)
}