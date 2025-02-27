contract;

mod lib;
use lib::{PlonkVerifier, Proof};

impl PlonkVerifier for Contract {
  fn verify(proof: Proof, pub_signal: [u256;1]) -> bool {
      proof.verify(pub_signal)
  }
}
