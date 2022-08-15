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

  it("Log nft pda", async () => {
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


    const nftPdaData = await program.account.nftPda.fetch(nftPda);
    console.log('nftPdaData:', nftPdaData);
    console.log('priceLamports', nftPdaData.priceLamports.toString());

    const collectionPdaData = await program.account.collectionPda.fetch(collectionPda);
    console.log('collectionPdaData:', collectionPdaData);
    console.log('collection authority', collectionPdaData.authority.toBase58());
    console.log('collection mint', collectionPdaData.mint.toBase58());
  });

 
});