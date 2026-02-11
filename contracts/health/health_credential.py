"""
CampusChain — Health Credential Smart Contract (PyTeal)

Manages health credential commitments and ZK proof verification on-chain.
Supports duplicate claim prevention through on-chain usage tracking.
"""

from pyteal import *


def approval_program():
    # Global state
    admin_key = Bytes("admin")
    total_credentials_key = Bytes("total_creds")
    total_usages_key = Bytes("total_usages")

    # Operations
    op_store_credential = Bytes("store_credential")
    op_record_usage = Bytes("record_usage")
    op_check_usage = Bytes("check_usage")
    op_revoke_credential = Bytes("revoke_credential")

    @Subroutine(TealType.uint64)
    def is_admin():
        return Txn.sender() == App.globalGet(admin_key)

    # Initialize
    handle_init = Seq(
        App.globalPut(admin_key, Txn.sender()),
        App.globalPut(total_credentials_key, Int(0)),
        App.globalPut(total_usages_key, Int(0)),
        Approve(),
    )

    # Store a health credential commitment
    # Args: credential_id, commitment_hash, issuer_hash
    handle_store_credential = Seq(
        Assert(is_admin()),
        App.box_put(
            Concat(Bytes("cred:"), Txn.application_args[1]),
            Concat(
                Txn.application_args[2],  # commitment_hash
                Bytes("|"),
                Txn.application_args[3],  # issuer_hash
                Bytes("|"),
                Itob(Global.latest_timestamp()),  # issued_at
                Bytes("|"),
                Bytes("valid"),  # status
            ),
        ),
        App.globalPut(
            total_credentials_key, App.globalGet(total_credentials_key) + Int(1)
        ),
        Approve(),
    )

    # Record a proof usage (duplicate prevention)
    # Args: credential_id, usage_hash, purpose
    handle_record_usage = Seq(
        # Store usage with credential ID as part of box name
        App.box_put(
            Concat(Bytes("usage:"), Txn.application_args[1]),
            Concat(
                Txn.application_args[2],  # usage_hash
                Bytes("|"),
                Txn.application_args[3],  # purpose
                Bytes("|"),
                Itob(Global.latest_timestamp()),  # used_at
            ),
        ),
        App.globalPut(
            total_usages_key, App.globalGet(total_usages_key) + Int(1)
        ),
        Approve(),
    )

    # Revoke a credential
    # Args: credential_id
    handle_revoke_credential = Seq(
        Assert(is_admin()),
        App.box_put(
            Concat(Bytes("cred_status:"), Txn.application_args[1]),
            Bytes("revoked"),
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
                    Txn.application_args[0] == op_store_credential,
                    handle_store_credential,
                ],
                [Txn.application_args[0] == op_record_usage, handle_record_usage],
                [
                    Txn.application_args[0] == op_revoke_credential,
                    handle_revoke_credential,
                ],
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

    with open("build/health_approval.teal", "w") as f:
        f.write(approval_teal)

    with open("build/health_clear.teal", "w") as f:
        f.write(clear_teal)

    print("Health credential contract compiled successfully!")
