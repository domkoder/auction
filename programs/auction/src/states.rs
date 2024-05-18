use anchor_lang::{prelude::*, solana_program::clock::UnixTimestamp};
use std::mem::size_of;

#[constant]
pub const AUCTION_SEED: &str = "auction";
#[constant]
pub const BID_SEED: &str = "bid";

#[account]
pub struct Auction {
    // pub id: u32,
    pub auctioneer: Pubkey,
    pub item: String,
    pub starting_price: u64,
    pub leading_bid: u64,
    pub leading_bidder: Pubkey,
    pub end_time: i64,
    pub is_open: bool,
    pub bump: u8
}

impl Auction {
    pub fn size() -> usize {
        size_of::<Pubkey>()
            + size_of::<u64>()
            + size_of::<u64>()
            + size_of::<Pubkey>()
            + size_of::<UnixTimestamp>()
            + size_of::<bool>()
            + size_of::<String>()
            + size_of::<u8>()
    }
}

#[account]
pub struct Bid {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub amount: u64,
    pub bump: u8,
}

impl Bid {
    pub fn size() -> usize {
        size_of::<Pubkey>()+size_of::<Pubkey>() + size_of::<u64>() + size_of::<u8>()
    }
}
