use std::mem::size_of;
use anchor_lang::{
    prelude::*,
    solana_program::{
        clock::UnixTimestamp,
    },
};

#[account]
pub struct Auction {
    pub auctioneer: Pubkey,
    pub starting_price: u64,
    pub leading_bid: u64,
    pub leading_bidder: Pubkey,
    pub end_time: i64,
    pub is_open: bool,
    pub bump: u8,
    pub data: String,
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