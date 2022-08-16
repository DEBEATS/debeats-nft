import * as anchor from "@project-serum/anchor";
import { MintNft } from "../target/types/mint_nft";
import { createKeypairFromFile } from './util';

describe("log-data", async () => {

  const provider = anchor.AnchorProvider.env()
  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);

  console.log(`Wallet public key: ${wallet.publicKey}`);

  const program = anchor.workspace.MintNft as anchor.Program<MintNft>;

  const nftManagerKeypair: anchor.web3.Keypair = await createKeypairFromFile(__dirname + "/keypairs/nft_manager.json");
  console.log(`nftManagerKeypair public key: ${nftManagerKeypair.publicKey}`);

  // it("set metadata", async () => {
  //   const name = "DEBEATS";
  //   const symbol = "DEBEATS";
  //   const baseTokenUri = "https://raw.githubusercontent.com/DEBEATS/debeats-nft/main/assets/";

  //   const [nftPda, bump] = await anchor.web3.PublicKey.findProgramAddress(
  //     [anchor.utils.bytes.utf8.encode("nft_pda"), nftManagerKeypair.publicKey.toBuffer()],
  //     program.programId,
  //   );
  //   console.log(`nftPda: ${nftPda}, bump: ${bump}`);

  //   const tx = await program.methods.setMetadata(
  //     name, symbol, baseTokenUri
  //   )
  //     .accounts({
  //       nftPda: nftPda,
  //       nftManager: nftManagerKeypair.publicKey,
  //     })
  //     .signers([nftManagerKeypair])
  //     .rpc();

  //   console.log('tx hash', tx);
  // });

  it("set price", async () => {
    const [nftPda, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("nft_pda"), nftManagerKeypair.publicKey.toBuffer()],
      program.programId,
    );
    console.log(`nftPda: ${nftPda}, bump: ${bump}`);
  
    const priceLamports = 1 * anchor.web3.LAMPORTS_PER_SOL;
  
    const tx = await program.methods.setPrice(
      new anchor.BN(priceLamports),
    )
      .accounts({
        nftPda: nftPda,
        nftManager: nftManagerKeypair.publicKey,
      })
      .signers([nftManagerKeypair])
      .rpc();

    console.log('tx hash', tx);
  });
});

