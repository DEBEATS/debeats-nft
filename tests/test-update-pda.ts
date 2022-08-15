import * as anchor from "@project-serum/anchor";
import { MintNft } from "../target/types/mint_nft";
import { createKeypairFromFile } from './util';

describe("log-data", async () => {

  const provider = anchor.AnchorProvider.env()
  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);

  console.log(`Wallet public key: ${wallet.publicKey}`);

  const program = anchor.workspace.MintNft as anchor.Program<MintNft>;

  const creatorKeypair: anchor.web3.Keypair = await createKeypairFromFile(__dirname + "/keypairs/sale_creator.json");
  console.log(`creatorKeypair public key: ${creatorKeypair.publicKey}`);

  it("set metadata", async () => {

    const name = "DEBEATS HEADPHONE";
    const symbol = "DEBEATS";
    const baseTokenUri = "https://raw.githubusercontent.com/wjsxqs/nft-assets/main/debeats/";

    const [nftPda, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("nft_pda"), creatorKeypair.publicKey.toBuffer()],
      program.programId,
    );
    console.log(`nftPda: ${nftPda}, bump: ${bump}`);

    const tx = await program.methods.setMetadata(
      name, symbol, baseTokenUri
    )
      .accounts({
        nftPda: nftPda,
      })
      .signers([])
      .rpc();

    console.log('tx hash', tx);
  });

  // it("set price", async () => {

  //   const [nftPda, bump] = await anchor.web3.PublicKey.findProgramAddress(
  //     [anchor.utils.bytes.utf8.encode("sale"), creatorKeypair.publicKey.toBuffer()],
  //     program.programId,
  //   );
  //   console.log(`nftPda: ${nftPda}, bump: ${bump}`);
  
  //   const priceLamports = '300000000';
  
  //   const tx = await program.methods.setPrice(
  //     new anchor.BN(priceLamports),
  //   )
  //     .accounts({
  //       sale: nftPda,
  //     })
  //     .signers([])
  //     .rpc();

  //   console.log('tx hash', tx);
  // });
});

