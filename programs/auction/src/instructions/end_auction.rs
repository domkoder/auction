use anchor_lang::{
  prelude::*,
  solana_program::clock::Clock
};
use crate::errors::AuctionError;
use crate::states::*;

pub fn end_auction(ctx: Context<EndAuction>) -> Result<()> {
  let auction = &mut ctx.accounts.auction;
  let auctioneer = &mut ctx.accounts.auctioneer;

    // Ensure the auction is not already closed
    if !auction.is_open {
      return Err(error!(AuctionError::Closed));
    }

  // Is the auction already closed?
  if Clock::get()?.unix_timestamp < auction.end_time {
      return Err(error!(AuctionError::Open));
  }

  // Ensure the leading bid is valid
  if auction.leading_bid == 0 {
    return Err(error!(AuctionError::InvalidOperation));
  }

  // Transfer lamports to the seller
  **auction.to_account_info().try_borrow_mut_lamports()? -= auction.leading_bid;
  **auctioneer.to_account_info().try_borrow_mut_lamports()? += auction.leading_bid;

  auction.is_open = false;

  Ok(())
}

#[derive(Accounts)]
pub struct EndAuction<'info> {
  #[account(mut)]
  pub auctioneer: Signer<'info>,

  #[account(
    mut,
    seeds= [
      AUCTION_SEED.as_bytes(),
      auction.auctioneer.key().as_ref(),
    ],
    bump = auction.bump,
    has_one = auctioneer,
  )]
  pub auction: Account<'info, Auction>,
}