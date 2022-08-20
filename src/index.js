import axios from "axios"
import { ethers } from "ethers"
import AMAZYABI from "./abiAmazy.js"
import { writeFileSync } from "fs"

const wsEndpoint = ""

const provider = new ethers.providers.WebSocketProvider(wsEndpoint)

const AMAZYCONTRACTADD = "0x70624F31d403b5a5505b9127663674fc1195C383"

const AmazyContract = new ethers.Contract(AMAZYCONTRACTADD, AMAZYABI, provider)

const buyFilter = AmazyContract.filters.Buy()

const getSneakerData = async (id) => {
  try {
    const { data } = await axios.get("https://rest.amazy.io/item/" + id)
    return data
  } catch (error) {
    return null
  }
}

// const getPastEvents = async () => {
//   const events = await AmazyContract.queryFilter(buyFilter, -20000, "latest")

//   const pricesAndIds = []
//   for (let ev of events) {
//     const data = await AmazyContract.sellInfo(ev.args[0].toNumber())
//     pricesAndIds.push({
//       id: data.tokenId.toNumber(),
//       price: parseFloat(ethers.utils.formatEther(ev.args[1].toString())),
//     })
//   }

//   const pricesAndSneakers = []

//   const results = await Promise.all(pricesAndIds.map((x) => getSneakerData(x.id)))

//   for (let res of results) {
//     if (res && res.type === "sneakers") {
//       pricesAndSneakers.push({
//         price: pricesAndIds.find((p) => p.id === res.tokenId).price,
//         metadata: res,
//       })
//     }
//   }

//   writeFileSync("./dump.json", JSON.stringify(pricesAndSneakers))
// }

// // getPastEvents()

const getLiveBuys = () => {
  provider.on(buyFilter, async (data) => {
    const buyId = new ethers.BigNumber.from(data.topics[1]).toNumber()
    const price = parseFloat(
      ethers.utils.formatEther(new ethers.BigNumber.from(data.topics[2]).toString())
    )

    const buyData = await AmazyContract.sellInfo(buyId)
    const tokenId = buyData.tokenId.toNumber()

    const metadata = await getSneakerData(tokenId)
    if (!metadata) return

    const result = {
      price,
      metadata,
      timestamp: Date.now(),
    }

    console.log(result)
  })
}

getLiveBuys()
