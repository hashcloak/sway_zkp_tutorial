import json

def bn_format(value):
    """Convert a decimal number to a fixed-length hexadecimal format compatible with Sway."""
    return f'bn("0x{int(value):064x}", "hex")'  # Ensures 64-character hex

def parse_proof(proof_data):
    """Format proof elements into Sway syntax."""
    proof_keys = ["A", "B", "C", "Z", "T1", "T2", "T3", "Wxi", "Wxiw"]
    
    sway_proof = []
    for key in proof_keys:
        x, y, _ = proof_data[key]  # Ignore the third element ("1")
        sway_proof.append(f'    proof_{key}: {{')
        sway_proof.append(f'      x: {bn_format(x)},')
        sway_proof.append(f'      y: {bn_format(y)}')
        sway_proof.append(f'    }},')

    eval_keys = ["eval_a", "eval_b", "eval_c", "eval_s1", "eval_s2", "eval_zw"]
    for key in eval_keys:
        sway_proof.append(f'    {key}: {bn_format(proof_data[key])},')

    # Remove trailing comma on the last element
    if sway_proof[-1].endswith(","):
        sway_proof[-1] = sway_proof[-1][:-1]

    return "\n".join(sway_proof)

def parse_pub_input(public_data):
    """Format public inputs correctly from a JSON array."""
    pub_inputs = [bn_format(value) for value in public_data]
    return ",\n    ".join(pub_inputs)

def generate_sway_code(proof_json, public_json):
    """Generate Sway-formatted proof and public input from JSON files."""
    with open(proof_json, "r") as f:
        proof_data = json.load(f)

    with open(public_json, "r") as f:
        public_data = json.load(f)

    sway_proof = parse_proof(proof_data)
    sway_pub_input = parse_pub_input(public_data)

    sway_code = f"""const proof = {{
{sway_proof}
}};

const pubInput = [
    {sway_pub_input}
];"""

    return sway_code

# Generate and print the Sway code
sway_code = generate_sway_code("proof.json", "public.json")
print(sway_code)
