import styles from "../styles/Sell.module.css"

import { useState, useEffect } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useNotification } from "web3uikit"
import { ethers } from "ethers"

import nftMarketplaceAbi from "../constants/NFTMarketplace.json"
import nftSampleAbi from "../constants/BasicNFT.json"
import contractAddresses from "../constants/contractAddresses.json"

//const apiKey = process.env.etherscan_apiKey

export default function Sell() {
    const { isWeb3Enabled, account, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex).toString()
    //parseInt(chainIdHex).toString() === "1337" ? "31337" : parseInt(chainIdHex).toString()
    const marketplaceAddress =
        chainId in contractAddresses ? contractAddresses[chainId]["NFTMarketplace"][0] : "31337"

    const [listData, setListData] = useState({
        nftAddress: "",
        tokenId: "",
        price: "",
    })

    const { runContractFunction } = useWeb3Contract()

    // const { runContractFunction: listItem } = useWeb3Contract({
    //     abi: nftMarketplaceAbi,
    //     contractAddress: marketplaceAddress,
    //     functionName: "listItem",
    //     params: {
    //         nftAddress: listData.nftAddress,
    //         tokenId: listData.tokenId,
    //         price: ethers.utils.parseEther(listData.price ? listData.price : "0"),
    //     },
    // })

    // const { runContractFunction: approve } = useWeb3Contract({
    //     abi: nftSampleAbi, // getContractAbi(),
    //     contractAddress: listData.nftAddress,
    //     functionName: "approve",
    //     params: {
    //         to: marketplaceAddress,
    //         tokenId: listData.tokenId,
    //     },
    // })

    function handleClick(event) {
        const { name, value } = event.target
        setListData((prevData) => {
            return {
                ...prevData,
                [name]: value,
                //[name]: (name==="price" ? ethers.utils.parseEther(value) : value),
            }
        })
    }

    async function handleSellItemClick() {
        const nftAbi = await getContractAbi()
        const approveParams = {
            abi: nftAbi,
            contractAddress: listData.nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: listData.tokenId,
            },
        }
        await runContractFunction({
            params: approveParams,
            onSuccess: () => handleApproveSuccess(),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    async function handleApproveSuccess() {
        const listItemPrams = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: listData.nftAddress,
                tokenId: listData.tokenId,
                price: ethers.utils.parseEther(listData.price ? listData.price : "0"),
            },
        }

        await runContractFunction({
            params: listItemPrams,
            onSuccess: () => console.log("listed"),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    async function getContractAbi() {
        let contractAbi = nftSampleAbi
        if (chainId != "31337") {
            const networks = {
                1: "api", //Mainnet
                4: "api-rinkeby",
            }
            const url = `https://${networks[chainId]}.etherscan.io/api?module=contract&action=getabi&address=${listData.nftAddress}` //&apikey=${apiKey}
            await fetch(url)
                .then((data) => {
                    return data.json()
                })
                .then((response) => {
                    contractAbi = response.result
                })
                .catch((error) => console.log(error))
        }
        return contractAbi
    }

    return (
        <div className={styles.container}>
            {isWeb3Enabled ? (
                <div className={styles.box}>
                    <div className={styles.sell_form}>
                        <div>List NFT</div>
                        <input
                            id={"nftAddress"}
                            placeholder="type NFT contract address"
                            type="text"
                            name="nftAddress"
                            value={listData.nftAddress}
                            onChange={handleClick}
                        />
                        <input
                            id={"tokenId"}
                            type="number"
                            placeholder="type NFT token Id"
                            name="tokenId"
                            value={listData.tokenId}
                            onChange={handleClick}
                        />
                        <input
                            id={"price"}
                            type="number"
                            placeholder="type Price Value in ETH"
                            name="price"
                            value={listData.price}
                            onChange={handleClick}
                        />
                        <button className={styles.list_btn} onClick={() => handleSellItemClick()}>
                            Sell NFT
                        </button>
                    </div>
                    <div className={styles.withdraw}>
                        <div>Withdraw proceedes</div>
                        <div>balance</div>
                        <button
                        //className={styles.close_btn}
                        //onClick={() => runUpdate()}
                        >
                            Withdraw
                        </button>
                    </div>
                </div>
            ) : (
                <div className={styles.notWeb3}>
                    <div>Web3 not enabled.</div>
                    <div>Connect your wallet!</div>
                </div>
            )}
        </div>
    )
}
