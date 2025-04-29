#![no_std]
use soroban_sdk::{
    auth::{Context, CustomAccountInterface},
    contract, contracterror, contractimpl, contracttype,
    crypto::Hash,
    vec, BytesN, Env, Map, String, Vec,
};

mod test;

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn hello(env: Env, to: String) -> Vec<String> {
        env.current_contract_address().require_auth();
        vec![&env, String::from_str(&env, "Hello"), to]
    }
}

#[contracterror]
#[derive(Copy, Clone, Debug, PartialEq)]
pub enum Errors {
    TooFewSignatures = 1,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum SignerKey {
    Ed25519(BytesN<32>),
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum Signature {
    Ed25519(BytesN<64>),
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Signatures(pub Map<SignerKey, Signature>);

#[contractimpl]
impl CustomAccountInterface for Contract {
    type Error = Errors;
    type Signature = Signatures;

    #[allow(non_snake_case)]
    fn __check_auth(
        env: Env,
        signature_payload: Hash<32>,
        signatures: Signatures,
        _auth_contexts: Vec<Context>,
    ) -> Result<(), Errors> {
        if signatures.0.len() < 1 {
            return Err(Errors::TooFewSignatures);
        }

        for signature in signatures.0.iter() {
            let public_key = match signature.0 {
                SignerKey::Ed25519(ref key) => key,
            };
            let signature = match signature.1 {
                Signature::Ed25519(ref sig) => sig,
            };

            env.crypto()
                .ed25519_verify(public_key, &signature_payload.clone().into(), signature);
        }

        Ok(())
    }
}
