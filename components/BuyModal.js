import { useEffect, useState } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import styles from "../styles/Buy.module.css"
import { ethers } from "ethers"

export default function BuyModal({ nftAddress, tokenId, price, closeModal, runBuyItem }) {
    return (
        <div className={styles.buy_layout}>
            <div className={styles.head}>
                <div>Buy NFT</div>
                <button className={styles.close_btn} onClick={() => closeModal(false)}>
                    X
                </button>
            </div>
            <div className={styles.main}>
                <div className={styles.nftAddress}>
                    <div>NFT contract address</div>
                    <span>{nftAddress}</span>
                </div>
                <div className={styles.tokenId}>
                    <div>Token ID</div>
                    <span>{tokenId}</span>
                </div>
                <div className={styles.price}>
                    <div>Price</div>
                    <span>{price} Eth</span>
                </div>
                <hr />
                <button className={styles.buy_btn} onClick={() => runBuyItem(false)}>
                    Buy
                </button>
            </div>
        </div>
    )
}
