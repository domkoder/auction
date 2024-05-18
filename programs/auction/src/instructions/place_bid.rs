use anchor_lang::{
    prelude::*,
    solana_program::{
        clock::Clock,
        program::invoke,
        system_instruction
    }
};

use crate::errors::AuctionError;
use crate::states::*;

pub fn place_bid(ctx: Context<PlaceBid>, amount: u64) -> Result<()> {
    msg!("Bid amount {}", amount);
    let auction = &mut ctx.accounts.auction;
    let bidder = &mut ctx.accounts.bidder;

    // Is the auction still running?
    if Clock::get()?.unix_timestamp >= auction.end_time {
        return err!(AuctionError::Closed);
    }

    // Check if the bid is lower or equal to the current highest
    // require!(amount > auction.leading_bid, AuctionError::BidTooLow);

    if amount <= auction.leading_bid {
        return err!(AuctionError::BidTooLow);
    }

    // Don't allow increasing the bid for the highest bidder
    // require!(
    //     *bidder.key != auction.leading_bidder,
    //     AuctionError::AlreadyHighestBidder
    // );

    if *bidder.key == auction.leading_bidder {
        return err!(AuctionError::AlreadyHighestBidder);
    }

    let bid = &mut ctx.accounts.bid;
    msg!("Bided amount {}", bid.amount);
    let bid_difference = amount
        .checked_sub(bid.amount)
        .ok_or(AuctionError::InvalidOperation)?;
    msg!("Bid Difference is {}", bid_difference);

    // Move the difference to the Auction PDA
    invoke(
        &system_instruction::transfer(&bidder.key(), &auction.key(), bid_difference),
        &[
            bidder.to_account_info(),
            auction.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    // Update the auction with the new information
    auction.leading_bid = amount;
    auction.leading_bidder = *bidder.key;

    // Update the Bid information
    bid.auction = auction.key();
    bid.amount = amount;
    bid.bidder = *bidder.key;
    bid.bump = ctx.bumps.bid;

    Ok(())
}

#[derive(Accounts)]
pub struct PlaceBid<'info> {
    #[account(mut)]
    pub bidder: Signer<'info>,

    #[account(
        init_if_needed,
        payer = bidder,
        space = 8 + Bid::size(),
        seeds = [
            BID_SEED.as_bytes(),
            bidder.key().as_ref(),
            auction.key().as_ref(),
        ],
        bump
    )]
    pub bid: Account<'info, Bid>,
    
    #[account(
        mut,
        seeds = [
            AUCTION_SEED.as_bytes(),
            auction.auctioneer.key().as_ref(),
        ],
        bump = auction.bump
    )]
    pub auction: Account<'info, Auction>,
    pub system_program: Program<'info, System>,
}
