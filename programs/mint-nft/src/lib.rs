use anchor_lang::prelude::*;

pub mod mint;

use mint::*;

declare_id!("HGe3pxwjU3o5ZTNvQG4GDiyNb3cDeSLuw1EFS6MzeCak");

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

    pub fn mint(
        ctx: Context<MintNft>, 
    ) -> Result<()> {
        mint::mint(ctx)
    }
}
