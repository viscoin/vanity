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
    const filter = []
    if (!process.env.filter) err('You must specify filter!')
    for (const string of process.env.filter.split(' ')) {
        if (string.startsWith('1')) err(`Addresses can't start with 1!`)
        try {
            base58.decode(string)
        }
        catch {
            err(`Filter has target with invalid base58: ${string}`)
        }
        filter.push(string.toLowerCase())
    }
    const threads = parseInt(process.env.threads) || cpus().length
    console.log('Searching for addresses starting with:', filter)
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
        worker.postMessage(JSON.stringify(filter))
    }
    setInterval(() => {
        console.log(j, 'A/s')
        j = 0
    }, 1000)
}
else {
    parentPort.once('message', e => {
        const filter = JSON.parse(e)
        while (true) {
            parentPort.postMessage(0)
            const privateKey = keygen()
            const publicKey = publicKeyFromPrivateKey(privateKey)
            const address = Address.toString(addressFromPublicKey(publicKey))
            for (const string of filter) {
                if (address.toLowerCase().startsWith(string)) {
                    parentPort.postMessage(JSON.stringify(base58.encode(privateKey)))
                }
            }
        }
    })
}