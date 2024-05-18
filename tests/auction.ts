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
	const bidder3 = anchor.web3.Keypair.generate()

	const INITIAL_PRICE = 100
	const AUCTION_LENGTH = 300 // in seconds
	const ITEM = 'Unique Item'

	describe('Initialize Auction', async () => {
		it('Can initialize auction!', async () => {
			await airdrop(provider.connection, auctioneer.publicKey)

			const [auctionPublicKey, auctionBump] = getAuctionAddress(
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
					auction: auctionPublicKey,
					systemProgram: anchor.web3.SystemProgram.programId,
				})
				.signers([auctioneer])
				.rpc({ commitment: 'confirmed' })
			// console.log('Your transaction signature', tx)
			// let auctionData = await program.account.auction.fetch(auctionPublicKey)
			// console.log(auctionData)
			checkAction(
				program,
				auctionPublicKey,
				auctioneer.publicKey,
				ITEM,
				INITIAL_PRICE,
				0,
				PublicKey.default,
				AUCTION_LENGTH,
				true,
				auctionBump
			)
			const auctionBalance = await provider.connection.getBalance(
				auctionPublicKey
			)
			console.log({
				auctionBalance,
			})
		})
	})

	describe('Can place Bid', async () => {
		it('Bidder 1 can place bid to auction!', async () => {
			await airdrop(provider.connection, bidder1.publicKey)

			const [auctionPublicKey, auction_bump] = getAuctionAddress(
				auctioneer.publicKey,
				program.programId
			)

			const [bidPublickey, reaction_bump] = getBidAddress(
				bidder1.publicKey,
				auctionPublicKey,
				program.programId
			)

			const tx = await program.methods
				.bid(new anchor.BN(200))
				.accounts({
					bidder: bidder1.publicKey,
					bid: bidPublickey,
					auction: auctionPublicKey,
					systemProgram: anchor.web3.SystemProgram.programId,
				})
				.signers([bidder1])
				.rpc({ commitment: 'confirmed' })

			// console.log('Your transaction signature', tx)

			checkBid(
				program,
				bidPublickey,
				bidder1.publicKey,
				auctionPublicKey,
				reaction_bump
			)

			const auctionBalance = await provider.connection.getBalance(
				auctionPublicKey
			)
			const bidder1Balance = await provider.connection.getBalance(
				bidder1.publicKey
			)

			console.log({
				auctionBalance,
				bidder1Balance,
			})
		})

		it('Bidder 2 can place bid to auction!', async () => {
			await airdrop(provider.connection, bidder2.publicKey)

			const [auctionPublicKey, auction_bump] = getAuctionAddress(
				auctioneer.publicKey,
				program.programId
			)

			const [bidPublickey, reaction_bump] = getBidAddress(
				bidder2.publicKey,
				auctionPublicKey,
				program.programId
			)

			const tx = await program.methods
				.bid(new anchor.BN(300))
				.accounts({
					bidder: bidder2.publicKey,
					bid: bidPublickey,
					auction: auctionPublicKey,
					systemProgram: anchor.web3.SystemProgram.programId,
				})
				.signers([bidder2])
				.rpc({ commitment: 'confirmed' })

			// console.log('Your transaction signature', tx)

			await checkBid(
				program,
				bidPublickey,
				bidder2.publicKey,
				auctionPublicKey,
				reaction_bump
			)

			const auctionBalance = await provider.connection.getBalance(
				auctionPublicKey
			)
			const bidder2Balance = await provider.connection.getBalance(
				bidder2.publicKey
			)

			console.log({
				auctionBalance,
				bidder2Balance,
			})
		})

		it('Bidder 3 can place bid to auction!', async () => {
			await airdrop(provider.connection, bidder3.publicKey)

			const [auctionPublicKey, auction_bump] = getAuctionAddress(
				auctioneer.publicKey,
				program.programId
			)

			const [bidPublickey, reaction_bump] = getBidAddress(
				bidder3.publicKey,
				auctionPublicKey,
				program.programId
			)

			const tx = await program.methods
				.bid(new anchor.BN(400))
				.accounts({
					bidder: bidder3.publicKey,
					bid: bidPublickey,
					auction: auctionPublicKey,
					systemProgram: anchor.web3.SystemProgram.programId,
				})
				.signers([bidder3])
				.rpc({ commitment: 'confirmed' })

			// console.log('Your transaction signature', tx)

			await checkBid(
				program,
				bidPublickey,
				bidder3.publicKey,
				auctionPublicKey,
				reaction_bump
			)

			const auctionBalance = await provider.connection.getBalance(
				auctionPublicKey
			)
			const bidder3Balance = await provider.connection.getBalance(
				bidder3.publicKey
			)

			console.log({
				auctionBalance,
				bidder3Balance,
			})
		})

		it('Bidder 1 can place bid to auction again', async () => {
			await airdrop(provider.connection, bidder1.publicKey)

			const [auctionPublicKey, auction_bump] = getAuctionAddress(
				auctioneer.publicKey,
				program.programId
			)

			const [bidPublickey, reaction_bump] = getBidAddress(
				bidder1.publicKey,
				auctionPublicKey,
				program.programId
			)

			const tx = await program.methods
				.bid(new anchor.BN(500))
				.accounts({
					bidder: bidder1.publicKey,
					bid: bidPublickey,
					auction: auctionPublicKey,
					systemProgram: anchor.web3.SystemProgram.programId,
				})
				.signers([bidder1])
				.rpc({ commitment: 'confirmed' })

			// console.log('Your transaction signature', tx)

			checkBid(
				program,
				bidPublickey,
				bidder1.publicKey,
				auctionPublicKey,
				reaction_bump
			)

			const auctionBalance = await provider.connection.getBalance(
				auctionPublicKey
			)
			const bidder1Balance = await provider.connection.getBalance(
				bidder1.publicKey
			)

			console.log({
				auctionBalance,
				bidder1Balance,
			})
		})
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

function getBidAddress(
	bidder: PublicKey,
	auction: PublicKey,
	programID: PublicKey
) {
	return PublicKey.findProgramAddressSync(
		[
			anchor.utils.bytes.utf8.encode(BID_SEED),
			bidder.toBuffer(),
			auction.toBuffer(),
		],
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

	// displayAuctionData(program, auction)
	console.log('##### Auction Information #####')
	console.log({
		endTime: new Date(auctionData.endTime.toNumber() * 1000).toString(),
		auctioneer: auctionData.auctioneer.toString(),
		item: auctionData.item,
		startingPrice: auctionData.startingPrice.toNumber() + ' LAMPORTS',
		leadingBid: auctionData.leadingBid.toNumber(),
		leadingBidder: auctionData.leadingBidder.toString(),
		isOpen: auctionData.isOpen,
		bump: auctionData.bump.toString(),
	})
}

async function checkBid(
	program: anchor.Program<Auction>,
	bid: PublicKey,
	bidder?: PublicKey,
	auction?: PublicKey,
	bump?: number
) {
	let bidData = await program.account.bid.fetch(bid)

	if (bidder) {
		assert.strictEqual(bidData.bidder.toString(), bidder.toString())
	}
	if (auction) {
		assert.strictEqual(bidData.auction.toString(), auction.toString())
	}

	if (bump) {
		assert.strictEqual(bidData.bump.toString(), bump.toString())
	}

	// console.log('##### Bid Information #####')
	// console.log({
	// 	auction: bidData.auction.toString(),
	// 	bidder: bidData.bidder.toString(),
	// 	amount: bidData.amount.toNumber(),
	// 	bump: bidData.bump.toString(),
	// })

	// displayAuctionData(program, auction)
}

// async function displayAuctionData(program, auction) {
// 	let auctionData = await program.account.auction.fetch(auction)

// }
