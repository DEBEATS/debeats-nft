use anchor_lang::prelude::*;

pub mod mint;

use mint::*;

declare_id!("As35BqTErxt7neUhzZik8P194q9zdFJmuzcLYu1BvpNh");

#[program]
pub mod mint_nft {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        name: String,
        symbol: String,
        base_token_uri: String,
        price_lamports: u64,
    ) -> Result<()> {
        mint::initialize(
            ctx,
            name, 
            symbol, 
            base_token_uri,
            price_lamports,
        )
    }

    pub fn set_metadata(
        ctx: Context<SetMetadata>,
        name: String,
        symbol: String,
        base_token_uri: String
    ) -> Result<()> {
        mint::set_metadata(ctx, name, symbol, base_token_uri)
    }

    pub fn set_price(ctx: Context<SetPrice>, price_lamports: u64) -> Result<()> {
        mint::set_price(ctx, price_lamports)
    }

    pub fn mint_collection(
        ctx: Context<MintCollection>, 
    ) -> Result<()> {
        mint::mint_collection(ctx)
    }

    pub fn mint(
        ctx: Context<MintNft>, 
        token_id: u64,
    ) -> Result<()> {
        mint::mint(ctx, token_id)
    }

    pub fn set_collection(
        ctx: Context<SetCollection>
    ) -> Result<()> {
        mint::set_collection(ctx)
    }

    pub fn set_and_verify_collection(
        ctx: Context<SetAndVerifyCollection>,
    ) -> Result<()> {
        mint::set_and_verify_collection(ctx)
    }
}
