use std::mem::size_of;
use anchor_lang::{
    prelude::*,
    solana_program::{
        clock::UnixTimestamp,
    },
};

#[constant]
pub const AUCTION_SEED: &[u8] = b"auction";
#[constant]
pub const BID_SEED: &[u8] = b"bid";

#[account]
pub struct Auction {
    pub auctioneer: Pubkey,
    pub starting_price: u64,
    pub leading_bid: u64,
    pub leading_bidder: Pubkey,
    pub end_time: i64,
    pub is_open: bool,
    // pub name: String,
    // pub data: String,
    pub bump: u8,
}

impl Auction {
    pub fn size() -> usize {
        size_of::<Pubkey>()
        + size_of::<u64>()
        + size_of::<u64>()
        + size_of::<Pubkey>()
        + size_of::<UnixTimestamp>()
        + size_of::<bool>()
        + size_of::<u8>()
        + size_of::<String>()
    }
}

#[accounts]
pub struct Bid {
    pub bidder: Pubkey,
    pub amount: u64,
    pub bump: u8
}

impl Bid {
    pub fn size() -> usize {
        size_of::<Pubkey>()
        + size_of::<u64>()
        + size_of::<u8>()
    }
}