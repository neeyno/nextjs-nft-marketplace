//
Moralis.Cloud.afterSave("ItemListed", async (request) => {
    const confirmed = request.object.get("confirmed")
    const logger = Moralis.Cloud.getLogger()
    logger.info("Looking for confirmed tx")
    if (confirmed) {
        logger.info("Found confirmed item!")
        const ActiveItem = Moralis.Object.extend("ActiveItem")

        // updating item
        const query = new Moralis.Query(ActiveItem)

        query.equalTo("marketplaceAddress", request.object.get("address"))
        query.equalTo("nftAddress", request.object.get("nftAddress"))
        query.equalTo("tokenId", request.object.get("tokenId"))
        query.equalTo("seller", request.object.get("seller"))
        //query.equalTo("price", request.object.get("price"))
        const alreadyListedItem = await query.first()
        if (alreadyListedItem) {
            logger.info(`Deleting already listed ${request.object.get("objectId")}`)
            await alreadyListedItem.destroy()
            logger.info(
                `Deleted item with tokenId ${request.object.get(
                    "tokenId"
                )} at address ${request.object.get("address")} since it's already been listed`
            )
        }

        // adding new item
        const activeItem = new ActiveItem()
        activeItem.set("marketplaceAddress", request.object.get("address"))
        activeItem.set("nftAddress", request.object.get("nftAddress"))
        activeItem.set("price", request.object.get("price"))
        activeItem.set("tokenId", request.object.get("tokenId"))
        activeItem.set("seller", request.object.get("seller"))

        logger.info(
            `Adding address: ${request.object.get("address")} Token Id: ${request.object.get(
                "tokenId"
            )}`
        )
        logger.info("Saving...")
        await activeItem.save()
    }
})

Moralis.Cloud.afterSave("ItemDelisted", async (request) => {
    const confirmed = request.object.get("confirmed")
    const logger = Moralis.Cloud.getLogger()
    logger.info(`Marketplace | Object: ${request.object}`)
    if (confirmed) {
        const ActiveItem = Moralis.Object.extend("ActiveItem")
        const query = new Moralis.Query(ActiveItem)

        query.equalTo("marketplaceAddress", request.object.get("address"))
        query.equalTo("nftAddress", request.object.get("nftAddress"))
        query.equalTo("tokenId", request.object.get("tokenId"))
        logger.info(`Marketplace | Query: ${query}`)

        const delistedItem = await query.first()
        logger.info(`Marketplace | DelistedItem: ${delistedItem}`)
        if (delistedItem) {
            logger.info(
                `Delisting tokenId ${request.object.get("tokenId")} at address ${request.object.get(
                    "address"
                )}`
            )
            await delistedItem.destroy()
        } else {
            logger.info(
                `No item found with address: ${request.object.get(
                    "address"
                )} and tokenId ${request.object.get("tokenId")}`
            )
        }
    }
})

Moralis.Cloud.afterSave("ItemBought", async (request) => {
    const confirmed = request.object.get("confirmed")
    const logger = Moralis.Cloud.getLogger()
    logger.info(`Marketplace | Object: ${request.object}`)
    if (confirmed) {
        const ActiveItem = Moralis.Object.extend("ActiveItem")
        const query = new Moralis.Query(ActiveItem)

        query.equalTo("marketplaceAddress", request.object.get("address"))
        query.equalTo("nftAddress", request.object.get("nftAddress"))
        query.equalTo("tokenId", request.object.get("tokenId"))
        logger.info(`Marketplace | Query: ${query}`)

        const boughtItem = await query.first()
        if (boughtItem) {
            logger.info(`Deleting ${request.object.get("objectId")})}`)
            await boughtItem.destroy()
            logger.info(
                `Deleting tokenId ${request.object.get("tokenId")} at address ${request.object.get(
                    "address"
                )}`
            )
        } else {
            logger.info(
                `No item found with address: ${request.object.get(
                    "address"
                )} and tokenId ${request.object.get("tokenId")}`
            )
        }
    }
})
