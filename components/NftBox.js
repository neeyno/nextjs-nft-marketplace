import { useEffect, useState } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"
import styles from "../styles/Home.module.css"

import UpdateModal from "./UpdateModal"
import BuyModal from "./BuyModal"

import nftMarketplaceAbi from "../constants/NFTMarketplace.json"
import nftSampleAbi from "../constants/BasicNFT.json"

const formatString = (fullStr, strLenght) => {
    const space = " ... "
    const frontLen = Math.ceil(strLenght / 2)
    const backLen = Math.floor(strLenght / 2)
    const formatedStr =
        fullStr.substring(0, frontLen) + space + fullStr.substring(fullStr.length - backLen)
    return formatedStr
}

export default function NftBox({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescripton] = useState("")
    const [newValue, setNewValue] = useState("0.00666")

    const { isWeb3Enabled, account } = useMoralis()
    const isOwnedByUser = seller === account || seller === undefined
    const sellerAddress = isOwnedByUser ? "Me" : formatString(seller || "", 12)

    // Notifications
    const dispacth = useNotification()
    const handleUpdateSuccess = async (tx) => {
        await tx.wait(1)
        dispacth({
            type: "success",
            id: "notification",
            message: "Price updated successfully",
            title: "Price updated!",
            position: "bottomR",
        })
        setOpenUpdModal(false)
    }
    const handleBuyItemSuccess = async (tx) => {
        await tx.wait(1)
        dispacth({
            type: "success",
            id: "notification",
            message: "You've bought NFT successfully!",
            title: "NFT buy!",
            position: "bottomR",
        })
        setOpenBuyModal(false)
    }

    // Modals
    const [openUpdModal, setOpenUpdModal] = useState(false)
    const [openBuyModal, setOpenBuyModal] = useState(false)

    // get token URI of listed nft
    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftSampleAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId,
        },
    })

    // update listed nft with a new price
    async function handelPriceUpdate() {
        //await setNewValue(ethers.utils.parseEther(value))
        console.log("updating...", newValue.toString())
        await updatePrice({
            onError: (error) => console.log(error),
            onSuccess: handleUpdateSuccess,
        })
    }

    const { runContractFunction: updatePrice } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updatePrice",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
            newPrice: newValue || "9990000000000000",
        },
    })

    // buy picked nft
    async function handelBuyItem() {
        console.log("buying...", price.toString())
        await buyItem({
            onError: (error) => console.log(error),
            onSuccess: handleBuyItemSuccess,
        })
    }

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    })

    //
    async function updateUI() {
        const tokenURI = await getTokenURI()
        console.log(`TokenURI: ${tokenURI}`)
        if (tokenURI) {
            // IPFS gateway
            const requsetURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            const responseTokenURI = await (await fetch(requsetURL)).json()
            const imageURIres = responseTokenURI.image
            const imageURL = imageURIres.replace("ipfs://", "https://ipfs.io/ipfs/")
            console.log(`Image: ${imageURL}`)
            setImageURI(imageURL)
            setTokenName(responseTokenURI.name)
            setTokenDescripton(responseTokenURI.description)
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    /* 
        <return>
    */
    return (
        <div>
            {openUpdModal && (
                <div className={styles.modal}>
                    <UpdateModal
                        closeModal={setOpenUpdModal}
                        runUpdate={handelPriceUpdate}
                        setPrice={setNewValue}
                        tokenId={tokenId}
                        nftAddress={nftAddress}
                        oldPrice={ethers.utils.formatUnits(price, 18)}
                    />
                </div>
            )}
            {openBuyModal && (
                <div className={styles.modal}>
                    <BuyModal
                        closeModal={setOpenBuyModal}
                        runBuyItem={handelBuyItem}
                        tokenId={tokenId}
                        nftAddress={nftAddress}
                        price={ethers.utils.formatUnits(price, 18)}
                    />
                </div>
            )}

            {imageURI ? (
                <div
                    className={styles.content}
                    onClick={() => (isOwnedByUser ? setOpenUpdModal(true) : setOpenBuyModal(true))}
                >
                    <p className={styles.price}>{ethers.utils.formatUnits(price, 18)} Eth</p>
                    <p className={styles.owner}>Owned by {sellerAddress}</p>
                    <img src={imageURI} height="240" width="240"></img>
                    <p className={styles.title}>{tokenName}</p>
                    <p className={styles.description}>{tokenDescription}</p>
                </div>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    )
}
