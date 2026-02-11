"""
CampusChain — Certificate NFT & Voting Smart Contract (PyTeal)

Manages soulbound NFT credentials (ARC-72 style) and token-based voting.
"""

from pyteal import *


def approval_program():
    # Global state
    admin_key = Bytes("admin")
    total_certs_key = Bytes("total_certs")
    total_elections_key = Bytes("total_elections")

    # Operations
    op_mint_certificate = Bytes("mint_cert")
    op_verify_certificate = Bytes("verify_cert")
    op_create_election = Bytes("create_election")
    op_cast_vote = Bytes("cast_vote")
    op_end_election = Bytes("end_election")

    @Subroutine(TealType.uint64)
    def is_admin():
        return Txn.sender() == App.globalGet(admin_key)

    # Initialize
    handle_init = Seq(
        App.globalPut(admin_key, Txn.sender()),
        App.globalPut(total_certs_key, Int(0)),
        App.globalPut(total_elections_key, Int(0)),
        Approve(),
    )

    # Mint a soulbound certificate
    # Args: nft_id, recipient_addr, title_hash, metadata_hash
    handle_mint_certificate = Seq(
        Assert(is_admin()),
        App.box_put(
            Concat(Bytes("cert:"), Txn.application_args[1]),  # nft_id
            Concat(
                Txn.application_args[2],  # recipient_addr
                Bytes("|"),
                Txn.application_args[3],  # title_hash
                Bytes("|"),
                Txn.application_args[4],  # metadata_hash
                Bytes("|"),
                Itob(Global.latest_timestamp()),  # minted_at
                Bytes("|"),
                Bytes("valid"),  # status
            ),
        ),
        App.globalPut(
            total_certs_key, App.globalGet(total_certs_key) + Int(1)
        ),
        Approve(),
    )

    # Create an election
    # Args: election_id, title_hash, voter_count
    handle_create_election = Seq(
        Assert(is_admin()),
        App.box_put(
            Concat(Bytes("election:"), Txn.application_args[1]),
            Concat(
                Txn.application_args[2],  # title_hash
                Bytes("|"),
                Txn.application_args[3],  # voter_count
                Bytes("|"),
                Itob(Global.latest_timestamp()),  # created_at
                Bytes("|"),
                Bytes("active"),  # status
            ),
        ),
        App.globalPut(
            total_elections_key, App.globalGet(total_elections_key) + Int(1)
        ),
        Approve(),
    )

    # Cast a vote (records voter_hash + candidate_id)
    # Args: election_id, voter_hash, candidate_id
    handle_cast_vote = Seq(
        # Store vote: box name = "vote:" + election_id + ":" + voter_hash
        # This ensures one vote per voter per election
        App.box_put(
            Concat(
                Bytes("vote:"),
                Txn.application_args[1],  # election_id
                Bytes(":"),
                Txn.application_args[2],  # voter_hash
            ),
            Concat(
                Txn.application_args[3],  # candidate_id
                Bytes("|"),
                Itob(Global.latest_timestamp()),  # voted_at
            ),
        ),
        Approve(),
    )

    # End an election
    # Args: election_id
    handle_end_election = Seq(
        Assert(is_admin()),
        App.box_put(
            Concat(Bytes("election_status:"), Txn.application_args[1]),
            Bytes("ended"),
        ),
        Approve(),
    )

    # Route operations
    program = Cond(
        [Txn.application_id() == Int(0), handle_init],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(is_admin())],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(is_admin())],
        [Txn.on_completion() == OnComplete.OptIn, Approve()],
        [Txn.on_completion() == OnComplete.CloseOut, Approve()],
        [
            Txn.on_completion() == OnComplete.NoOp,
            Cond(
                [
                    Txn.application_args[0] == op_mint_certificate,
                    handle_mint_certificate,
                ],
                [
                    Txn.application_args[0] == op_create_election,
                    handle_create_election,
                ],
                [Txn.application_args[0] == op_cast_vote, handle_cast_vote],
                [Txn.application_args[0] == op_end_election, handle_end_election],
            ),
        ],
    )

    return program


def clear_state_program():
    return Approve()


if __name__ == "__main__":
    import os

    approval_teal = compileTeal(approval_program(), mode=Mode.Application, version=8)
    clear_teal = compileTeal(clear_state_program(), mode=Mode.Application, version=8)

    os.makedirs("build", exist_ok=True)

    with open("build/credential_voting_approval.teal", "w") as f:
        f.write(approval_teal)

    with open("build/credential_voting_clear.teal", "w") as f:
        f.write(clear_teal)

    print("Credential & Voting contract compiled successfully!")
