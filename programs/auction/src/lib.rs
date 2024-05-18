use anchor_lang::prelude::*;
use crate::instructions::*;

pub mod errors;
pub mod states;
pub mod instructions;

declare_id!("DH5eappnLSkqwVRee1SKoiwRr3tk5GfjtqfdsKBzqP6j");

#[program]
pub mod auction {
    use super::*;

    pub fn initialize(ctx: Context<InitializeAuction>,
        duration: i64,
        starting_price: u64,
        item: String) -> Result<()> {
        initialize_auction(ctx, duration, starting_price, item)
    }

    pub fn bid(ctx: Context<PlaceBid>, amount: u64) -> Result<()> {
        place_bid(ctx, amount)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
