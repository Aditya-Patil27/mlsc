"""
CampusChain — Compile All Smart Contracts

Compiles all three PyTeal contracts into TEAL files:
  1. Attendance Registry
  2. Health Credential
  3. Certificate & Voting

Usage:
    pip install pyteal
    python compile_all.py
"""

import os
import sys

# Ensure we can import from subdirectories
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pyteal import compileTeal, Mode


def compile_contract(name, approval_func, clear_func, output_dir):
    """Compile a single contract and write TEAL files."""
    approval_teal = compileTeal(approval_func(), mode=Mode.Application, version=8)
    clear_teal = compileTeal(clear_func(), mode=Mode.Application, version=8)

    approval_path = os.path.join(output_dir, f"{name}_approval.teal")
    clear_path = os.path.join(output_dir, f"{name}_clear.teal")

    with open(approval_path, "w") as f:
        f.write(approval_teal)

    with open(clear_path, "w") as f:
        f.write(clear_teal)

    print(f"  ✅ {name}")
    print(f"     → {approval_path}")
    print(f"     → {clear_path}")


def main():
    # Create build directory
    build_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "build")
    os.makedirs(build_dir, exist_ok=True)

    print("=" * 60)
    print("  CampusChain — Smart Contract Compiler")
    print("=" * 60)
    print()

    # 1. Attendance Registry
    print("📍 Compiling Attendance Registry...")
    from attendance.attendance_registry import approval_program as att_approval
    from attendance.attendance_registry import clear_state_program as att_clear
    compile_contract("attendance", att_approval, att_clear, build_dir)
    print()

    # 2. Health Credential
    print("🏥 Compiling Health Credential...")
    from health.health_credential import approval_program as health_approval
    from health.health_credential import clear_state_program as health_clear
    compile_contract("health", health_approval, health_clear, build_dir)
    print()

    # 3. Certificate & Voting
    print("🎓 Compiling Certificate & Voting...")
    from credentials.certificate_voting import approval_program as cred_approval
    from credentials.certificate_voting import clear_state_program as cred_clear
    compile_contract("credential_voting", cred_approval, cred_clear, build_dir)
    print()

    print("=" * 60)
    print(f"  All contracts compiled successfully!")
    print(f"  Output: {build_dir}")
    print("=" * 60)


if __name__ == "__main__":
    main()
