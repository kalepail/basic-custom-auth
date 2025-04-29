import { xdr, Keypair, Networks, hash } from "@stellar/stellar-sdk";
import { basicNodeSigner } from "@stellar/stellar-sdk/contract";
import { Server } from "@stellar/stellar-sdk/rpc";
import { Client, type Signature, type Signatures, type SignerKey } from 'hello-world-sdk'

const CONTRACT_ID = 'CBXYCAVTG6ZTZVFTRKNMU7SLZNJ632PEJEHHMMF7Q6664YHTFQXLBJP3'

const rpcUrl = "https://soroban-testnet.stellar.org";
const rpc = new Server(rpcUrl);

const keypair = Keypair.fromSecret('SABZEN64W566LAY4Q7BNDRG7SCSU76SZ53PNFWKUDLE77IFFKJVQ2A2T')
const pubkey = keypair.publicKey();

const contract = new Client({
    publicKey: pubkey,
    contractId: CONTRACT_ID,
    rpcUrl,
    networkPassphrase: Networks.TESTNET,
    signTransaction: basicNodeSigner(keypair, Networks.TESTNET).signTransaction,
})

const at = await contract.hello({ to: 'Dev' })

const { sequence } = await rpc.getLatestLedger()

await at.signAuthEntries({
    address: CONTRACT_ID,
    authorizeEntry: async (entry) => {
        const auth = xdr.SorobanAuthorizationEntry.fromXDR(entry.toXDR())

        auth.credentials().address().signatureExpirationLedger(sequence + 60)

        const preimage = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
            new xdr.HashIdPreimageSorobanAuthorization({
                networkId: hash(Buffer.from(Networks.TESTNET)),
                nonce: auth.credentials().address().nonce(),
                signatureExpirationLedger: auth.credentials().address().signatureExpirationLedger(),
                invocation: auth.rootInvocation()
            })
        )

        const payload = hash(preimage.toXDR())

        const signature = contract.spec.nativeToScVal(
            [new Map([[
                { tag: "Ed25519", values: [keypair.rawPublicKey()] } as SignerKey,
                { tag: "Ed25519", values: [keypair.sign(payload)] } as Signature
            ]])] as Signatures,
            xdr.ScSpecTypeDef.scSpecTypeUdt(
                new xdr.ScSpecTypeUdt({ name: "Signatures" }),
            )
        );

        auth.credentials().address().signature(signature)

        return auth
    }
})

await at.simulate()

const res = await at.signAndSend()

console.log(res.getTransactionResponse?.status, res.getTransactionResponse?.txHash);