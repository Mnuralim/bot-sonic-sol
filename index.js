const {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  Keypair,
} = require('@solana/web3.js')
const bip39 = require('bip39')
const { derivePath } = require('ed25519-hd-key')
require('dotenv').config()

const DEVNET_URL = 'https://devnet.sonic.game/'
const connection = new Connection(DEVNET_URL, 'confirmed')

async function sendSol(fromKeypair, toPublicKey, amount) {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  )

  const signature = await sendAndConfirmTransaction(connection, transaction, [fromKeypair])

  console.log('Transaction confirmed with signature:', signature)
}

function generateRandomAddresses(count) {
  const addresses = []
  for (let i = 0; i < count; i++) {
    const keypair = Keypair.generate()
    addresses.push(keypair.publicKey.toString())
  }
  return addresses
}

async function getKeypairFromSeed(seedPhrase) {
  const seed = await bip39.mnemonicToSeed(seedPhrase)
  const derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key
  return Keypair.fromSeed(derivedSeed.slice(0, 32))
}

;(async () => {
  const seedPhrase = process.env.SEED_PHRASE
  if (!seedPhrase) {
    throw new Error('SEED_PHRASE is not set in the .env file')
  }
  const fromKeypair = await getKeypairFromSeed(seedPhrase)

  const randomAddresses = generateRandomAddresses(100)
  console.log('Generated 100 random addresses:', randomAddresses)

  const amountToSend = 0.001 //

  for (const address of randomAddresses) {
    const toPublicKey = new PublicKey(address)
    try {
      await sendSol(fromKeypair, toPublicKey, amountToSend)
      console.log(`Successfully sent ${amountToSend} SOL to ${address}`)
    } catch (error) {
      console.error(`Failed to send SOL to ${address}:`, error)
    }
  }
})()
