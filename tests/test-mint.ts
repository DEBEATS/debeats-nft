import * as anchor from "@project-serum/anchor";
import { MintNft } from "../target/types/mint_nft";
import {
  createKeypairFromFile,
  getMetadata,
  getMasterEdition,
  getCollectionAuthorityRecord
} from './util';

describe("test-mint", async () => {
  const provider = anchor.AnchorProvider.env()
  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);

  console.log(`Wallet public key: ${wallet.publicKey}`);

  const program = anchor.workspace.MintNft as anchor.Program<MintNft>;

  const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  const nftManagerKeypair: anchor.web3.Keypair = await createKeypairFromFile(__dirname + "/keypairs/nft_manager.json");
  console.log(`nftManagerKeypair public key: ${nftManagerKeypair.publicKey}`);


  it("Mint", async () => {
    const collectionMintKey = new anchor.web3.PublicKey(
      "BanSLYLp9L3ZEHGwZG8tzJiNc7XaRBANEdMaG1Tz2ACd"
    );

    const [nftPda, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("nft_pda"), nftManagerKeypair.publicKey.toBuffer()],
      program.programId,
    );
    console.log(`nftPda: ${nftPda}, bump: ${bump}`);

    const [collectionPda, collectionBump] = await anchor.web3.PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("collection_pda"), nftManagerKeypair.publicKey.toBuffer()],
      program.programId,
    );
    console.log(`collectionPda: ${collectionPda}, collectionBump: ${collectionBump}`);

    // Derive the mint address and the associated token account address

    const mintKeypair: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    const tokenAddress = await anchor.utils.token.associatedAddress({
      mint: mintKeypair.publicKey,
      owner: wallet.publicKey
    });
    console.log(`New token: ${mintKeypair.publicKey}`);
    console.log(`tokenAddress: ${tokenAddress}`);

    // Derive the metadata and master edition addresses

    const metadataAddress = await getMetadata(mintKeypair.publicKey);
    console.log(`metadataAddress: ${metadataAddress}`);

    const masterEditionAddress = await getMasterEdition(mintKeypair.publicKey);
    console.log(`masterEditionAddress: ${masterEditionAddress}`);

    // Derive the collection metadata and master edition addresses

    const collectionMetadataAddress = await getMetadata(collectionMintKey);
    console.log(`collectionMetadataAddress: ${collectionMetadataAddress}`);

    const collectionMasterEditionAddress = await getMasterEdition(collectionMintKey);
    console.log(`collectionMasterEditionAddress: ${collectionMasterEditionAddress}`);

    // Derive the collection authority record addresses

    const collectionAuthorityRecordAddress = await getCollectionAuthorityRecord(collectionMintKey, collectionPda);
    console.log(`collectionAuthorityRecordAddress: ${collectionAuthorityRecordAddress}`);

    // Transact with the "mint" function in our on-chain program

    const tokenId = 1;
    await program.methods.mint(new anchor.BN(tokenId))
      .accounts({
        nftPda: nftPda,
        collectionPda: collectionPda,
        masterEdition: masterEditionAddress,
        metadata: metadataAddress,
        mint: mintKeypair.publicKey,
        tokenAccount: tokenAddress,
        mintAuthority: wallet.publicKey,
        payer: wallet.publicKey,
        nftManager: nftManagerKeypair.publicKey,
        collectionMint: collectionMintKey,
        collectionMetadata: collectionMetadataAddress,
        collectionMasterEdition: collectionMasterEditionAddress,
        collectionAuthorityRecord: collectionAuthorityRecordAddress,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .signers([mintKeypair])
      .rpc();
  });
});