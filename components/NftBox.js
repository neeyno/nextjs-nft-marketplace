import { useEffect, useState } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import { ethers } from "ethers"

import styles from "../styles/Home.module.css"
import UpdateModal from "../components/UpdateModal"

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
    const [newPrice, setNewPrice] = useState(price || 0)

    const { isWeb3Enabled, account } = useMoralis()
    const isOwnedByUser = seller === account || seller === undefined
    const sellerAddress = isOwnedByUser ? "Me" : formatString(seller || "", 12)

    // Modal
    const [openUpdModal, setOpenUpdModal] = useState(false)

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
    function updatePriceHandler(value) {
        const priceEth = ethers.utils.parseEther(value)
        setNewPrice(priceEth)
        updatePrice()
        console.log("updating...", priceEth, tokenId)
        setOpenUpdModal(false)
    }

    const { runContractFunction: updatePrice } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updatePrice",
        params: {
            nftAddress,
            tokenId,
            newPrice, // new value
        },
    })

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

    return (
        <div>
            {openUpdModal && (
                <div className={styles.modal}>
                    <UpdateModal
                        closeModal={setOpenUpdModal}
                        runUpdate={updatePriceHandler}
                        tokenId={tokenId}
                        nftAddress={nftAddress}
                        oldPrice={ethers.utils.formatUnits(price, 18)}
                    />
                </div>
            )}

            {imageURI ? (
                <div
                    className={styles.content}
                    onClick={() => (isOwnedByUser ? setOpenUpdModal(true) : console.log("buy nft"))}
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
