import { bn, Provider, Wallet } from "fuels"
import proof_json from "./proof.json"
import publicSignals from "./public.json"
import { SwayZkpExampleFactory } from "./fuels-out"

const main = async () => {

  const PROVIDER_URL = "http://127.0.0.1:4000/v1/graphql"
  // Default funded account on local fuel-core
  const PRIVATE_KEY = "0xde97d8624a438121b86a1956544bd72ed68cd69f2c99555b08b1e8c51ffd511c"

  const provider = new Provider(PROVIDER_URL);
  const wallet = Wallet.fromPrivateKey(PRIVATE_KEY, provider);

  const factory = new SwayZkpExampleFactory(wallet);
  const { contract } = await (await factory.deploy()).waitForResult()

  switch (proof_json.protocol) {
    case "groth16":
      {
        const a = proof_json.pi_a.map((v) => {
          return bn(v);
        }).slice(0, 2)

        const b = proof_json.pi_b.map((v) => {
          return v.toReversed().map((v) => {
            return bn(v);
          })
        }).slice(0, 2)

        const c = proof_json.pi_c.map((v) => {
          return bn(v);
        }).slice(0, 2)

        const publicSignalBN = publicSignals.map((v) => {
          return bn(v);
        })

        const { waitForResult } = await contract.functions.verify(a, b, c, publicSignalBN).call();
        const res = await waitForResult();
        console.log("result is: ", res.value);
        break;
      }
    case "plonk":
      {
        const proof_A = {
          x: proof_json.A[0],
          y: proof_json.A[1],
        };
        const proof_B = {
          x: proof_json.B[0],
          y: proof_json.B[1],
        };
        const proof_C = {
          x: proof_json.C[0],
          y: proof_json.C[1],
        };
        const proof_Z = {
          x: proof_json.Z[0],
          y: proof_json.Z[1],
        };
        const proof_T1 = {
          x: proof_json.T1[0],
          y: proof_json.T1[1],
        };

        const proof_T2 = {
          x: proof_json.T2[0],
          y: proof_json.T2[1],
        };
        const proof_T3 = {
          x: proof_json.T3[0],
          y: proof_json.T3[1],
        };
        const proof_Wxi = {
          x: proof_json.Wxi[0],
          y: proof_json.Wxi[1],
        };
        const proof_Wxiw = {
          x: proof_json.Wxiw[0],
          y: proof_json.Wxiw[1],
        };
        const eval_a = bn(proof_json.eval_a);
        const eval_b = bn(proof_json.eval_b);
        const eval_c = bn(proof_json.eval_c);
        const eval_s1 = bn(proof_json.eval_s1);
        const eval_s2 = bn(proof_json.eval_s2);
        const eval_zw = bn(proof_json.eval_zw);
        const proof = {
          proof_A,
          proof_B,
          proof_C,
          proof_Z,
          proof_T1,
          proof_T2,
          proof_T3,
          proof_Wxi,
          proof_Wxiw,
          eval_a,
          eval_b,
          eval_c,
          eval_s1,
          eval_s2,
          eval_zw
        };
        const pubInput = publicSignals.map((v) => {
          return bn(v);
        });
        const { waitForResult } = await contract.functions.verify(proof, pubInput).call();
        const { value } = await waitForResult();
        console.log("result is:", value);
        break;
      }
    case "fflonk":
      {
        const C1 = {
          x: proof_json.polynomials.C1[0],
          y: proof_json.polynomials.C1[1],
        };
        const C2 = {
          x: proof_json.polynomials.C2[0],
          y: proof_json.polynomials.C2[1],
        };
        const W = {
          x: proof_json.polynomials.W1[0],
          y: proof_json.polynomials.W1[1],
        };
        const W_dash = {
          x: proof_json.polynomials.W2[0],
          y: proof_json.polynomials.W2[1],
        };
        const q_L = { x: bn(proof_json.evaluations.ql) };
        const q_R = { x: bn(proof_json.evaluations.qr) };
        const q_M = { x: bn(proof_json.evaluations.qm) };
        const q_O = { x: bn(proof_json.evaluations.qo) };
        const q_C = { x: bn(proof_json.evaluations.qc) };
        const S_sigma_1 = { x: bn(proof_json.evaluations.s1) };
        const S_sigma_2 = { x: bn(proof_json.evaluations.s2) };
        const S_sigma_3 = { x: bn(proof_json.evaluations.s3) };
        const a = { x: bn(proof_json.evaluations.a) };
        const b = { x: bn(proof_json.evaluations.b) };
        const c = { x: bn(proof_json.evaluations.c) };
        const z = { x: bn(proof_json.evaluations.z) };
        const z_omega = { x: bn(proof_json.evaluations.zw) };
        const T_1_omega = { x: bn(proof_json.evaluations.t1w) };
        const T_2_omega = { x: bn(proof_json.evaluations.t2w) };
        const batch_inv = { x: bn(proof_json.evaluations.inv) };
        const proof = {
          C1,
          C2,
          W,
          W_dash,
          q_L,
          q_R,
          q_M,
          q_O,
          q_C,
          S_sigma_1,
          S_sigma_2,
          S_sigma_3,
          a,
          b,
          c,
          z,
          z_omega,
          T_1_omega,
          T_2_omega,
          batch_inv,
        };
        const pubInput = publicSignals.map((v) => {
          return bn(v);
        })
        const { waitForResult } = await contract.functions.verify(proof, pubInput).call();
        const { value } = await waitForResult();
        console.log("result is:", value);
        break;
      }
    default:
      console.log("verifier not supported")

  }
}

main();