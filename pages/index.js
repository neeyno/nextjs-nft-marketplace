import styles from "../styles/Home.module.css"
import { useMoralisQuery, useMoralis } from "react-moralis"
import NftBox from "../components/NftBox"
import { useState, useEffect } from "react"

export default function Home() {
    const [ui, setUI] = useState(false)
    const { isWeb3Enabled, account } = useMoralis()

    let { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
        "ActiveItem",
        (query) => query.limit(8).descending("tokenId")
    )

    useEffect(() => {
        setUI(!ui)
    }, [isWeb3Enabled])

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
                <div className={styles.notWeb3}>
                    <div>Web3 not enabled.</div>
                    <div>Connect your wallet!</div>
                </div>
            )}
        </div>
    )
}
