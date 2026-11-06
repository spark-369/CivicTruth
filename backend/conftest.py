"""Root-level pytest configuration.

Ensures the ``backend`` directory is importable so test modules can
``import app`` regardless of where pytest is invoked from.
"""

import os
import sys

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
