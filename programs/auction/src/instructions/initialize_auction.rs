use anchor_lang::{prelude::*,
    solana_program::{
      clock::UnixTimestamp,
    }
};
use crate::errors::AuctionError;
use crate::states::*;

pub fn initialize_auction(ctx: Context<InitializeAuction>, duration:  i64, starting_price: u64,  ) -> Result<()> {
    let auction = &mut ctx.accounts.auction;
    let end_time = Clock::get()?.unix_timestamp.checked_add(duration).ok_or(AuctionError::InvalidOperation)?;

    msg!("Auction starting price {}", starting_price);
    msg!("Auction duration {}", duration);

    msg!("Auction end time {}", end_time);

    auction.auctioneer = *ctx.accounts.auction_authority.key;
    auction.starting_price = starting_price;
    auction.leading_bid = starting_price;
    // set it to nobody
    auction.leading_bidder = Pubkey::default();
    auction.end_time = end_time;
    auction.is_open = true;
    auction.bump = ctx.bumps.auction;

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeAuction <'info> {
    #[account(mut)]
    pub auction_authority: Signer<'info>,
    
    #[account(
        init,
        payer = auction_authority,
        space = 8 + Auction::size(),
        seeds = [
            AUCTION_SEED,
            auction_authority.key().as_ref(),
        ],
        bump
    )]
    pub auction: Account<'info, Auction>,
    pub system_program: Program<'info, System>
}