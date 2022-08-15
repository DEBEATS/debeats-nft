import * as anchor from "@project-serum/anchor";
// import fs from 'mz/fs';
import fs from 'fs';

export async function createKeypairFromFile(
    filePath: string,
): Promise<anchor.web3.Keypair> {
    // const secretKeyString = await fs.readFile(filePath, {encoding: 'utf8'});
    const secretKeyString = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    return anchor.web3.Keypair.fromSecretKey(secretKey);
}