import { useState, useEffect } from "react";
import { BigNumber, ethers } from "ethers";
import UsdcArtifact from "../utils/USDCToken.json";
import JoeArtifact from "../utils/USDCToken.json";
import AmmArtifact from "../utils/AMM.json";
import { USDCToken as UsdcContractType } from "../typechain-types";
import { JOEToken as JoeContractType } from "../typechain-types";
import { AMM as AmmContractType } from "../typechain-types";
import { getEthereum } from "../utils/ethereum";

export const UsdcAddress = "0x5670E800F66E7b655eAC3A542Bf9d91Ec4e063FE";
export const JoeAddress = "0x0b4494166cc8ac37f2891522a4b52Cd380f0f61b";
export const AmmAddress = "0x720E7F67a49c756458141aBa966A1524B1Ed387C";

export type TokenType = {
  symbol: string;
  contract: UsdcContractType | JoeContractType;
};

export type AmmType = {
  sharePrecision: BigNumber;
  contract: AmmContractType;
};

type ReturnUseContract = {
  usdc: TokenType | undefined;
  joe: TokenType | undefined;
  amm: AmmType | undefined;
};

export const useContract = (
  currentAccount: string | undefined
): ReturnUseContract => {
  const [usdc, setUsdc] = useState<TokenType>();
  const [joe, setJoe] = useState<TokenType>();
  const [amm, setAmm] = useState<AmmType>();
  const ethereum = getEthereum();

  const getContract = (
    contractAddress: string,
    abi: ethers.ContractInterface,
    storeContract: (_: ethers.Contract) => void
  ) => {
    if (!ethereum) {
      console.log("Ethereum object doesn't exist!");
      return;
    }
    if (!currentAccount) {
      // ログインしていない状態でコントラクトの関数を呼び出すと失敗するため
      // currentAccountがundefinedの場合はcontractオブジェクトもundefinedにします。
      console.log("currentAccount doesn't exist!");
      return;
    }
    try {
      // @ts-ignore: ethereum as ethers.providers.ExternalProvider
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner(); // 簡易実装のため, 引数なし = 初めのアカウント(account#0)を使用する
      const Contract = new ethers.Contract(contractAddress, abi, signer);
      storeContract(Contract);
    } catch (error) {
      console.log(error);
    }
  };

  const generateUsdc = async (contract: UsdcContractType) => {
    try {
      const symbol = await contract.symbol();
      setUsdc({ symbol: symbol, contract: contract } as TokenType);
    } catch (error) {
      console.log(error);
    }
  };

  const generateJoe = async (contract: UsdcContractType) => {
    try {
      const symbol = await contract.symbol();
      setJoe({ symbol: symbol, contract: contract } as TokenType);
    } catch (error) {
      console.log(error);
    }
  };

  const generateAmm = async (contract: AmmContractType) => {
    try {
      const precision = await contract.PRECISION();
      setAmm({ sharePrecision: precision, contract: contract } as AmmType);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getContract(UsdcAddress, UsdcArtifact.abi, (Contract: ethers.Contract) => {
      generateUsdc(Contract as UsdcContractType);
    });
    getContract(JoeAddress, JoeArtifact.abi, (Contract: ethers.Contract) => {
      generateJoe(Contract as JoeContractType);
    });
    getContract(AmmAddress, AmmArtifact.abi, (Contract: ethers.Contract) => {
      generateAmm(Contract as AmmContractType);
    });
  }, [ethereum, currentAccount]);

  return {
    usdc,
    joe,
    amm,
  };
};