const Moralis = require("moralis/node")
require("dotenv").config()

const contractAdressesFile = require("./constants/contractAddresses.json")
const abiFile = require("./constants/NFTMarketplace.json")

let chainId = process.env.chainId || 31337
let moralisChainId = chainId == "31337" ? "1337" : chainId
const contractAdress = contractAdressesFile[chainId]["NFTMarketplace"][0]

const appId = process.env.NEXT_PUBLIC_MORALIS_APP_ID
const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL
const masterKey = process.env.masterKey

async function main() {
    await Moralis.start({ serverUrl, appId, masterKey })
    console.log(`Contract address: ${contractAdress}`)

    let optionsItemListed = {
        chainId: moralisChainId,
        sync_historical: true,
        // NFTMarketplace contract
        address: contractAdress,
        topic: "ItemListed(address, address, uint256, uint256)",
        abi: abiFile[12],
        tableName: "ItemListed",
    }

    let optionsItemBought = {
        chainId: moralisChainId,
        sync_historical: true,
        // NFTMarketplace contract
        address: contractAdress,
        topic: "ItemBought(address, address, uint256, uint256)",
        abi: abiFile[10],
        tableName: "ItemBought",
    }

    let optionsItemDelisted = {
        chainId: moralisChainId,
        sync_historical: true,
        // NFTMarketplace contract
        address: contractAdress,
        topic: "ItemDelisted(address, address, uint256)",
        abi: abiFile[11],
        tableName: "ItemDelisted",
    }

    const listedResponse = await Moralis.Cloud.run("watchContractEvent", optionsItemListed, {
        useMasterKey: true,
    })
    const boughtResponse = await Moralis.Cloud.run("watchContractEvent", optionsItemBought, {
        useMasterKey: true,
    })
    const delistedResponse = await Moralis.Cloud.run("watchContractEvent", optionsItemDelisted, {
        useMasterKey: true,
    })

    if (listedResponse.success && boughtResponse.success && delistedResponse.success) {
        console.log("Database updated successfully!")
    } else {
        console.log("Something went wrong!")
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
