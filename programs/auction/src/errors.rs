use anchor_lang::prelude::*;

#[error_code]
pub enum AuctionError {
    #[msg("Bid offer is lower than current bid")]
    BidTooLow,
    #[msg("Already the highest bidder")]
    AlreadyHighestBidder,
    #[msg("Wrong account")]
    WrongAccount,
    #[msg("Auction is open")]
    Open,
    #[msg("Auction is closed")]
    Closed,
    #[msg("Invalid operation")]
    InvalidOperation,
    #[msg("Winner can not refund")]
    WinnerRefund,
}