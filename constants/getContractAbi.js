import nftSampleAbi from "./BasicNFT.json"

const getContractAbi = async (chainId, nftAddress) => {
    console.log("network:", chainId)
    let contractAbi = nftSampleAbi
    if (chainId != "31337") {
        const networks = {
            1: "api", //Mainnet
            4: "api-rinkeby",
        }
        const url = `https://${networks[chainId]}.etherscan.io/api?module=contract&action=getabi&address=${nftAddress}` //&apikey=${apiKey}
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

module.exports = { getContractAbi }
