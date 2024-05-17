import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Auction } from '../target/types/auction'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { assert } from 'chai'
import crypto from 'crypto'

const AUCTION_SEED = 'auction'
const BID_SEED = 'bid'

describe('auction', () => {
	// Configure the client to use the local cluster.
	const provider = anchor.AnchorProvider.local('http://127.0.0.1:8899')
	anchor.setProvider(provider)

	// Reference to the auction program
	const program = anchor.workspace.Auction as Program<Auction>

	// Initialize humans
	const auctioneer = anchor.web3.Keypair.generate()
	const bidder1 = anchor.web3.Keypair.generate()
	const bidder2 = anchor.web3.Keypair.generate()
	const INITIAL_PRICE = 1000000000
	const AUCTION_LENGTH = 300 // in seconds
	const ITEM = 'Unique Item'

	it('Initialize auction!', async () => {
		await airdrop(provider.connection, auctioneer.publicKey)

		const [auction_publicKey, auction_bump] = getAuctionAddress(
			auctioneer.publicKey,
			program.programId
		)

		const tx = await program.methods
			.initialize(
				new anchor.BN(AUCTION_LENGTH),
				new anchor.BN(INITIAL_PRICE),
				ITEM
			)
			.accounts({
				auctionAuthority: auctioneer.publicKey,
				auction: auction_publicKey,
				systemProgram: anchor.web3.SystemProgram.programId,
			})
			.signers([auctioneer])
			.rpc({ commitment: 'confirmed' })
		console.log('Your transaction signature', tx)

		let auctionData = await program.account.auction.fetch(auction_publicKey)

		console.log(auctionData)

		checkAction(
			program,
			auction_publicKey,
			auctioneer.publicKey,
			ITEM,
			INITIAL_PRICE,
			0,
			PublicKey.default,
			AUCTION_LENGTH,
			true,
			auction_bump
		)
	})
})

async function airdrop(connection: any, address: any, amount = 1000000000) {
	await connection.confirmTransaction(
		await connection.requestAirdrop(address, amount),
		'confirmed'
	)
}

function getAuctionAddress(auctioneer: PublicKey, programID: PublicKey) {
	return PublicKey.findProgramAddressSync(
		[anchor.utils.bytes.utf8.encode(AUCTION_SEED), auctioneer.toBuffer()],
		programID
	)
}

async function checkAction(
	program: anchor.Program<Auction>,
	auction: PublicKey,
	auctioneer?: PublicKey,
	item?: string,
	startingPrice?: number,
	leadingBid?: number,
	leadingBidder?: PublicKey,
	duration?: number,
	isOpen?: boolean,
	bump?: number
) {
	let auctionData = await program.account.auction.fetch(auction)

	if (auctioneer) {
		assert.strictEqual(auctionData.auctioneer.toString(), auctioneer.toString())
	}
	if (item) {
		assert.strictEqual(auctionData.item, item)
	}
	if (startingPrice) {
		assert.strictEqual(auctionData.startingPrice.toNumber(), startingPrice)
	}
	if (leadingBid) {
		assert.strictEqual(auctionData.leadingBid.toNumber(), leadingBid)
	}

	if (leadingBidder) {
		assert.strictEqual(
			auctionData.leadingBidder.toString(),
			leadingBidder.toString()
		)
	}

	if (isOpen) {
		assert.strictEqual(auctionData.isOpen, isOpen)
	}

	if (bump) {
		assert.strictEqual(auctionData.bump.toString(), bump.toString())
	}

	if (duration) {
		const currentTime = Math.floor(Date.now() / 1000) // Current Unix timestamp in seconds
		const expectedEndTime = currentTime + duration

		// Allowing a small difference due to execution time.
		const allowedDifference = 10
		assert.approximately(
			auctionData.endTime.toNumber(),
			expectedEndTime,
			allowedDifference,
			'End time should be close to the expected time'
		)
	}

	console.log({
		endTime: new Date(auctionData.endTime.toNumber() * 1000).toString(),
		auctioneer: auctionData.auctioneer.toString(),
		item: auctionData.item,
		startingPrice:
			auctionData.startingPrice.toNumber() / LAMPORTS_PER_SOL + ' SOL',
		leadingBid: auctionData.leadingBid.toNumber(),
		leadingBidder: auctionData.leadingBidder.toString(),
		isOpen: auctionData.isOpen,
		bump: auctionData.bump.toString(),
	})
}
