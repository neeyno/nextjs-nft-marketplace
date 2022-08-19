import styles from "../styles/Home.module.css"
import { useMoralisQuery, useMoralis } from "react-moralis"
import NftBox from "../components/NftBox"

export default function Home() {
    const { isWeb3Enabled, account } = useMoralis()
    const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
        "ActiveItem",
        (query) => query.limit(8).descending("tokenId")
    )
    //console.log(listedNfts)

    return (
        <div className={styles.container}>
            {isWeb3Enabled ? (
                fetchingListedNfts ? (
                    <div className={styles.disabled}>Loading...</div>
                ) : (
                    listedNfts.map((item, i) => {
                        console.log(item.attributes)
                        const { price, nftAddress, tokenId, marketplaceAddress, seller } =
                            item.attributes
                        return (
                            <div className={styles.card} key={i}>
                                <NftBox
                                    price={price}
                                    nftAddress={nftAddress}
                                    tokenId={tokenId}
                                    marketplaceAddress={marketplaceAddress}
                                    seller={seller}
                                    key={`${i}_${nftAddress}_${tokenId}`}
                                />
                            </div>
                        )
                    })
                )
            ) : (
                <div className={styles.disabled}>
                    <div>Web3 isn't enabled.</div>
                    <div>Connect your wallet!</div>
                </div>
            )}
        </div>
    )
}
