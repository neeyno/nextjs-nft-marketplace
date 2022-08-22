import { useEffect, useState } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import styles from "../styles/Update.module.css"
import { ethers } from "ethers"

export default function UpdateModal({
    nftAddress,
    tokenId,
    oldPrice,
    closeModal,
    runUpdate,
    setPrice,
}) {
    //const [price, setPrice] = useState(oldPrice || "0")
    let valueToUpdate = oldPrice

    function handleChange(event) {
        const { value } = event.target
        setPrice(() => ethers.utils.parseEther(value ? value : "0"))
    }

    return (
        <div className={styles.update}>
            <div>Update price</div>
            <button className={styles.close_btn} onClick={() => closeModal(false)}>
                X
            </button>
            <div>{nftAddress}</div>
            <div>{tokenId}</div>
            <input
                id={"upd-input"}
                type="number"
                min="0"
                name="update"
                placeholder={oldPrice}
                onChange={handleChange}
            />
            <button className={styles.close_btn} onClick={() => runUpdate()}>
                Update
            </button>
        </div>
    )
}
