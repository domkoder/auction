

use anchor_lang::{prelude::*,
    solana_program::{
        clock::UnixTimestamp,
        program::invoke,
        system_instruction
    }
};
use crate::instructions::*;

pub mod errors;
pub mod states;
pub mod instructions;

declare_id!("DH5eappnLSkqwVRee1SKoiwRr3tk5GfjtqfdsKBzqP6j");

#[program]
pub mod auction {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
