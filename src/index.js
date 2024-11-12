import { ethers } from "ethers"
import { abi, contractAddress } from "../constants"
const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum != "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        connectButton.innerHTML = "Connected!"
    } else {
        connectButton.innerHTML = "Please install Metamask"
    }
}

async function getBalance() {
    if (typeof window.ethereum != "undefinded") {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.formatEther(balance))
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum) //Connects to a provider, in this case Metamask
        const signer = await provider.getSigner() //Return whichever wallet is connected to the provider
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.parseEther(ethAmount),
            })
            //Listen for the tx to be mined
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    return new Promise((resolve, reject) => {
        //the reason we are returning a promise is because we are creating a listener for this promise
        //listen for a transaction to finish
        provider.once(transactionResponse.hash, async (transactionReceipt) => {
            console.log(
                `Completed with ${await transactionReceipt.confirmations()} confirmations`,
            )
            resolve()
        })
    })
}

async function withdraw() {
    if (typeof window.ethereum != "undefinded") {
        console.log("Withdrawing...")
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner() //Return whichever wallet is connected to the provider
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
