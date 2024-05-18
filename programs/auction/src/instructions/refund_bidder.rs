use anchor_lang::{
  prelude::*,
  solana_program::clock::Clock
};

use crate::errors::AuctionError;
use crate::states::*;

pub fn refund_bidder(ctx: Context<RefundBidder>) -> Result<()> {
  let auction: &mut Account<Auction> = &mut ctx.accounts.auction;
  let bid = &mut ctx.accounts.bid;

  // Ensure the auction is closed
  if auction.is_open {
      return Err(error!(AuctionError::Closed));
  }

  // Is the auction already closed?
  if Clock::get()?.unix_timestamp < auction.end_time {
      return Err(error!(AuctionError::Open));
  }

  // Ensure the person requesting the refund is the actual bidder
  if *ctx.accounts.bidder.key != bid.bidder {
    return Err(error!(AuctionError::InvalidOperation));
  }

  // Ensure the auction has sufficient funds to refund the bidder
  let rent = Rent::get()?.minimum_balance(auction.to_account_info().data_len());

  if **auction.to_account_info().lamports.borrow() < rent - bid.amount {
    return Err(ProgramError::InsufficientFunds.into());
  }

  // Transfer lamports to the bidder
  **auction.to_account_info().try_borrow_mut_lamports()? -= bid.amount;
  **bid.to_account_info().try_borrow_mut_lamports()? += bid.amount;


  Ok(())
}

#[derive(Accounts)]
pub struct RefundBidder<'info> {
  #[account(mut)]
  pub bidder: Signer<'info>,

  #[account(
    mut,
    seeds = [
        BID_SEED.as_bytes(),
        bidder.key().as_ref(),
        auction.key().as_ref(),
    ],
    bump = bid.bump
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
}