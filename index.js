import {ethers} from "./ethers-5.1.esm.min.js" 
import {abi, contractAddress} from './constants.js'
const connectButton = document.getElementById('connectButton')
const fundButton = document.getElementById('fundButton')
const balanceButton = document.getElementById('balanceButton')
const withdrawButton = document.getElementById('withdrawButton')
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdrawFunds
// async? await?
async function connect(){
    if (typeof window.ethereum !== 'undefined'){
    await window.ethereum.request({method:'eth_requestAccounts'})
    connectButton.innerHTML = 'Connected to metamask!'
    }
    else{
        fundButton.innerHTML = 'Please connect to metamask!'
    }
} 

async function fund(){
    const fundAmount = document.getElementById('ethAmount').value
    console.log(`funding with ${fundAmount}`)
    if (typeof window.ethereum !== 'undefined'){
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        //await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(fundAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)  // first transaction is sent, afterwards is mined
            console.log('Done!')
        }
        catch (error){
            console.log(error)
        }
        
    }
    else{
        console.log('Please connect to Metamask')
    }
}

function listenForTransactionMine(transactionResponse, provider){
    console.log(`Mining ${transactionResponse.hash}...`)
    // if we do not return a Promise, the log 'done' would go before the log 'mining', becasue the await 
    // in line 31 just starts the provider.once process, does not wait for it (no necessity for stopping)
    return new Promise((resolve, reject) => {  
        provider.once(transactionResponse.hash, (transactionReceipt) => {    // () => {} anonymous function
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function getBalance(){
    if (typeof window.ethereum !== "undefined"){
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function withdrawFunds(){
    
    if (typeof window.ethereum !== 'undefined'){
        console.log(`Withdraw...`)
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)  // first transaction is sent, afterwards is mined
            console.log('Done!')
        }
        catch (error){
            console.log(error)
        }
        
    }
    else{
        console.log('Please connect to Metamask')
    }
}