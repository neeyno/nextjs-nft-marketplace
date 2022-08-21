import { useEffect, useState } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import styles from "../styles/Buy.module.css"
import { ethers } from "ethers"

export default function BuyModal({ nftAddress, tokenId, price, closeModal, runBuyItem }) {
    return (
        <div className={styles.buy_layout}>
            <div>Buy item</div>
            <button className={styles.close_btn} onClick={() => closeModal(false)}>
                X
            </button>
            <div>info</div>
            <button className={styles.close_btn} onClick={() => runBuyItem(false)}>
                buy
            </button>
        </div>
    )
}
