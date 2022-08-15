import * as anchor from "@project-serum/anchor";
import { MintNft } from "../target/types/mint_nft";
import { createKeypairFromFile } from './util';


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

    const nftMintKey = new anchor.web3.PublicKey(
      "A1hADSdBvcu2P7c5H1kDmFikfDCvNa1tHrxHRsUVYQMi"
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

    // Derive the metadata and master edition addresses

    const metadataAddress = (await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        nftMintKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    ))[0];
    console.log(`metadataAddress: ${metadataAddress}`);

    // Derive the metadata and master edition addresses

    const collectionMetadataAddress = (await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        collectionMintKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    ))[0];
    console.log(`collectionMetadataAddress: ${collectionMetadataAddress}`);

    const collectionMasterEditionAddress = (await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        collectionMintKey.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    ))[0];
    console.log(`collectionMasterEditionAddress: ${collectionMasterEditionAddress}`);

    // Transact with the "mint" function in our on-chain program

    await program.methods.setAndVerifyCollection()
      .accounts({
        nftPda: nftPda,
        collectionPda: collectionPda,
        metadata: metadataAddress,
        payer: wallet.publicKey,
        nftManager: nftManagerKeypair.publicKey,
        collectionMint: collectionMintKey,
        collectionMetadata: collectionMetadataAddress,
        collectionMasterEdition: collectionMasterEditionAddress,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .signers([])
      .rpc();
  });
});