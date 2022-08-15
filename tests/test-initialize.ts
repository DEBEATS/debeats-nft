import * as anchor from "@project-serum/anchor";
import { MintNft } from "../target/types/mint_nft";
import { createKeypairFromFile } from './util';


describe("test-initialize", async () => {
  const provider = anchor.AnchorProvider.env()
  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);

  const program = anchor.workspace.MintNft as anchor.Program<MintNft>;

  const nftManagerKeypair: anchor.web3.Keypair = await createKeypairFromFile(__dirname + "/keypairs/nft_manager.json");
  console.log(`nftManagerKeypair public key: ${nftManagerKeypair.publicKey}`);

  it("Initialize", async () => {
    const name = "DEBEATS HEADPHONE";
    const symbol = "DEBEATS";
    const baseTokenUri = "https://raw.githubusercontent.com/wjsxqs/nft-assets/main/debeats/";
    const priceLamports = new anchor.BN(0.5 * anchor.web3.LAMPORTS_PER_SOL);

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

    const tx = await program.methods.initialize(
      name, symbol, baseTokenUri, priceLamports
    )
      .accounts({
        initializer: wallet.publicKey,
        nftPda: nftPda,
        collectionPda: collectionPda,
        nftManager: nftManagerKeypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([])
      .rpc();

    console.log('Initialize tx hash', tx);
  });

});