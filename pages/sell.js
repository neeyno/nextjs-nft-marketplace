import styles from "../styles/Sell.module.css"

import { useState, useEffect } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useNotification } from "web3uikit"
import { ethers } from "ethers"

import nftMarketplaceAbi from "../constants/NFTMarketplace.json"
//import nftSampleAbi from "../constants/BasicNFT.json"
import contractAddresses from "../constants/contractAddresses.json"
import { getContractAbi } from "../constants/getContractAbi"

//const apiKey = process.env.etherscan_apiKey

export default function Sell() {
    const { isWeb3Enabled, account, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex).toString() || "31337"
    //parseInt(chainIdHex).toString() === "1337" ? "31337" : parseInt(chainIdHex).toString()
    const marketplaceAddress =
        chainId in contractAddresses ? contractAddresses[chainId]["NFTMarketplace"][0] : null

    const [proceeds, setProceeds] = useState("")
    const [listData, setListData] = useState({
        nftAddress: "",
        tokenId: "",
        price: "",
    })

    const { runContractFunction } = useWeb3Contract()
    const dispacth = useNotification()

    function handleClick(event) {
        const { name, value } = event.target
        //name != "nftAddress" && value < 0 ? (value = "") : value
        setListData((prevData) => {
            return {
                ...prevData,
                [name]: value,
                //[name]: (name==="price" ? ethers.utils.parseEther(value) : value),
            }
        })
    }

    async function handleSellItemClick() {
        const nftAbi = await getContractAbi(chainId, listData.nftAddress)
        console.log("Approving...")
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
        console.log("Listing...")
        const listItemParams = {
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
            params: listItemParams,
            onSuccess: handleListSuccess,
            onError: (error) => {
                console.log(error)
            },
        })
    }

    async function handleListSuccess(tx) {
        await tx.wait(1)
        dispacth({
            type: "success",
            id: "notification",
            message: " listed successfully!",
            title: "NFT",
            position: "bottomR",
        })
    }

    async function handleWithdraw() {
        const withdrawPrams = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "withdrawProceeds",
            params: {},
        }

        await runContractFunction({
            params: withdrawPrams,
            onSuccess: handleWithdrawSuccess,
            onError: (error) => {
                console.log(error)
            },
        })
    }

    async function handleWithdrawSuccess(tx) {
        await tx.wait(1)
        dispacth({
            type: "success",
            id: "notification",
            message: " withdrawn successfully!",
            title: "Proceeds ",
            position: "bottomR",
        })
        await updateBalance()
    }

    async function updateBalance() {
        const getProceedsPrams = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "getProceeds",
            params: {
                seller: account,
            },
        }
        const balance = await runContractFunction({
            params: getProceedsPrams,
            onSuccess: console.log("getProceeds Success"),
            onError: (error) => {
                console.log(error)
            },
        })
        const balanceInEth = ethers.utils.formatUnits(balance, 18)
        setProceeds(() => balanceInEth)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateBalance()
        }
    }, [isWeb3Enabled])

    return (
        <div className={styles.container}>
            {isWeb3Enabled ? (
                <div className={styles.box}>
                    <div className={styles.sell_form}>
                        <div className={styles.head}>
                            <div>Sell NFT</div>
                        </div>
                        <div className={styles.main}>
                            <div>1. Approve token to the marketpalce </div>
                            <div className={styles.approve}>
                                <div>Marketpalce contract address</div>
                                <span>{marketplaceAddress}</span>
                            </div>
                            <hr />
                            <div>2. Specify listing requirements</div>
                            <div className={styles.nftAddress}>
                                <div>NFT contract address</div>
                                <input
                                    id={"nftAddress"}
                                    placeholder="0xe7f1..."
                                    type="text"
                                    name="nftAddress"
                                    value={listData.nftAddress}
                                    onChange={handleClick}
                                />
                            </div>
                            <div className={styles.tokenId}>
                                <div>Token ID</div>
                                <input
                                    id={"tokenId"}
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    name="tokenId"
                                    value={listData.tokenId}
                                    onChange={handleClick}
                                />
                            </div>
                            <div className={styles.price_input}>
                                <div>Price in Eth</div>
                                <input
                                    id={"price"}
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    placeholder="0.0"
                                    name="price"
                                    value={listData.price}
                                    onChange={handleClick}
                                />
                                <label>Eth</label>
                            </div>
                            <hr />
                            <button
                                className={styles.sell_btn}
                                onClick={() => handleSellItemClick()}
                            >
                                Approve and List
                            </button>
                        </div>
                    </div>
                    <div className={styles.withdraw}>
                        <div className={styles.head}>
                            <div>Withdraw proceeds</div>
                        </div>
                        <div className={styles.main}>
                            <div className={styles.proceeds}>
                                <div>Your current proceeds</div>
                                <span> {proceeds} Eth</span>
                            </div>
                            <hr />
                            <button
                                className={styles.withdraw_btn}
                                onClick={() => handleWithdraw()}
                            >
                                Withdraw
                            </button>
                        </div>
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

// async function getContractAbi() {
//     let contractAbi = nftSampleAbi
//     if (chainId != "31337") {
//         const networks = {
//             1: "api", //Mainnet
//             4: "api-rinkeby",
//         }
//         const url = `https://${networks[chainId]}.etherscan.io/api?module=contract&action=getabi&address=${listData.nftAddress}` //&apikey=${apiKey}
//         await fetch(url)
//             .then((data) => {
//                 return data.json()
//             })
//             .then((response) => {
//                 contractAbi = response.result
//             })
//             .catch((error) => console.log(error))
//     }
//     return contractAbi
// }
