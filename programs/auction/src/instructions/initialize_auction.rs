use anchor_lang::{
    prelude::*,
    solana_program::clock::Clock
};

use crate::errors::AuctionError;
use crate::states::*;

pub fn initialize_auction(
    ctx: Context<InitializeAuction>,
    duration: i64,
    starting_price: u64,
    item: String
) -> Result<()> {
    let initialize_auction = &mut ctx.accounts.auction;
    // Get the current Unix timestamp
    let current_time = Clock::get()?.unix_timestamp;

    // Calculate the end time for the auction
    let end_time = current_time
        .checked_add(duration)
        .ok_or(AuctionError::InvalidOperation)?;


    msg!("Auction starting price {}", starting_price);
    msg!("Auction duration {}", duration);
    msg!("Auction end time {}", end_time);

    initialize_auction.auctioneer = *ctx.accounts.auction_authority.key;
    initialize_auction.item = item;
    initialize_auction.starting_price = starting_price;
    initialize_auction.leading_bid = 0;
    initialize_auction.leading_bidder = Pubkey::default();
    initialize_auction.end_time = end_time;
    initialize_auction.is_open = true;
    initialize_auction.bump = ctx.bumps.auction;
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeAuction<'info> {
    #[account(mut)]
    pub auction_authority: Signer<'info>,

    #[account(
        init,
        payer = auction_authority,
        space = 8 + Auction::size(),
        seeds = [
            AUCTION_SEED.as_bytes(),
            auction_authority.key().as_ref(),
        ],
        bump
    )]
    pub auction: Account<'info, Auction>,
    pub system_program: Program<'info, System>,
}