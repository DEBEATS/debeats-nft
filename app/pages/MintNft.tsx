import { 
    Keypair, 
} from '@solana/web3.js';
import { 
    getAssociatedTokenAddress, 
} from '@solana/spl-token';
import { programID } from "./utils/config";
import { IDL } from "./idl/mint_nft";

import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import React, { FC, useCallback } from 'react';
import { web3, Program, AnchorProvider, BN, utils } from "@project-serum/anchor";

export const MintNft: FC = () => {
    const { connection } = useConnection();
    const { wallet, publicKey, sendTransaction, signTransaction, signAllTransactions } = useWallet();

    const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );
  
    const onClick = useCallback(async () => {
        if (!wallet || !publicKey || !signTransaction || !signAllTransactions) throw new WalletNotConnectedError();
        
        const signerWallet = {
            publicKey: publicKey,
            signTransaction: signTransaction,
            signAllTransactions: signAllTransactions,
          };
      
        const provider = new AnchorProvider(connection, signerWallet, {
          preflightCommitment: "recent",
        });

        const program = new Program(IDL, programID, provider);

        const collectionMintKey = new web3.PublicKey(
          "BoAayLUjce9UiPd4AmWkAwkF1hwU5kpaY8jjCd75CeAe"
        );

        const nftManagerKey = new web3.PublicKey('EX98fDJ8ERrZsCsohYFSD2c8k8twHmvEKHVboC1vAVjK');
        const [nftPda] = await web3.PublicKey.findProgramAddress(
          [utils.bytes.utf8.encode("nft_pda"), nftManagerKey.toBuffer()],
          program.programId,
        );
        console.log(`nftPda: ${nftPda}`);

        const mintKey = Keypair.generate();
        console.log(`New token: ${mintKey.publicKey}`);
    
        let tokenAddress = await getAssociatedTokenAddress(
            mintKey.publicKey,
            publicKey
        );

        const metadataAddress = (await web3.PublicKey.findProgramAddress(
          [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mintKey.publicKey.toBuffer(),
          ],
          TOKEN_METADATA_PROGRAM_ID
        ))[0];
        console.log(`metadataAddress: ${metadataAddress}`);
    
        const masterEditionAddress = (await web3.PublicKey.findProgramAddress(
          [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mintKey.publicKey.toBuffer(),
            Buffer.from("edition"),
          ],
          TOKEN_METADATA_PROGRAM_ID
        ))[0];
        console.log(`masterEditionAddress: ${masterEditionAddress}`);

        const tx = await program.methods.mint()
          .accounts({
            nftPda: nftPda,
            masterEdition: masterEditionAddress,
            metadata: metadataAddress,
            mint: mintKey.publicKey,
            tokenAccount: tokenAddress,
            mintAuthority: publicKey,
            payer: publicKey,
            nftManager: nftManagerKey,
            collectionMint: collectionMintKey,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          })
          .signers([mintKey])
          .rpc();

       console.log(`https://solscan.io/tx/${tx}?cluster=devnet`)

    }, [publicKey, sendTransaction, connection]);

    return (
        <button onClick={onClick} disabled={!publicKey}>
            Buy NFT 
        </button>
    );
}
