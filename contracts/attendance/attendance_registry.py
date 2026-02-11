"""
CampusChain — Attendance Registry Smart Contract (PyTeal)

Records verified attendance on Algorand blockchain.
Uses box storage for efficient attendance record management.
"""

from pyteal import *


def approval_program():
    # Global state keys
    admin_key = Bytes("admin")
    total_sessions_key = Bytes("total_sessions")
    total_records_key = Bytes("total_records")

    # Operations
    op_init = Bytes("init")
    op_start_session = Bytes("start_session")
    op_end_session = Bytes("end_session")
    op_record_attendance = Bytes("record_attendance")
    op_get_record = Bytes("get_record")

    @Subroutine(TealType.uint64)
    def is_admin():
        return Txn.sender() == App.globalGet(admin_key)

    # Initialize the contract
    handle_init = Seq(
        App.globalPut(admin_key, Txn.sender()),
        App.globalPut(total_sessions_key, Int(0)),
        App.globalPut(total_records_key, Int(0)),
        Approve(),
    )

    # Start a new attendance session
    # Args: session_id (bytes), course_code (bytes), room (bytes),
    #        geofence_lat (uint64), geofence_lng (uint64), geofence_radius (uint64)
    handle_start_session = Seq(
        Assert(is_admin() | (Txn.sender() == App.globalGet(admin_key))),
        # Store session data in box storage
        # Box name = "session:" + session_id
        App.box_put(
            Concat(Bytes("session:"), Txn.application_args[1]),
            Concat(
                Txn.application_args[2],  # course_code
                Bytes("|"),
                Txn.application_args[3],  # room
                Bytes("|"),
                Itob(Global.latest_timestamp()),  # start_time
                Bytes("|"),
                Bytes("active"),  # status
            ),
        ),
        App.globalPut(
            total_sessions_key, App.globalGet(total_sessions_key) + Int(1)
        ),
        Approve(),
    )

    # End an attendance session
    # Args: session_id (bytes)
    handle_end_session = Seq(
        Assert(is_admin()),
        App.box_put(
            Concat(Bytes("session_status:"), Txn.application_args[1]),
            Bytes("ended"),
        ),
        Approve(),
    )

    # Record attendance
    # Args: session_id, student_id, verification_hash, status
    handle_record_attendance = Seq(
        # Box name = "attendance:" + session_id + ":" + student_id
        App.box_put(
            Concat(
                Bytes("att:"),
                Txn.application_args[1],  # session_id
                Bytes(":"),
                Txn.application_args[2],  # student_id
            ),
            Concat(
                Txn.application_args[3],  # verification_hash
                Bytes("|"),
                Txn.application_args[4],  # status
                Bytes("|"),
                Itob(Global.latest_timestamp()),  # timestamp
            ),
        ),
        App.globalPut(
            total_records_key, App.globalGet(total_records_key) + Int(1)
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
                [Txn.application_args[0] == op_start_session, handle_start_session],
                [Txn.application_args[0] == op_end_session, handle_end_session],
                [
                    Txn.application_args[0] == op_record_attendance,
                    handle_record_attendance,
                ],
            ),
        ],
    )

    return program


def clear_state_program():
    return Approve()


if __name__ == "__main__":
    import os

    # Compile and write TEAL
    approval_teal = compileTeal(approval_program(), mode=Mode.Application, version=8)
    clear_teal = compileTeal(clear_state_program(), mode=Mode.Application, version=8)

    os.makedirs("build", exist_ok=True)

    with open("build/attendance_approval.teal", "w") as f:
        f.write(approval_teal)

    with open("build/attendance_clear.teal", "w") as f:
        f.write(clear_teal)

    print("Attendance contract compiled successfully!")
