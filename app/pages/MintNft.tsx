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

    const getMetadata = async (mint: web3.PublicKey): Promise<web3.PublicKey> => {
      return (
        await web3.PublicKey.findProgramAddress(
          [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
          ],
          TOKEN_METADATA_PROGRAM_ID
        )
      )[0];
    };

    const getMasterEdition = async (mint: web3.PublicKey): Promise<web3.PublicKey> => {
      return (
        await web3.PublicKey.findProgramAddress(
          [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
            Buffer.from("edition"),
          ],
          TOKEN_METADATA_PROGRAM_ID
        )
      )[0];
    };

    const getCollectionAuthorityRecord = async (mint: web3.PublicKey, collectionAuthority: web3.PublicKey): Promise<web3.PublicKey> => {
      return (
        await web3.PublicKey.findProgramAddress(
          [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
            Buffer.from("collection_authority"),
            collectionAuthority.toBuffer(),
          ],
          TOKEN_METADATA_PROGRAM_ID
      ))[0];
    };
  
    const onClick = useCallback(async (tokenId: number) => {
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
    
        const nftManagerKey = new web3.PublicKey('EX98fDJ8ERrZsCsohYFSD2c8k8twHmvEKHVboC1vAVjK');

        const collectionMintKey = new web3.PublicKey(
          "BanSLYLp9L3ZEHGwZG8tzJiNc7XaRBANEdMaG1Tz2ACd"
        );
    
        const [nftPda] = await web3.PublicKey.findProgramAddress(
          [utils.bytes.utf8.encode("nft_pda"), nftManagerKey.toBuffer()],
          program.programId,
        );
        console.log(`nftPda: ${nftPda}`);
    
        const [collectionPda] = await web3.PublicKey.findProgramAddress(
          [utils.bytes.utf8.encode("collection_pda"), nftManagerKey.toBuffer()],
          program.programId,
        );
        console.log(`collectionPda: ${collectionPda}`);

        const mintKey = Keypair.generate();
        console.log(`New token: ${mintKey.publicKey}`);
    
        let tokenAddress = await getAssociatedTokenAddress(
            mintKey.publicKey,
            publicKey
        );

        // Derive the nft metadata and master edition addresses

        const metadataAddress = await getMetadata(mintKey.publicKey);
        console.log(`metadataAddress: ${metadataAddress}`);
    
        const masterEditionAddress = await getMasterEdition(mintKey.publicKey);
        console.log(`masterEditionAddress: ${masterEditionAddress}`);

        // Derive the collection metadata and master edition addresses

        const collectionMetadataAddress = await getMetadata(collectionMintKey);
        console.log(`collectionMetadataAddress: ${collectionMetadataAddress}`);

        const collectionMasterEditionAddress = await getMasterEdition(collectionMintKey);
        console.log(`collectionMasterEditionAddress: ${collectionMasterEditionAddress}`);

        // Derive the collection authority record address

        const collectionAuthorityRecordAddress = await getCollectionAuthorityRecord(collectionMintKey, collectionPda);
        console.log(`collectionAuthorityRecordAddress: ${collectionAuthorityRecordAddress}`);

        const tx = await program.methods.mint(new BN(tokenId))
          .accounts({
            nftPda: nftPda,
            collectionPda: collectionPda,
            masterEdition: masterEditionAddress,
            metadata: metadataAddress,
            mint: mintKey.publicKey,
            tokenAccount: tokenAddress,
            mintAuthority: publicKey,
            payer: publicKey,
            nftManager: nftManagerKey,
            collectionMint: collectionMintKey,
            collectionMetadata: collectionMetadataAddress,
            collectionMasterEdition: collectionMasterEditionAddress,
            collectionAuthorityRecord: collectionAuthorityRecordAddress,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          })
          .signers([mintKey])
          .rpc();

       console.log(`https://solscan.io/tx/${tx}?cluster=devnet`)

    }, [publicKey, sendTransaction, connection]);

    return (
      <>
        <button onClick={() => onClick(1)} disabled={!publicKey}>
            Mint Headphone 
        </button>
        <button onClick={() => onClick(2)} disabled={!publicKey}>
            Mint Beatmap
        </button>
      </>
    );
}
