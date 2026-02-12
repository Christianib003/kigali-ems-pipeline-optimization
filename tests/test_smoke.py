def test_smoke_basic_math():
    """A tiny smoke test to confirm pytest is set up correctly."""
    assert 1 + 1 == 2


def test_project_root_exists():
    """Confirm we are running tests from a valid project checkout."""
    import os

    assert os.path.exists("README.md")
