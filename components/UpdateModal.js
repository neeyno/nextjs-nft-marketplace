import { useEffect, useState } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import styles from "../styles/Update.module.css"
import { ethers } from "ethers"

export default function UpdateModal({ nftAddress, tokenId, oldPrice, closeModal, runUpdate }) {
    const [price, setPrice] = useState(oldPrice || 0)

    return (
        <div className={styles.update}>
            <div className={styles.box}>
                <div>Update price</div>
                <button className={styles.close_btn} onClick={() => closeModal(false)}>
                    X
                </button>
                <div>{nftAddress}</div>
                <div>{tokenId}</div>
                <input
                    id={"upd-input"}
                    type="number"
                    value={price}
                    onInput={(e) => setPrice(e.target.value)}
                />
                <button className={styles.close_btn} onClick={() => runUpdate(price)}>
                    Update
                </button>
            </div>
        </div>
    )
}
