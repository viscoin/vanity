import { config } from 'dotenv'
config()
import { base58, publicKeyFromPrivateKey, addressFromPublicKey, Address, keygen } from 'viscoin'
import { Worker, isMainThread, parentPort } from 'worker_threads'
import { cpus, setPriority } from 'os'
import * as fs from 'fs'

if (isMainThread) {
    setPriority(19)
    const err = e => {
        console.log(e)
        process.exit(0)
    }
    try {
        if (!process.env.target) err('You must specify target!')
        if (process.env.target.startsWith('1')) err(`Addresses can't start with 1!`)
        base58.decode(process.env.target)
    }
    catch {
        err('Target is invalid base58!')
    }
    const target = process.env.target.toLowerCase()
    const threads = parseInt(process.env.threads) || cpus().length
    console.log('Searching for addresses starting with:', target)
    console.log('Threads:', threads)
    let j = 0
    for (let i = 0; i < threads; i++) {
        const worker = new Worker(__filename)
        worker.on('message', e => {
            if (e) {
                e = JSON.parse(e)
                const publicKey = publicKeyFromPrivateKey(base58.decode(e))
                const address = Address.toString(addressFromPublicKey(publicKey))
                fs.appendFileSync('./output.txt', `${address} ${e}\n`)
                console.log(address, e)
            }
            j++
        })
        worker.postMessage(JSON.stringify(target))
    }
    setInterval(() => {
        console.log(j, 'A/s')
        j = 0
    }, 1000)
}
else {
    parentPort.once('message', e => {
        const target = JSON.parse(e)
        while (true) {
            parentPort.postMessage(0)
            const privateKey = keygen()
            const publicKey = publicKeyFromPrivateKey(privateKey)
            const address = Address.toString(addressFromPublicKey(publicKey))
            if (address.toLowerCase().startsWith(target)) {
                parentPort.postMessage(JSON.stringify(base58.encode(privateKey)))
            }
        }
    })
}